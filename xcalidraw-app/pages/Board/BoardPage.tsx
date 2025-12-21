import {
  Xcalidraw,
  LiveCollaborationTrigger,
  TTDDialogTrigger,
  useEditorInterface,
  hashElementsVersion,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
} from "@xcalidraw/xcalidraw";
import { trackEvent } from "@xcalidraw/xcalidraw/analytics";
import {
  CommandPalette,
  DEFAULT_CATEGORIES,
} from "@xcalidraw/xcalidraw/components/CommandPalette/CommandPalette";
import { ErrorDialog } from "@xcalidraw/xcalidraw/components/ErrorDialog";
import { OverwriteConfirmDialog } from "@xcalidraw/xcalidraw/components/OverwriteConfirm/OverwriteConfirm";
import { ShareableLinkDialog } from "@xcalidraw/xcalidraw/components/ShareableLinkDialog";
import {
  THEME,
  VERSION_TIMEOUT,
  debounce,
  getVersion,
  getFrame,
  resolvablePromise,
  isRunningInIframe,
  isDevEnv,
} from "@xcalidraw/common";
import polyfill from "@xcalidraw/xcalidraw/polyfill";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCallbackRefState } from "@xcalidraw/xcalidraw/hooks/useCallbackRefState";
import { t } from "@xcalidraw/xcalidraw/i18n";

import { usersIcon, share } from "@xcalidraw/xcalidraw/components/icons";
import { isElementLink } from "@xcalidraw/element";
import clsx from "clsx";
import {
  useHandleLibrary,
} from "@xcalidraw/xcalidraw/data/library";
import { useUpdateBoardMutation, useBoardQuery, useBoardPublicQuery } from "../../hooks/api.hooks";
import { CommentsLayer } from "../../components/Comments";
import { useGetUser } from "../../hooks/auth.hooks";

import type { ResolvablePromise } from "@xcalidraw/common/utils";
import type {
  NonDeletedXcalidrawElement,
  OrderedXcalidrawElement,
} from "@xcalidraw/element/types";
import type {
  AppState,
  XcalidrawImperativeAPI,
  XcalidrawInitialDataState,
  UIAppState,
  UIOptions,
  BinaryFiles,
} from "@xcalidraw/xcalidraw/types";

import CustomStats from "../../CustomStats";
import { appJotaiStore, Provider, useAtom, useAtomValue, useAtomWithInitialValue } from "../../app-jotai";

import Collab, {
  collabAPIAtom,
  isCollaboratingAtom,
  isOfflineAtom,
} from "../../collab/Collab";
import { AppFooter } from "../../components/AppFooter";
import { AppMainMenu } from "../../components/AppMainMenu";
import { AppWelcomeScreen } from "../../components/AppWelcomeScreen";
import { TopErrorBoundary } from "../../components/TopErrorBoundary";

import {
  isCollaborationLink,
} from "../../data";


import {
  LibraryIndexedDBAdapter,
  LibraryLocalStorageMigrationAdapter,
  localStorageQuotaExceededAtom,
} from "../../data/LocalData";
import { ShareDialog, shareDialogStateAtom } from "../../share/ShareDialog";
import CollabError, {
  collabErrorIndicatorAtom,
} from "../../collab/CollabError";
import { useHandleAppTheme } from "../../useHandleAppTheme";
import { useAppLangCode } from "../../app-language/language-state";
import DebugCanvas, {
  isVisualDebuggerEnabled,
  loadSavedDebugState,
} from "../../components/DebugCanvas";
import { AIComponents } from "../../components/AI";

import "../../index.scss";

import { AppSidebar } from "../../components/AppSidebar";


// Import from extracted modules
import { deriveKeyFromBoardId } from "./utils/deriveKey";

polyfill();

window.XCALIDRAW_THROTTLE_RENDER = true;

declare global {
  interface BeforeInstallPromptEventChoiceResult {
    outcome: "accepted" | "dismissed";
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<BeforeInstallPromptEventChoiceResult>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface Window {
    __XCALIDRAW_BOARD_ID__?: string;
    }
}

let pwaEvent: BeforeInstallPromptEvent | null = null;

window.addEventListener(
  "beforeinstallprompt",
  (event: BeforeInstallPromptEvent) => {
    event.preventDefault();
    pwaEvent = event;
  },
);

let isSelfEmbedding = false;

if (window.self !== window.top) {
  try {
    const parentUrl = new URL(document.referrer);
    const currentUrl = new URL(window.location.href);
    if (parentUrl.origin === currentUrl.origin) {
      isSelfEmbedding = true;
    }
  } catch (error) {
    // ignore
  }
}

// Extracted helpers and hooks
import { initializeScene } from "./hooks/useSceneInitialization";
import { useBoardHandlers } from "./hooks/useBoardHandlers";
import { loadImages } from "./helpers";

const XcalidrawWrapper = ({
  boardId,
  token,
  onHomeClick,
}: {
  boardId?: string;
  token?: string | null;
  onHomeClick?: () => void;
}) => {
  // Conditional Query Logic
  const privateBoardQuery = useBoardQuery(token ? undefined : boardId);
  const publicBoardQuery = useBoardPublicQuery(boardId, token);

  const boardData = token ? publicBoardQuery.data : privateBoardQuery.data;
  const isBoardLoading = token ? publicBoardQuery.isLoading : privateBoardQuery.isLoading;

  const updateBoardMutation = useUpdateBoardMutation();
  const updateBoardMutationRef = useRef(updateBoardMutation);
  const lastSceneVersionRef = useRef(0);
  const lastBoardTitleRef = useRef("");
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    updateBoardMutationRef.current = updateBoardMutation;
  });

  const saveToBackend = useMemo(
    () =>
      debounce(async (elements: readonly OrderedXcalidrawElement[], appState: AppState, boardId: string) => {
        if (!boardId) return;
        // If we have a token, we might not be able to save unless we are also logged in or backend supports it.
        // For now, if we are in "public view mode" (token present), we skip auto-save or warn?
        // But the user might be logged in AND viewing via link.
        // Let's attempt save. If it fails (401/403), we catch it.
        try {
            await updateBoardMutationRef.current.mutateAsync({
                boardId,
                elements: elements as any[],
                appState,
            });
        } catch (e) {
            console.error("Failed to save to backend", e);
        }
      }, 2000),
    [],
  );

  useEffect(() => {
    return () => {
      saveToBackend.cancel?.();
    };
  }, [saveToBackend]);

  const [errorMessage, setErrorMessage] = useState("");
  const isCollabDisabled = isRunningInIframe();

  const { editorTheme, appTheme, setAppTheme } = useHandleAppTheme();

  const [langCode, setLangCode] = useAppLangCode();

  const editorInterface = useEditorInterface();

  useEffect(() => {
    if (boardId) {
      window.__XCALIDRAW_BOARD_ID__ = boardId;
    } else {
      delete window.__XCALIDRAW_BOARD_ID__;
    }
    return () => {
      delete window.__XCALIDRAW_BOARD_ID__;
    };
  }, [boardId]);

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<XcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<XcalidrawInitialDataState | null>();
  }

  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackEvent("load", "frame", getFrame());
    setTimeout(() => {
      trackEvent("load", "version", getVersion());
    }, VERSION_TIMEOUT);
  }, []);

  const [xcalidrawAPI, xcalidrawRefCallback] =
    useCallbackRefState<XcalidrawImperativeAPI>();

  const [, setShareDialogState] = useAtom(shareDialogStateAtom);
  const [collabAPI] = useAtom(collabAPIAtom);
  const [isCollaborating] = useAtomWithInitialValue(isCollaboratingAtom, () => {
    return isCollaborationLink(window.location.href);
  });
  const collabError = useAtomValue(collabErrorIndicatorAtom);

  useHandleLibrary({
    xcalidrawAPI,
    adapter: LibraryIndexedDBAdapter,
    migrationAdapter: LibraryLocalStorageMigrationAdapter,
  });

  const [, forceRefresh] = useState(false);

  // Comments feature
  const [isCommentMode, setIsCommentMode] = useState(false);
  const { user: currentUser } = useGetUser();
  const [renderKey, setRenderKey] = useState(0); // Used to trigger re-renders on scroll/zoom
  const lastViewRef = useRef({ scrollX: 0, scrollY: 0, zoom: 1 });

  // Track collab session to prevent cleanup race conditions
  const collabSessionRef = useRef(0);

  // Always-on collaboration: Auto-start collaboration when viewing a saved board
  useEffect(() => {
    // Skip if missing required deps
    if (!boardId || !collabAPI || isCollabDisabled) {
      return;
    }

    // Skip if already collaborating (handles React StrictMode double-mount)
    if (collabAPI.isCollaborating()) {
      return;
    }

    // Don't interfere with explicit room links
    if (isCollaborationLink(window.location.href)) {
      return;
    }

    // Increment session counter - this instance "owns" this session number
    const mySession = ++collabSessionRef.current;
    let isCancelled = false;

    const startCollab = async () => {
      try {
        const roomKey = await deriveKeyFromBoardId(boardId);
        
        // Check again before starting (in case state changed during async)
        if (isCancelled || collabAPI.isCollaborating()) {
          return;
        }
        
        await collabAPI.startCollaboration(
          { roomId: boardId, roomKey },
          { skipSceneReset: true }
        );
      } catch (error) {
        if (!isCancelled) {
          console.error('[Collab] startCollaboration failed:', error);
        }
      }
    };

    startCollab();

    // Cleanup: cancel pending start and stop collab on unmount
    // BUT only if no newer session has started
    return () => {
      isCancelled = true;
      
      // Only stop if this is still the active session
      // If a newer session has started, don't interfere with it
      if (mySession === collabSessionRef.current && collabAPI.isCollaborating()) {
        collabAPI.stopCollaboration(false);
      }
    };
  }, [boardId, collabAPI, isCollabDisabled]);

  useEffect(() => {
    if (isDevEnv()) {
      const debugState = loadSavedDebugState();

      if (debugState.enabled && !window.visualDebug) {
        window.visualDebug = {
          data: [],
        };
      } else {
        delete window.visualDebug;
      }
      forceRefresh((prev) => !prev);
    }
  }, [xcalidrawAPI]);

  // State for shareable link
  const [latestShareableLink, setLatestShareableLink] = useState<string | null>(null);

  // Use consolidated board handlers hook
  const boardHandlers = useBoardHandlers({
    xcalidrawAPI,
    collabAPI,
    isCollabDisabled,
    boardId,
    lastSceneVersionRef,
    lastBoardTitleRef,
    lastViewRef,
    debugCanvasRef,
    setLangCode,
    setRenderKey,
    setLatestShareableLink,
    saveToBackend,
  });

  // Alias onChange and onExportToBackend for use elsewhere
  const { onChange: originalOnChange, onExportToBackend } = boardHandlers;

  // Sync ActiveTool -> isCommentMode
  const onChange = useCallback(
    (
      elements: readonly OrderedXcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      // Sync active tool to comment mode
      const isCommentTool =
        appState.activeTool.type === "custom" &&
        appState.activeTool.customType === "comment";

      if (isCommentTool) {
        if (!isCommentMode) {
          setTimeout(() => setIsCommentMode(true), 0);
        }
      } else {
        if (isCommentMode) {
          setTimeout(() => setIsCommentMode(false), 0);
        }
      }
      originalOnChange(elements, appState, files);
    },
    [originalOnChange, isCommentMode],
  );

  useEffect(() => {
    if (!xcalidrawAPI || (!isCollabDisabled && !collabAPI)) {
      return;
    }

    if (boardData?.title && xcalidrawAPI) {
      // Sync board name from API to AppState
       const currentName = xcalidrawAPI.getAppState().name;
       if (currentName !== boardData.title && (!currentName || currentName.startsWith("Untitled"))) {
          xcalidrawAPI.updateScene({
            appState: {
              name: boardData.title
            }
          });
       }
    }

    // Initialize scene
    if (!hasInitializedRef.current && (boardData || !boardId)) {
        // Only initialize if we have data OR if there is no boardId (empty board)
        // If boardId exists but no data yet, wait for isLoading to finish or data to arrive
        if (boardId && !boardData) return;

        initializeScene({ collabAPI, xcalidrawAPI, boardId, boardData }).then(async (data) => {
          loadImages({ data, isInitialLoad: true, xcalidrawAPI, collabAPI, boardId });
          
          // Restore user's last view (zoom/scroll)
          if (boardId) {
            try {
                const savedView = localStorage.getItem(`xcalidraw-view-${boardId}`);
                if (savedView) {
                    const { scrollX, scrollY, zoom } = JSON.parse(savedView);
                    data.scene = data.scene || { elements: [], appState: {} };
                    data.scene.appState = data.scene.appState || {};
                    
                    data.scene.appState = {
                        ...data.scene.appState,
                        ...(Number.isFinite(scrollX) ? { scrollX } : {}),
                        ...(Number.isFinite(scrollY) ? { scrollY } : {}),
                        ...(Number.isFinite(zoom) ? { zoom: { value: zoom } } : {}),
                    };
                }
            } catch (e) {
                console.warn("Failed to restore view state from localStorage", e);
            }
          }

          initialStatePromiseRef.current.promise.resolve(data.scene);
          
          if (data.scene?.elements) {
            lastSceneVersionRef.current = hashElementsVersion(data.scene.elements);
          }
          if (data.scene?.appState?.name) {
            lastBoardTitleRef.current = data.scene.appState.name;
          }
          hasInitializedRef.current = true;
        });
    }
  }, [isCollabDisabled, collabAPI, xcalidrawAPI, boardId, boardData]);

  useEffect(() => {
    // Use boardHandlers for event setup
    return boardHandlers.setupEventListeners();
  }, [boardHandlers]);

  const renderCustomStats = (
    elements: readonly NonDeletedXcalidrawElement[],
    appState: UIAppState,
  ) => {
    return (
      <CustomStats
        setToast={(message) => xcalidrawAPI!.setToast({ message })}
        appState={appState}
        elements={elements}
      />
    );
  };

  const isOffline = useAtomValue(isOfflineAtom);

  const localStorageQuotaExceeded = useAtomValue(localStorageQuotaExceededAtom);

  const onCollabDialogOpen = useCallback(
    () => setShareDialogState({ isOpen: true, type: "collaborationOnly" }),
    [setShareDialogState],
  );

  // If token is present, we allow viewing even if auth fails (handled by Public Query)
  // If loading...
  if (boardId && isBoardLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-muted">
        <div className="text-muted-foreground animate-pulse">Loading board...</div>
      </div>
    );
  }

  // Error handling state if public query fails? (403/404)
  // useBoardPublicQuery will have `error`.
  if (token && publicBoardQuery.isError) {
      return (
        <div className="flex items-center justify-center h-screen w-full bg-muted flex-col gap-4">
             <div className="text-red-500 font-bold">Unable to load shared board</div>
             <div>{(publicBoardQuery.error as any).message || "Invalid or expired link"}</div>
             <button onClick={onHomeClick} className="underline">Go Home</button>
        </div>
      );
  }

  if (isSelfEmbedding) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <h1>I'm not a pretzel!</h1>
      </div>
    );
  }
  
  // Conditionally disable things for Viewer View?
  const isReadOnly = token && true; // Assume read only for link view for now
  // We can pass `viewModeEnabled: isReadOnly` to Xcalidraw if we want.

  const uiOptions: UIOptions = {
      canvasActions: {
        toggleTheme: true,
        export: {
          onExportToBackend,
          renderCustomUI: undefined,
        },
      },
  };

  return (
    <div
      style={{ height: "100%" }}
      className={clsx("xcalidraw-app", {
        "is-collaborating": isCollaborating,
      })}
    >
      <Xcalidraw
        xcalidrawAPI={xcalidrawRefCallback}
        onChange={onChange}
        initialData={initialStatePromiseRef.current.promise}
        isCollaborating={isCollaborating}
        onPointerUpdate={collabAPI?.onPointerUpdate}
        UIOptions={uiOptions}
        viewModeEnabled={!!isReadOnly && false} // Disable force view mode for now to check behavior, or enable it.
        // If we want them to interact but not save:
        // viewModeEnabled=true hides tools.
        // Maybe we just let them edit but save fails.
        // Let's set autoFocus
        langCode={langCode}
        renderCustomStats={renderCustomStats}
        detectScroll={false}
        handleKeyboardGlobally={true}
        autoFocus={true}
        theme={editorTheme}
        renderTopRightUI={(isMobile) => {
          if (isMobile || !collabAPI || isCollabDisabled) {
            return null;
          }

          return (
            <>
              {collabError.message && <CollabError collabError={collabError} />}
              <LiveCollaborationTrigger
                isCollaborating={isCollaborating}
                onSelect={() =>
                  setShareDialogState({ isOpen: true, type: "share" })
                }
                editorInterface={editorInterface}
              />
            </>
          );
        }}
        onLinkOpen={(element, event) => {
          if (element.link && isElementLink(element.link)) {
            event.preventDefault();
            xcalidrawAPI?.scrollToContent(element.link, { animate: true });
          }
        }}
        onHomeClick={onHomeClick}
      >
        <AppMainMenu
          onCollabDialogOpen={onCollabDialogOpen}
          isCollaborating={isCollaborating}
          isCollabEnabled={!isCollabDisabled}
          theme={appTheme}
          setTheme={(theme) => setAppTheme(theme)}
          refresh={() => forceRefresh((prev) => !prev)}
        />
        <AppWelcomeScreen
          onCollabDialogOpen={onCollabDialogOpen}
          isCollabEnabled={!isCollabDisabled}
        />
        <OverwriteConfirmDialog>
          <OverwriteConfirmDialog.Actions.ExportToImage />
          <OverwriteConfirmDialog.Actions.SaveToDisk />
        </OverwriteConfirmDialog>
        <AppFooter onChange={() => xcalidrawAPI?.refresh()} />
        {xcalidrawAPI && <AIComponents xcalidrawAPI={xcalidrawAPI} />}

        <TTDDialogTrigger />
        {isCollaborating && isOffline && (
          <div className="alert alert--warning">
            {t("alerts.collabOfflineWarning")}
          </div>
        )}
        {localStorageQuotaExceeded && (
          <div className="alert alert--danger">
            {t("alerts.localStorageQuotaExceeded")}
          </div>
        )}
        {latestShareableLink && (
          <ShareableLinkDialog
            link={latestShareableLink}
            onCloseRequest={() => setLatestShareableLink(null)}
            setErrorMessage={setErrorMessage}
          />
        )}
        {xcalidrawAPI && !isCollabDisabled && (
          <Collab xcalidrawAPI={xcalidrawAPI} />
        )}

        <ShareDialog
          collabAPI={collabAPI}
          boardId={boardId}
          onExportToBackend={async () => {
            if (xcalidrawAPI) {
              try {
                await onExportToBackend(
                  xcalidrawAPI.getSceneElements(),
                  xcalidrawAPI.getAppState(),
                  xcalidrawAPI.getFiles(),
                );
              } catch (error: any) {
                setErrorMessage(error.message);
              }
            }
          }}
        />

        <AppSidebar />

        {errorMessage && (
          <ErrorDialog onClose={() => setErrorMessage("")}>
            {errorMessage}
          </ErrorDialog>
        )}

        <CommandPalette
          customCommandPaletteItems={[
            {
              label: isCommentMode ? "Exit comment mode" : "Add comment",
              category: DEFAULT_CATEGORIES.app,
              keywords: [
                "comment",
                "note",
                "feedback",
                "annotation",
                "discuss",
              ],
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              ),
              perform: () => {
                if (isCommentMode) {
                  xcalidrawAPI?.setActiveTool({
                    type: "selection",
                    customType: null,
                  } as any);
                } else {
                  xcalidrawAPI?.setActiveTool({
                    type: "custom",
                    customType: "comment",
                  });
                }
              },
            },
            {
              label: t("labels.liveCollaboration"),
              category: DEFAULT_CATEGORIES.app,
              keywords: [
                "team",
                "multiplayer",
                "share",
                "public",
                "session",
                "invite",
              ],
              icon: usersIcon,
              perform: () => {
                setShareDialogState({
                  isOpen: true,
                  type: "collaborationOnly",
                });
              },
            },
            {
              label: t("roomDialog.button_stopSession"),
              category: DEFAULT_CATEGORIES.app,
              predicate: () => !!collabAPI?.isCollaborating(),
              keywords: [
                "stop",
                "session",
                "end",
                "leave",
                "close",
                "exit",
                "collaboration",
              ],
              perform: () => {
                if (collabAPI) {
                  collabAPI.stopCollaboration();
                  if (!collabAPI.isCollaborating()) {
                    setShareDialogState({ isOpen: false });
                  }
                }
              },
            },
            {
              label: t("labels.share"),
              category: DEFAULT_CATEGORIES.app,
              predicate: true,
              icon: share,
              keywords: [
                "link",
                "shareable",
                "readonly",
                "export",
                "publish",
                "snapshot",
                "url",
                "collaborate",
                "invite",
              ],
              perform: async () => {
                setShareDialogState({ isOpen: true, type: "share" });
              },
            },
            {
              ...CommandPalette.defaultItems.toggleTheme,
              perform: () => {
                setAppTheme(
                  editorTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK,
                );
              },
            },
            {
              label: t("labels.installPWA"),
              category: DEFAULT_CATEGORIES.app,
              predicate: () => !!pwaEvent,
              perform: () => {
                if (pwaEvent) {
                  pwaEvent.prompt();
                  pwaEvent.userChoice.then(() => {
                    pwaEvent = null;
                  });
                }
              },
            },
          ]}
        />
        {isVisualDebuggerEnabled() && xcalidrawAPI && (
          <DebugCanvas
            appState={xcalidrawAPI.getAppState()}
            scale={window.devicePixelRatio}
            ref={debugCanvasRef}
          />
        )}
        {/* Comments Layer */}
        {boardId && xcalidrawAPI && (
          <CommentsLayer
            boardId={boardId}
            currentUserId={currentUser?.username}
            isCommentMode={isCommentMode}
            canvasToScreen={(x: number, y: number) => {
              const appState = xcalidrawAPI.getAppState();
              return sceneCoordsToViewportCoords({ sceneX: x, sceneY: y }, appState);
            }}
            screenToCanvas={(x: number, y: number) => {
              const appState = xcalidrawAPI.getAppState();
              return viewportCoordsToSceneCoords({ clientX: x, clientY: y }, appState);
            }}
            onCommentModeChange={setIsCommentMode}
            theme={xcalidrawAPI.getAppState().theme}
          />
        )}
      </Xcalidraw>
      {xcalidrawAPI && <Collab xcalidrawAPI={xcalidrawAPI} />}
      

    </div>
  );
};

const BoardPage = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  // Handle Magic Link Token
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const navigate = useNavigate();

  const handleHomeClick = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  return (
    <TopErrorBoundary>
      <Provider store={appJotaiStore}>
        <XcalidrawWrapper
          key={boardId}
          boardId={boardId}
          token={token} // Pass token
          onHomeClick={handleHomeClick}
        />
      </Provider>
    </TopErrorBoundary>
  );
};

export default BoardPage;
