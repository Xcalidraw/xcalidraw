import {
  CaptureUpdateAction,
  getSceneVersion,
  restoreElements,
  zoomToFitBounds,
  reconcileElements,
} from "@xcalidraw/xcalidraw";
import { ErrorDialog } from "@xcalidraw/xcalidraw/components/ErrorDialog";
import { APP_NAME, EVENT } from "@xcalidraw/common";
import {
  IDLE_THRESHOLD,
  ACTIVE_THRESHOLD,
  UserIdleState,
  assertNever,
  isDevEnv,
  isTestEnv,
  preventUnload,
  resolvablePromise,
  throttleRAF,
} from "@xcalidraw/common";
import { decryptData } from "@xcalidraw/xcalidraw/data/encryption";
import { getVisibleSceneBounds } from "@xcalidraw/element";
import { newElementWith } from "@xcalidraw/element";
import { isImageElement, isInitializedImageElement } from "@xcalidraw/element";
import { AbortError } from "@xcalidraw/xcalidraw/errors";
import { t } from "@xcalidraw/xcalidraw/i18n";
import { withBatchedUpdates } from "@xcalidraw/xcalidraw/reactUtils";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { toast } from "sonner";
import throttle from "lodash.throttle";
import { PureComponent } from "react";

import type { Mutable, ValueOf } from "@xcalidraw/common/utility-types";
import type { ImportedDataState } from "@xcalidraw/xcalidraw/data/types";
import type {
  ReconciledXcalidrawElement,
  RemoteXcalidrawElement,
} from "@xcalidraw/xcalidraw/data/reconcile";
import type {
  XcalidrawElement,
  FileId,
  InitializedXcalidrawImageElement,
  OrderedXcalidrawElement,
} from "@xcalidraw/element/types";
import type {
  BinaryFileData,
  XcalidrawImperativeAPI,
  SocketId,
  Collaborator,
  Gesture,
} from "@xcalidraw/xcalidraw/types";

import { appJotaiStore, atom } from "../app-jotai";

import {
  INITIAL_SCENE_UPDATE_TIMEOUT,
  LOAD_IMAGES_TIMEOUT,
  CURSOR_SYNC_TIMEOUT,
  FILE_UPLOAD_MAX_BYTES,
  SYNC_FULL_SCENE_INTERVAL_MS,
  WS_EVENTS,
} from "../app_constants";

import {
  generateCollaborationLinkData,
  getCollaborationLink,
  getSyncableElements,
} from "../data";
import {
  encodeFilesForUpload,
  FileManager,
  updateStaleImageStatuses,
} from "../data/FileManager";
import { LocalData } from "../data/LocalData";

import { loadFilesFromBackend, saveFilesToBackend } from "../data/files";
import { getClient } from "../api/api-client";
import {
  importUsernameFromLocalStorage,
  saveUsernameToLocalStorage,
} from "../data/localStorage";
import { resetBrowserStateVersions } from "../data/tabSync";

import Portal from "./Portal";

import { collabErrorIndicatorAtom } from "./CollabError";

import type { SocketUpdateDataSource, SyncableXcalidrawElement } from "../data";

export const collabAPIAtom = atom<CollabAPI | null>(null);
export const isCollaboratingAtom = atom(false);
export const isOfflineAtom = atom(false);

interface CollabState {
  errorMessage: string | null;
  /** errors related to saving */
  dialogNotifiedErrors: Record<string, boolean>;
  username: string;
  activeRoomLink: string | null;
}

export const activeRoomLinkAtom = atom<string | null>(null);

type CollabInstance = InstanceType<typeof Collab>;

export interface CollabAPI {
  /** function so that we can access the latest value from stale callbacks */
  isCollaborating: () => boolean;
  onPointerUpdate: CollabInstance["onPointerUpdate"];
  startCollaboration: CollabInstance["startCollaboration"];
  stopCollaboration: CollabInstance["stopCollaboration"];
  syncElements: CollabInstance["syncElements"];
  fetchImageFilesFromBackend: CollabInstance["fetchImageFilesFromBackend"];
  setUsername: CollabInstance["setUsername"];
  getUsername: CollabInstance["getUsername"];
  getActiveRoomLink: CollabInstance["getActiveRoomLink"];
  setCollabError: CollabInstance["setErrorDialog"];
}

interface CollabProps {
  xcalidrawAPI: XcalidrawImperativeAPI;
}

class Collab extends PureComponent<CollabProps, CollabState> {
  portal: Portal;
  fileManager: FileManager;
  xcalidrawAPI: CollabProps["xcalidrawAPI"];
  activeIntervalId: number | null;
  idleTimeoutId: number | null;

  private socketInitializationTimer?: number;
  private lastBroadcastedOrReceivedSceneVersion: number = -1;
  private collaborators = new Map<SocketId, Collaborator>();

  // Yjs State
  private doc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private yElementsMap: Y.Map<any> | null = null;

  // Connection status toast management
  private connectionToastId = 'connection-status';
  private reconnectToastTimeoutId: number | null = null;
  private lastConnectionStatus: string | null = null;
  private hasBeenConnected = false; // Track if we've ever successfully connected
  private hasHadDisconnection = false; // Only show "Connected" toast after a disconnection

  constructor(props: CollabProps) {
    super(props);
    this.state = {
      errorMessage: null,
      dialogNotifiedErrors: {},
      username: importUsernameFromLocalStorage() || "",
      activeRoomLink: null,
    };
    this.portal = new Portal(this);
    this.fileManager = new FileManager({
      getFiles: async (fileIds) => {
        const { roomId, roomKey } = this.portal;
        if (!roomId || !roomKey) {
          throw new AbortError();
        }

        return loadFilesFromBackend(roomId, roomKey, fileIds);
      },
      saveFiles: async ({ addedFiles }) => {
        const { roomId, roomKey } = this.portal;
        if (!roomId || !roomKey) {
          throw new AbortError();
        }

        const { savedFiles, erroredFiles } = await saveFilesToBackend({
          boardId: roomId,
          files: await encodeFilesForUpload({
            files: addedFiles,
            encryptionKey: roomKey,
            maxBytes: FILE_UPLOAD_MAX_BYTES,
          }),
        });

        return {
          savedFiles: savedFiles.reduce(
            (acc: Map<FileId, BinaryFileData>, id) => {
              const fileData = addedFiles.get(id);
              if (fileData) {
                acc.set(id, fileData);
              }
              return acc;
            },
            new Map(),
          ),
          erroredFiles: erroredFiles.reduce(
            (acc: Map<FileId, BinaryFileData>, id) => {
              const fileData = addedFiles.get(id);
              if (fileData) {
                acc.set(id, fileData);
              }
              return acc;
            },
            new Map(),
          ),
        };
      },
    });
    this.xcalidrawAPI = props.xcalidrawAPI;
    this.activeIntervalId = null;
    this.idleTimeoutId = null;
  }

  private onUmmount: (() => void) | null = null;

  componentDidMount() {
    window.addEventListener(EVENT.BEFORE_UNLOAD, this.beforeUnload);
    window.addEventListener("online", this.onOfflineStatusToggle);
    window.addEventListener("offline", this.onOfflineStatusToggle);
    window.addEventListener(EVENT.UNLOAD, this.onUnload);
    window.addEventListener(EVENT.VISIBILITY_CHANGE, this.onVisibilityChange);

    const unsubOnUserFollow = this.xcalidrawAPI.onUserFollow((payload) => {
      this.portal.socket && this.portal.broadcastUserFollowed(payload);
    });
    const throttledRelayUserViewportBounds = throttleRAF(
      this.relayVisibleSceneBounds,
    );
    const unsubOnScrollChange = this.xcalidrawAPI.onScrollChange(() =>
      throttledRelayUserViewportBounds(),
    );
    this.onUmmount = () => {
      unsubOnUserFollow();
      unsubOnScrollChange();
    };

    this.onOfflineStatusToggle();

    const collabAPI: CollabAPI = {
      isCollaborating: this.isCollaborating,
      onPointerUpdate: this.onPointerUpdate,
      startCollaboration: this.startCollaboration,
      syncElements: this.syncElements,
      fetchImageFilesFromBackend: this.fetchImageFilesFromBackend,
      stopCollaboration: this.stopCollaboration,
      setUsername: this.setUsername,
      getUsername: this.getUsername,
      getActiveRoomLink: this.getActiveRoomLink,
      setCollabError: this.setErrorDialog,
    };

    appJotaiStore.set(collabAPIAtom, collabAPI);

    if (isTestEnv() || isDevEnv()) {
      window.collab = window.collab || ({} as Window["collab"]);
      Object.defineProperties(window, {
        collab: {
          configurable: true,
          value: this,
        },
      });
    }
  }

  onOfflineStatusToggle = () => {
    appJotaiStore.set(isOfflineAtom, !window.navigator.onLine);
  };

  componentWillUnmount() {
    window.removeEventListener("online", this.onOfflineStatusToggle);
    window.removeEventListener("offline", this.onOfflineStatusToggle);
    window.removeEventListener(EVENT.BEFORE_UNLOAD, this.beforeUnload);
    window.removeEventListener(EVENT.UNLOAD, this.onUnload);
    window.removeEventListener(EVENT.POINTER_MOVE, this.onPointerMove);
    window.addEventListener(
      EVENT.VISIBILITY_CHANGE,
      this.onVisibilityChange,
    );
    if (this.activeIntervalId) {
      window.clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    }
    if (this.idleTimeoutId) {
      window.clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
    this.onUmmount?.();
  }

  isCollaborating = () => appJotaiStore.get(isCollaboratingAtom)!;

  private setIsCollaborating = (isCollaborating: boolean) => {
    appJotaiStore.set(isCollaboratingAtom, isCollaborating);
  };

  private onUnload = () => {
    this.destroySocketClient({ isUnload: true });
  };

  private beforeUnload = withBatchedUpdates((event: BeforeUnloadEvent) => {
    const syncableElements = getSyncableElements(
      this.getSceneElementsIncludingDeleted(),
    );

    if (
      this.isCollaborating() &&
      this.fileManager.shouldPreventUnload(syncableElements)
    ) {
      // this won't run in time if user decides to leave the site, but
      //  the purpose is to run in immediately after user decides to stay
      this.saveCollabRoomToBackend(syncableElements);

      if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
        preventUnload(event);
      } else {
        console.warn(
          "preventing unload disabled (VITE_APP_DISABLE_PREVENT_UNLOAD)",
        );
      }
    }
  });

  saveCollabRoomToBackend = async (
    syncableElements: readonly SyncableXcalidrawElement[],
  ) => {
    try {
      const { roomId } = this.portal;
      if (!roomId || !this.isCollaborating()) return;

      // SAFETY: Never save empty elements - this would wipe user data
      // Only save if we have actual content
      if (syncableElements.length === 0) {
        console.warn("[Collab] Skipping save - no elements to save");
        return;
      }

      // If Yjs is active, Fargate handles persistence. Do NOT save from client to avoid overwrite.
      if (this.provider) {
          // console.log("Yjs active - skipping REST API save");
          return;
      }

      const client = getClient();
      const appState = this.xcalidrawAPI.getAppState();
      const payload: any = {
        elements: syncableElements,
      };
      if (appState.name) {
          payload.title = appState.name;
      }
      
      
      // Check for magic link token
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
          // Use public update endpoint with token
          await (client as any).updateBoardPublic({ boardId: roomId, token }, payload);
      } else {
          await client.updateBoard(roomId, payload);
      }

      this.resetErrorIndicator();
    } catch (error: any) {
      // Handle 403 Forbidden (View-only user trying to save)
      if (error.response?.status === 403 || error.message?.includes('403')) {
          toast.error("You don't have permission to edit this board (View Only)");
          return;
      }

      const errorMessage = t("errors.collabSaveFailed");

      if (
        !this.state.dialogNotifiedErrors[errorMessage] ||
        !this.isCollaborating()
      ) {
        this.setErrorDialog(errorMessage);
        this.setState({
          dialogNotifiedErrors: {
            ...this.state.dialogNotifiedErrors,
            [errorMessage]: true,
          },
        });
      }

      if (this.isCollaborating()) {
        this.setErrorIndicator(errorMessage);
      }

      console.error(error);
    }
  };

  stopCollaboration = (keepRemoteState = true) => {
    this.queueSaveToBackend.cancel();
    this.loadImageFiles.cancel();
    this.resetErrorIndicator(true);

    this.saveCollabRoomToBackend(
      getSyncableElements(this.xcalidrawAPI.getSceneElementsIncludingDeleted()),
    );

    if (this.portal.socket && this.fallbackInitializationHandler) {
      this.portal.socket.off(
        "connect_error",
        this.fallbackInitializationHandler,
      );
    }

    if (!keepRemoteState) {
      LocalData.fileStorage.reset();
      this.destroySocketClient();
    } else if (window.confirm(t("alerts.collabStopOverridePrompt"))) {
      // hack to ensure that we prefer we disregard any new browser state
      // that could have been saved in other tabs while we were collaborating
      resetBrowserStateVersions();

      window.history.pushState({}, APP_NAME, window.location.origin);
      this.destroySocketClient();

      LocalData.fileStorage.reset();

      const elements = this.xcalidrawAPI
        .getSceneElementsIncludingDeleted()
        .map((element) => {
          if (isImageElement(element) && element.status === "saved") {
            return newElementWith(element, { status: "pending" });
          }
          return element;
        });

      this.xcalidrawAPI.updateScene({
        elements,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    }
  };

  private destroySocketClient = (opts?: { isUnload: boolean }) => {
    this.lastBroadcastedOrReceivedSceneVersion = -1;
    
    // Clean up reconnection toast timeout
    if (this.reconnectToastTimeoutId) {
        window.clearTimeout(this.reconnectToastTimeoutId);
        this.reconnectToastTimeoutId = null;
    }
    // Reset connection status so next connection cycle starts fresh
    this.lastConnectionStatus = null;
    this.hasHadDisconnection = false;
    this.hasBeenConnected = false;
    
    // Yjs Cleanup
    if (this.provider) {
        this.provider.destroy();
        this.provider = null;
    }
    if (this.doc) {
        this.doc.destroy();
        this.doc = null;
        this.yElementsMap = null;
    }

    this.portal.close(); // Keep for legacy cleanup/reset
    this.fileManager.reset();
    if (!opts?.isUnload) {
      this.setIsCollaborating(false);
      this.setActiveRoomLink(null);
      this.collaborators = new Map();
      this.xcalidrawAPI.updateScene({
        collaborators: this.collaborators,
      });
      LocalData.resumeSave("collaboration");
    }
  };

  private fetchImageFilesFromBackend = async (opts: {
    elements: readonly XcalidrawElement[];
    /**
     * Indicates whether to fetch files that are errored or pending and older
     * than 10 seconds.
     *
     * Use this as a mechanism to fetch files which may be ok but for some
     * reason their status was not updated correctly.
     */
    forceFetchFiles?: boolean;
  }) => {
    const unfetchedImages = opts.elements
      .filter((element) => {
        return (
          isInitializedImageElement(element) &&
          !this.fileManager.isFileTracked(element.fileId) &&
          !element.isDeleted &&
          (opts.forceFetchFiles
            ? element.status !== "pending" ||
              Date.now() - element.updated > 10000
            : element.status === "saved")
        );
      })
      .map((element) => (element as InitializedXcalidrawImageElement).fileId);

    return await this.fileManager.getFiles(unfetchedImages);
  };
  
  private fallbackInitializationHandler: null | (() => any) = null;

  private isReceivingRemoteUpdate = false;

  startCollaboration = async (
    existingRoomLinkData: null | { roomId: string; roomKey: string },
    options?: { skipSceneReset?: boolean },
  ): Promise<ImportedDataState | null> => {
    if (!this.state.username) {
      import("@excalidraw/random-username").then(({ getRandomUsername }) => {
        const username = getRandomUsername();
        this.setUsername(username);
        saveUsernameToLocalStorage(username);
      });
    }

    // If already connected, do nothing
    if (this.provider) {
      return null;
    }

    let roomId;
    let roomKey; // Kept for URL compatibility

    if (existingRoomLinkData) {
      ({ roomId, roomKey } = existingRoomLinkData);
    } else {
      ({ roomId, roomKey } = await generateCollaborationLinkData());
      window.history.pushState(
        {},
        APP_NAME,
        getCollaborationLink({ roomId, roomKey }),
      );
    }

    this.setIsCollaborating(true);
    LocalData.pauseSave("collaboration");

    try {
        // Initialize Yjs
        this.doc = new Y.Doc();
        this.provider = new WebsocketProvider(
            import.meta.env.VITE_APP_WS_SERVER_URL as string,
            roomId,
            this.doc,
            { params: { boardId: roomId } }
        );

        this.yElementsMap = this.doc.getMap('elements');

        // Observation: Update Scene when Yjs changes
        this.yElementsMap.observe((e, transaction) => {
            if (transaction.origin === 'local') return;

            const remoteElements = Array.from(this.yElementsMap!.values()) as RemoteXcalidrawElement[];
            const localElements = this.xcalidrawAPI.getSceneElementsIncludingDeleted();
            const appState = this.xcalidrawAPI.getAppState();
            
            // Reconcile remote changes with local state to prevent conflicts
            const reconciledElements = reconcileElements(
                localElements,
                remoteElements,
                appState
            );
            
            // Update syncedElementVersions with received remote element versions
            // This ensures we don't re-sync elements we just received
            remoteElements.forEach(el => {
                this.syncedElementVersions.set(el.id, el.version);
            });
            
            this.xcalidrawAPI.updateScene({ 
                elements: reconciledElements,
                captureUpdate: CaptureUpdateAction.NEVER
            });
        });
        
        // Awareness (Cursors)
        this.provider.awareness.setLocalStateField('user', {
            name: this.state.username,
            color: '#ffa500' // Assign specific colors in future
        });

        this.provider.awareness.on('change', () => {
             // Guard against provider being destroyed during cleanup (e.g., sleep/wake)
             if (!this.provider?.awareness) return;
             
             const states = this.provider.awareness.getStates();
             const collaborators = new Map<SocketId, Collaborator>();
             const clientID = this.provider.awareness.clientID;
             
             states.forEach((state: any, clientId: number) => {
                 if (clientId === clientID) return;
                 if (!state.user) return;
                 
                 collaborators.set(clientId.toString() as SocketId, {
                     pointer: state.pointer,
                     button: state.button || 'up',
                     selectedElementIds: {},
                     username: state.user.name,
                     avatarUrl: undefined, 
                     id: clientId.toString() as SocketId,
                     color: { background: state.user.color, stroke: state.user.color },
                 });
             });
             
             this.collaborators = collaborators;
             this.xcalidrawAPI.updateScene({ collaborators });
        });

        this.provider.on('status', (event: any) => {
            const status = event?.status;
            
            // Avoid duplicate handling for same status
            if (status === this.lastConnectionStatus) return;
            this.lastConnectionStatus = status;
            
            if (status === 'connected') {
                // Clear any pending reconnect toast timeout
                if (this.reconnectToastTimeoutId) {
                    window.clearTimeout(this.reconnectToastTimeoutId);
                    this.reconnectToastTimeoutId = null;
                }
                
                this.resetErrorIndicator();
                
                // Only show success toast if this is a reconnection (lost connection after being connected)
                if (this.hasHadDisconnection) {
                    toast.success('Connected', {
                        id: this.connectionToastId,
                        duration: 2000,
                    });
                }
                
                // Mark that we've been connected (for future disconnection detection)
                this.hasBeenConnected = true;
            } else if (status === 'disconnected' || status === 'connecting') {
                // Check if we were previously connected (this is a reconnection)
                if (this.hasBeenConnected) {
                    this.hasHadDisconnection = true;
                
                    // Debounce: only show toast after 2 seconds of disconnection
                    // This prevents toast spam for brief network blips
                    if (!this.reconnectToastTimeoutId) {
                        this.reconnectToastTimeoutId = window.setTimeout(() => {
                            this.reconnectToastTimeoutId = null;
                            // Check if still disconnected before showing toast
                            if (this.lastConnectionStatus !== 'connected') {
                                toast.loading('Reconnecting...', {
                                    id: this.connectionToastId,
                                    duration: Infinity,
                                });
                                this.setErrorIndicator("Reconnecting");
                            }
                        }, 2000);
                    }
                } else if (status === 'connecting') {
                    // Initial connection - show "Connecting..." immediately
                    toast.loading('Connecting...', {
                        id: this.connectionToastId,
                        duration: Infinity,
                    });
                }
            }
        });

        this.provider.on('sync', (isSynced: boolean) => {
            // Use sync event as a reliable indicator of successful connection
            if (isSynced) {
                // Clear any pending reconnect toast timeout
                if (this.reconnectToastTimeoutId) {
                    window.clearTimeout(this.reconnectToastTimeoutId);
                    this.reconnectToastTimeoutId = null;
                }
                
                this.resetErrorIndicator();
                
                // Show "Connected" toast (replaces Connecting.../Reconnecting...)
                toast.success('Connected', {
                    id: this.connectionToastId,
                    duration: 2000,
                });
            }
        });
        
        this.provider.on('connection-close', (event: any) => {
            console.log("Yjs WebSocket closed. Code:", event?.code, "Reason:", event?.reason);
        });
        
        this.provider.on('connection-error', (event: any) => {
            console.error("Yjs WebSocket error:", event);
        });

    } catch (error: any) {
      console.error(error);
      this.setErrorDialog(error.message);
      return null;
    }
    
    // Init awareness (cursors) could go here

    this.setActiveRoomLink(window.location.href);

    return null; // scenePromise logic removed as Yjs handles sync implicitly
  };


  private loadImageFiles = throttle(async () => {
    const { loadedFiles, erroredFiles } =
      await this.fetchImageFilesFromBackend({
        elements: this.xcalidrawAPI.getSceneElementsIncludingDeleted(),
      });

    this.xcalidrawAPI.addFiles(loadedFiles);

    updateStaleImageStatuses({
      xcalidrawAPI: this.xcalidrawAPI,
      erroredFiles,
      elements: this.xcalidrawAPI.getSceneElementsIncludingDeleted(),
    });
  }, LOAD_IMAGES_TIMEOUT);

  private handleRemoteSceneUpdate = (
    elements: ReconciledXcalidrawElement[],
  ) => {
    this.xcalidrawAPI.updateScene({
      elements,
      captureUpdate: CaptureUpdateAction.NEVER,
    });

    this.loadImageFiles();
  };

  private onPointerMove = () => {
    if (this.idleTimeoutId) {
      window.clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }

    this.idleTimeoutId = window.setTimeout(this.reportIdle, IDLE_THRESHOLD);

    if (!this.activeIntervalId) {
      this.activeIntervalId = window.setInterval(
        this.reportActive,
        ACTIVE_THRESHOLD,
      );
    }
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      if (this.idleTimeoutId) {
        window.clearTimeout(this.idleTimeoutId);
        this.idleTimeoutId = null;
      }
      if (this.activeIntervalId) {
        window.clearInterval(this.activeIntervalId);
        this.activeIntervalId = null;
      }
      this.onIdleStateChange(UserIdleState.AWAY);
    } else {
      this.idleTimeoutId = window.setTimeout(this.reportIdle, IDLE_THRESHOLD);
      this.activeIntervalId = window.setInterval(
        this.reportActive,
        ACTIVE_THRESHOLD,
      );
      this.onIdleStateChange(UserIdleState.ACTIVE);

      // Wake up connection logic
      if (this.isCollaborating() && this.portal.roomId) {
        setTimeout(() => {
             // If completely disconnected, the WebSocketClient should handle it via retry,
             // but sending an update forces a check.
             // If we are technically "connected" but the link is dead, this might throw or fail silently,
             // but usually attempting to write will reveal the broken pipe.
             this.portal.broadcastIdleChange(UserIdleState.ACTIVE);
        }, 1000);
      }
      this.onIdleStateChange(UserIdleState.ACTIVE);
    }
  };

  private reportIdle = () => {
    this.onIdleStateChange(UserIdleState.IDLE);
    if (this.activeIntervalId) {
      window.clearInterval(this.activeIntervalId);
      this.activeIntervalId = null;
    }
  };

  private reportActive = () => {
    this.onIdleStateChange(UserIdleState.ACTIVE);
  };

  private initializeIdleDetector = () => {
    document.addEventListener(EVENT.POINTER_MOVE, this.onPointerMove);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, this.onVisibilityChange);
  };

  setCollaborators(sockets: SocketId[]) {
    
    // Check if collaborators actually changed to prevent unnecessary re-renders
    const existingSocketIds = Array.from(this.collaborators.keys()).sort();
    const newSocketIds = [...sockets].sort();
    
    if (
      existingSocketIds.length === newSocketIds.length &&
      existingSocketIds.every((id, index) => id === newSocketIds[index])
    ) {
      // No change in collaborators, skip re-render
      return;
    }

    const collaborators: InstanceType<typeof Collab>["collaborators"] =
      new Map();
    for (const socketId of sockets) {
      collaborators.set(
        socketId,
        Object.assign({}, this.collaborators.get(socketId), {
          isCurrentUser: socketId === this.portal.socket?.id,
        }),
      );
    }
    this.collaborators = collaborators;
    this.xcalidrawAPI.updateScene({ collaborators });
  }

  updateCollaborator = (socketId: SocketId, updates: Partial<Collaborator>) => {
    const collaborators = new Map(this.collaborators);
    const user: Mutable<Collaborator> = Object.assign(
      {},
      collaborators.get(socketId),
      updates,
      {
        isCurrentUser: socketId === this.portal.socket?.id,
      },
    );
    collaborators.set(socketId, user);
    this.collaborators = collaborators;



    this.xcalidrawAPI.updateScene({
      collaborators,
    });
  };

  public setLastBroadcastedOrReceivedSceneVersion = (version: number) => {
    this.lastBroadcastedOrReceivedSceneVersion = version;
  };

  public getLastBroadcastedOrReceivedSceneVersion = () => {
    return this.lastBroadcastedOrReceivedSceneVersion;
  };

  public getSceneElementsIncludingDeleted = () => {
    return this.xcalidrawAPI.getSceneElementsIncludingDeleted();
  };

  onPointerUpdate = throttle(
    (payload: {
      pointer: SocketUpdateDataSource["MOUSE_LOCATION"]["payload"]["pointer"];
      button: SocketUpdateDataSource["MOUSE_LOCATION"]["payload"]["button"];
      pointersMap: Gesture["pointers"];
    }) => {
      // Guard against provider being destroyed during cleanup
      if (this.provider?.awareness && payload.pointersMap.size < 2) {
        this.provider.awareness.setLocalStateField('pointer', payload.pointer);
        this.provider.awareness.setLocalStateField('button', payload.button);
      }
    },
    CURSOR_SYNC_TIMEOUT,
  );

  relayVisibleSceneBounds = (props?: { force: boolean }) => {
    const appState = this.xcalidrawAPI.getAppState();

    if (this.portal.socket && (appState.followedBy.size > 0 || props?.force)) {
      this.portal.broadcastVisibleSceneBounds(
        {
          sceneBounds: getVisibleSceneBounds(appState),
        },
        `follow@${this.portal.socket.id}`,
      );
    }
  };

  onIdleStateChange = (userState: UserIdleState) => {
    // Legacy broadcast - removed
  };

  // Track per-element versions to only sync changed elements (like original Excalidraw)
  private syncedElementVersions: Map<string, number> = new Map();

  syncElements = (elements: readonly OrderedXcalidrawElement[]) => {
    // Guard against provider/doc being destroyed during cleanup
    if (!this.doc || !this.yElementsMap || !this.provider?.awareness) return;
    
    // Filter to only elements that have changed since last sync
    const changedElements = elements.filter(element => {
        const lastSyncedVersion = this.syncedElementVersions.get(element.id);
        return !lastSyncedVersion || element.version > lastSyncedVersion;
    });
    
    // Skip if nothing changed
    if (changedElements.length === 0) return;
    
    this.doc.transact(() => {
        if (this.yElementsMap) {
            changedElements.forEach(element => {
                this.yElementsMap!.set(element.id, element);
                this.syncedElementVersions.set(element.id, element.version);
            });
        }
    }, 'local');
  };

  queueSaveToBackend = throttle(
    () => {
      if (this.portal.socketInitialized) {
        this.saveCollabRoomToBackend(
          getSyncableElements(
            this.xcalidrawAPI.getSceneElementsIncludingDeleted(),
          ),
        );
      }
    },
    SYNC_FULL_SCENE_INTERVAL_MS,
    { leading: false },
  );

  setUsername = (username: string) => {
    this.setState({ username });
    saveUsernameToLocalStorage(username);
  };

  getUsername = () => this.state.username;

  setActiveRoomLink = (activeRoomLink: string | null) => {
    this.setState({ activeRoomLink });
    appJotaiStore.set(activeRoomLinkAtom, activeRoomLink);
  };

  getActiveRoomLink = () => this.state.activeRoomLink;

  setErrorIndicator = (errorMessage: string | null) => {
    appJotaiStore.set(collabErrorIndicatorAtom, {
      message: errorMessage,
      nonce: Date.now(),
    });
  };

  resetErrorIndicator = (resetDialogNotifiedErrors = false) => {
    appJotaiStore.set(collabErrorIndicatorAtom, { message: null, nonce: 0 });
    if (resetDialogNotifiedErrors) {
      this.setState({
        dialogNotifiedErrors: {},
      });
    }
  };

  setErrorDialog = (errorMessage: string | null) => {
    this.setState({
      errorMessage,
    });
  };

  render() {
    const { errorMessage } = this.state;

    return (
      <>
        {errorMessage != null && (
          <ErrorDialog onClose={() => this.setErrorDialog(null)}>
            {errorMessage}
          </ErrorDialog>
        )}
      </>
    );
  }
}

declare global {
  interface Window {
    collab: InstanceType<typeof Collab>;
  }
}

if (isTestEnv() || isDevEnv()) {
  window.collab = window.collab || ({} as Window["collab"]);
}

export default Collab;

export type TCollabClass = Collab;
