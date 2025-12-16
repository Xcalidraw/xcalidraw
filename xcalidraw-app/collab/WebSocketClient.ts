/**
 * WebSocket client that mimics Socket.IO interface
 * for compatibility with existing Portal.tsx implementation
 */

import type { CollabSocket } from './types';

type EventHandler = (...args: any[]) => void;

export class WebSocketClient implements CollabSocket {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private url: string = "";
  public id: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: number | null = null;

  constructor() {}

  /**
   * Connect to WebSocket server
   * @param url WebSocket URL (e.g., wss://abc123.execute-api.us-east-1.amazonaws.com/production)
   * @param boardId Board ID to join
   */
  connect(url: string, boardId: string): WebSocket {
    this.url = `${url}?boardId=${boardId}`;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("[WebSocket] Connected");
      this.reconnectAttempts = 0;
      
      // Emit connect event to mimic Socket.IO
      this.trigger("connect");
      
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
      this.trigger("connect_error", error);
    };

    this.ws.onclose = () => {
      console.log("[WebSocket] Disconnected");
      this.trigger("disconnect");
      this.attemptReconnect(boardId);
    };

    return this.ws;
  }

  /**
   * Handle incoming messages from server
   */
  private handleMessage(event: MessageEvent) {
    // Backend sends either:
    // 1. JSON control messages (string): {type: "init-room", ...}
    // 2. Binary encrypted data (ArrayBuffer/Blob): raw encrypted buffer
    
    // Check data type FIRST before any parsing
    if (event.data instanceof ArrayBuffer) {
      // Binary encrypted data from backend - raw encrypted buffer
      console.log("[WebSocket] Received binary data:", event.data.byteLength, "bytes");
      
      // Backend sends just the encrypted buffer
      // We need IV separately but for now, trigger the event
      // Portal's client-broadcast handler expects (encryptedData: ArrayBuffer, iv: Uint8Array)
      // TODO: Backend should send IV separately or we need a different protocol
      const dummyIv = new Uint8Array(16); // Temporary - need proper IV
      this.trigger("client-broadcast", event.data, dummyIv);
      return;
    }
    
    if (event.data instanceof Blob) {
      // Convert Blob to ArrayBuffer
      console.log("[WebSocket] Received blob data:", event.data.size, "bytes");
      event.data.arrayBuffer().then(buffer => {
        const dummyIv = new Uint8Array(16);
        this.trigger("client-broadcast", buffer, dummyIv);
      });
      return;
    }
    
    // String data - parse as JSON
    if (typeof event.data === 'string') {
      try {
        const message = JSON.parse(event.data);
        const { type, ...data } = message;

        // Log message for debugging (only first time or periodically)
        if (!type) {
          console.warn("[WebSocket] Message without type:", message);
        }

        switch (type) {
          case "init-room":
            console.log("[WebSocket] Room initialized");
            this.trigger("init-room");
            break;

          case "new-user":
            console.log("[WebSocket] New user joined:", data.connectionId);
            this.trigger("new-user", data.connectionId);
            break;

          case "room-user-change":
            // Only log occasionally to avoid spam
            if (Math.random() < 0.1) {
              console.log("[WebSocket] Room users updated, count:", data.connections?.length || 0);
            }
            this.trigger("room-user-change", data.connections);
            break;

          case "encrypted-collaboration":
            // Decode base64 encrypted data and IV
            const encryptedBuffer = Uint8Array.from(atob(data.encryptedBuffer), c => c.charCodeAt(0));
            const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
            
            // Only log occasionally to avoid spam
            if (Math.random() < 0.01) {
              console.log("[WebSocket] Encrypted message received");
            }
            this.trigger("client-broadcast", encryptedBuffer.buffer, iv);
            break;

          case "first-in-room":
            // Fargate server sends this when user is first in room
            console.log("[WebSocket] First in room - loading scene from Firebase");
            this.trigger("first-in-room");
            break;

          case undefined:
            // Silently ignore messages without type (might be control messages)
            break;

          default:
            console.warn("[WebSocket] Unknown message type:", type, message);
        }
      } catch (error) {
        console.error("[WebSocket] Failed to parse JSON message:", error, event.data.substring(0, 100));
      }
      return;
    }
    
    console.warn("[WebSocket] Unknown data type:", typeof event.data, event.data);
  }

  /**
   * Register event handler (mimics Socket.IO .on())
   */
  on(event: string, handler: EventHandler): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
    return this;
  }

  /**
   * Remove event handler (mimics Socket.IO .off())
   */
  off(event: string, handler?: EventHandler): this {
    if (!handler) {
      // Remove all handlers for this event
      this.eventHandlers.delete(event);
    } else {
      // Remove specific handler
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
    return this;
  }

  /**
   * Emit event to server (mimics Socket.IO .emit())
   */
  emit(event: string, ...args: any[]): this {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[WebSocket] Cannot emit, not connected");
      return this;
    }

    const message = {
      action: this.mapEventToAction(event),
      data: args.length === 1 ? args[0] : args,
    };

    this.ws.send(JSON.stringify(message));
    return this;
  }

  /**
   * Map Socket.IO event names to WebSocket actions
   */
  private mapEventToAction(event: string): string {
    const eventMap: Record<string, string> = {
      "join-room": "join-room",
      "server": "message",
      "server-volatile": "message",
    };

    return eventMap[event] || event;
  }

  /**
   * Trigger event handlers
   */
  private trigger(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.id = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(boardId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = window.setTimeout(() => {
      const wsUrl = this.url.split("?")[0];
      this.connect(wsUrl, boardId);
    }, delay);
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default WebSocketClient;
