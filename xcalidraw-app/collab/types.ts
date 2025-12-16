/**
 * Minimal socket interface for collaboration
 * Compatible with both Socket.IO and native WebSocket implementations
 */
export interface CollabSocket {
  id: string | null;
  connected: boolean;
  on(event: string, handler: (...args: any[]) => void): this;
  off(event: string, handler?: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): this;
  close(): void;
}
