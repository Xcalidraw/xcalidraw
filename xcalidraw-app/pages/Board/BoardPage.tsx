import {
  Xcalidraw,
  LiveCollaborationTrigger,
  TTDDialogTrigger,
  CaptureUpdateAction,
  reconcileElements,
  useEditorInterface,
  hashElementsVersion,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
} from "@xcalidraw/xcalidraw";
import { trackEvent } from "@xcalidraw/xcalidraw/analytics";
import { getDefaultAppState } from "@xcalidraw/xcalidraw/appState";
import {
  CommandPalette,
  DEFAULT_CATEGORIES,
} from "@xcalidraw/xcalidraw/components/CommandPalette/CommandPalette";
import { ErrorDialog } from "@xcalidraw/xcalidraw/components/ErrorDialog";
import { OverwriteConfirmDialog } from "@xcalidraw/xcalidraw/components/OverwriteConfirm/OverwriteConfirm";
import { openConfirmModal } from "@xcalidraw/xcalidraw/components/OverwriteConfirm/OverwriteConfirmState";
import { ShareableLinkDialog } from "@xcalidraw/xcalidraw/components/ShareableLinkDialog";
import Trans from "@xcalidraw/xcalidraw/components/Trans";
import {
  APP_NAME,
  EVENT,
  THEME,
  VERSION_TIMEOUT,
  debounce,
  getVersion,
  getFrame,
  isTestEnv,
  preventUnload,
  resolvablePromise,
  isRunningInIframe,
  isDevEnv,
} from "@xcalidraw/common";
import polyfill from "@xcalidraw/xcalidraw/polyfill";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadFromBlob } from "@xcalidraw/xcalidraw/data/blob";
import { useCallbackRefState } from "@xcalidraw/xcalidraw/hooks/useCallbackRefState";
import { t } from "@xcalidraw/xcalidraw/i18n";

import { usersIcon, share } from "@xcalidraw/xcalidraw/components/icons";
import { isElementLink } from "@xcalidraw/element";
import { restore, restoreAppState } from "@xcalidraw/xcalidraw/data/restore";
import { newElementWith } from "@xcalidraw/element";
import { isInitializedImageElement, getSceneVersion } from "@xcalidraw/element";
import clsx from "clsx";
import {
  parseLibraryTokensFromUrl,
  useHandleLibrary,
} from "@xcalidraw/xcalidraw/data/library";
import { useUpdateBoardMutation, useBoardQuery } from "../../hooks/api.hooks";
import { CommentsLayer } from "../../components/Comments";
import { useGetUser } from "../../hooks/auth.hooks";

import type { ResolvablePromise } from "@xcalidraw/common/utils";
import type { ResolutionType } from "@xcalidraw/common/utility-types";
import type { RemoteXcalidrawElement } from "@xcalidraw/xcalidraw/data/reconcile";
import type { RestoredDataState } from "@xcalidraw/xcalidraw/data/restore";
import type {
  FileId,
  NonDeletedXcalidrawElement,
  OrderedXcalidrawElement,
} from "@xcalidraw/element/types";
import type {
  AppState,
  XcalidrawImperativeAPI,
  BinaryFiles,
  XcalidrawInitialDataState,
  UIAppState,
} from "@xcalidraw/xcalidraw/types";

import CustomStats from "../../CustomStats";
import { appJotaiStore, atom, Provider, useAtom, useAtomValue, useAtomWithInitialValue } from "../../app-jotai";
import {
  FIREBASE_STORAGE_PREFIXES,
  STORAGE_KEYS,
  SYNC_BROWSER_TABS_TIMEOUT,
} from "../../app_constants";

import Collab, {
  collabAPIAtom,
  isCollaboratingAtom,
  isOfflineAtom,
} from "../../collab/Collab";
import { AppFooter } from "../../components/AppFooter";
import { AppMainMenu } from "../../components/AppMainMenu";
import { AppWelcomeScreen } from "../../components/AppWelcomeScreen";
import {
  ExportToXcalidrawPlus,
  exportToXcalidrawPlus,
} from "../../components/ExportToXcalidrawPlus";
import { TopErrorBoundary } from "../../components/TopErrorBoundary";

import {
  exportToBackend,
  getCollaborationLinkData,
  isCollaborationLink,
  loadScene,
} from "../../data";

import { updateStaleImageStatuses } from "../../data/FileManager";
import {
  importFromLocalStorage,
  importUsernameFromLocalStorage,
} from "../../data/localStorage";

import { loadFilesFromFirebase } from "../../data/firebase";
import {
  LibraryIndexedDBAdapter,
  LibraryLocalStorageMigrationAdapter,
  LocalData,
  localStorageQuotaExceededAtom,
} from "../../data/LocalData";
import { isBrowserStorageStateNewer } from "../../data/tabSync";
import { ShareDialog, shareDialogStateAtom } from "../../share/ShareDialog";
import CollabError, {
  collabErrorIndicatorAtom,
} from "../../collab/CollabError";
import { useHandleAppTheme } from "../../useHandleAppTheme";
import { getPreferredLanguage } from "../../app-language/language-detector";
import { useAppLangCode } from "../../app-language/language-state";
import DebugCanvas, {
  debugRenderer,
  isVisualDebuggerEnabled,
  loadSavedDebugState,
} from "../../components/DebugCanvas";
import { AIComponents } from "../../components/AI";

import "../../index.scss";

import { AppSidebar } from "../../components/AppSidebar";

import type { CollabAPI } from "../../collab/Collab";

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

/**
 * Derives a valid AES-128 encryption key from a boardId.
 * This is used for always-on collaboration where we need a deterministic key
 * based on the board ID, rather than generating random keys.
 */
const deriveKeyFromBoardId = async (boardId: string): Promise<string> => {
  // Use SHA-256 to hash the boardId, then take first 16 bytes (128 bits)
  const encoder = new TextEncoder();
  const data = encoder.encode(boardId + "_xcalidraw_collab_key");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Take first 16 bytes (128 bits for AES-128)
  const keyBytes = new Uint8Array(hashBuffer.slice(0, 16));
  
  // Import as a proper CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 128 },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  
  // Export as JWK and return the 'k' property (this matches generateEncryptionKey format)
  const jwk = await crypto.subtle.exportKey("jwk", cryptoKey);
  return jwk.k!;
};

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

const shareableLinkConfirmDialog = {
  title: t("overwriteConfirm.modal.shareableLink.title"),
  description: (
    <Trans
      i18nKey="overwriteConfirm.modal.shareableLink.description"
      bold={(text) => <strong>{text}</strong>}
      br={() => <br />}
    />
  ),
  actionLabel: t("overwriteConfirm.modal.shareableLink.button"),
  color: "danger",
} as const;

const initializeScene = async (opts: {
  collabAPI: CollabAPI | null;
  xcalidrawAPI: XcalidrawImperativeAPI;
  boardId?: string;
  boardData?: any;
}): Promise<
  { scene: XcalidrawInitialDataState | null } & (
    | { isExternalScene: true; id: string; key: string }
    | { isExternalScene: false; id?: null; key?: null }
  )
> => {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");
  const jsonBackendMatch = window.location.hash.match(
    /^#json=([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/,
  );
  const externalUrlMatch = window.location.hash.match(/^#url=(.*)$/);

  const localDataState = opts.boardId ? null : importFromLocalStorage();

  let scene: RestoredDataState & {
    scrollToContent?: boolean;
  } = await loadScene(null, null, localDataState);

  if (opts.boardData) {
    scene = {
      ...scene,
      elements: opts.boardData.elements || [],
      appState: {
        ...scene.appState,
        ...getDefaultAppState(),
        name: opts.boardData.title,
      },
      scrollToContent: true,
    };
  }

  let roomLinkData = getCollaborationLinkData(window.location.href);
  const isExternalScene = !!(id || jsonBackendMatch || roomLinkData);
  if (isExternalScene) {
    if (
      !scene.elements.length ||
      roomLinkData ||
      (await openConfirmModal(shareableLinkConfirmDialog))
    ) {
      if (jsonBackendMatch) {
        scene = await loadScene(
          jsonBackendMatch[1],
          jsonBackendMatch[2],
          localDataState,
        );
      }
      scene.scrollToContent = true;
      if (!roomLinkData) {
        window.history.replaceState({}, APP_NAME, window.location.origin);
      }
    } else {
      if (document.hidden) {
        return new Promise((resolve, reject) => {
          window.addEventListener(
            "focus",
            () => initializeScene(opts).then(resolve).catch(reject),
            {
              once: true,
            },
          );
        });
      }

      roomLinkData = null;
      window.history.replaceState({}, APP_NAME, window.location.origin);
    }
  } else if (externalUrlMatch) {
    window.history.replaceState({}, APP_NAME, window.location.origin);

    const url = externalUrlMatch[1];
    try {
      const request = await fetch(window.decodeURIComponent(url));
      const data = await loadFromBlob(await request.blob(), null, null);
      if (
        !scene.elements.length ||
        (await openConfirmModal(shareableLinkConfirmDialog))
      ) {
        return { scene: data, isExternalScene };
      }
    } catch (error: any) {
      return {
        scene: {
          appState: {
            errorMessage: t("alerts.invalidSceneUrl"),
          },
        },
        isExternalScene,
      };
    }
  }

  if (roomLinkData && opts.collabAPI) {
    const { xcalidrawAPI } = opts;

    const scene = await opts.collabAPI.startCollaboration(roomLinkData);

    return {
      scene: {
        ...scene,
        appState: {
          ...restoreAppState(
            {
              ...scene?.appState,
              theme: localDataState?.appState?.theme || scene?.appState?.theme,
            },
            xcalidrawAPI.getAppState(),
          ),
          isLoading: false,
        },
        elements: reconcileElements(
          scene?.elements || [],
          xcalidrawAPI.getSceneElementsIncludingDeleted() as RemoteXcalidrawElement[],
          xcalidrawAPI.getAppState(),
        ),
      },
      isExternalScene: true,
      id: roomLinkData.roomId,
      key: roomLinkData.roomKey,
    };
  } else if (scene) {
    return isExternalScene && jsonBackendMatch
      ? {
          scene,
          isExternalScene,
          id: jsonBackendMatch[1],
          key: jsonBackendMatch[2],
        }
      : { scene, isExternalScene: false };
  }
  return { scene: null, isExternalScene: false };
};

const XcalidrawWrapper = ({
  boardId,
  onHomeClick,
}: {
  boardId?: string;
  onHomeClick?: () => void;
}) => {
  const { data: boardData, isLoading: isBoardLoading } = useBoardQuery(boardId);

  const updateBoardMutation = useUpdateBoardMutation();
  const updateBoardMutationRef = useRef(updateBoardMutation);
  const lastSceneVersionRef = useRef(0);
  const lastBoardTitleRef = useRef("");

  useEffect(() => {
    updateBoardMutationRef.current = updateBoardMutation;
  });

  const saveToBackend = useMemo(
    () =>
      debounce(async (elements: readonly OrderedXcalidrawElement[], appState: AppState, boardId: string) => {
        if (!boardId) return;
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

  // Always-on collaboration: Auto-start collaboration when viewing a saved board
  // This allows multiple users viewing the same board to see each other automatically
  useEffect(() => {
    const startAlwaysOnCollab = async () => {
      if (
        boardId &&
        collabAPI &&
        !collabAPI.isCollaborating() &&
        !isCollabDisabled &&
        !isCollaborationLink(window.location.href) // Don't interfere with existing room links
      ) {
        // Derive a valid encryption key from boardId
        const roomKey = await deriveKeyFromBoardId(boardId);
        
        // Use boardId as the room ID for always-on collaboration
        collabAPI.startCollaboration(
          {
            roomId: boardId,
            roomKey, // Properly derived AES-128 key
          },
          { skipSceneReset: true } // Don't reset scene since board data is already loaded
        );
      }
    };
    
    startAlwaysOnCollab();
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

    const loadImages = (
      data: ResolutionType<typeof initializeScene>,
      isInitialLoad = false,
    ) => {
      if (!data.scene) {
        return;
      }
      if (collabAPI?.isCollaborating()) {
        if (data.scene.elements) {
          collabAPI
            .fetchImageFilesFromFirebase({
              elements: data.scene.elements,
              forceFetchFiles: true,
            })
            .then(({ loadedFiles, erroredFiles }) => {
              xcalidrawAPI.addFiles(loadedFiles);
              updateStaleImageStatuses({
                xcalidrawAPI,
                erroredFiles,
                elements: xcalidrawAPI.getSceneElementsIncludingDeleted(),
              });
            });
        }
      } else {
        const fileIds =
          data.scene.elements?.reduce((acc, element) => {
            if (isInitializedImageElement(element)) {
              return acc.concat(element.fileId);
            }
            return acc;
          }, [] as FileId[]) || [];

        if (data.isExternalScene) {
          loadFilesFromFirebase(
            `${FIREBASE_STORAGE_PREFIXES.shareLinkFiles}/${data.id}`,
            data.key,
            fileIds,
          ).then(({ loadedFiles, erroredFiles }) => {
            xcalidrawAPI.addFiles(loadedFiles);
            updateStaleImageStatuses({
              xcalidrawAPI,
              erroredFiles,
              elements: xcalidrawAPI.getSceneElementsIncludingDeleted(),
            });
          });
        } else if (isInitialLoad) {
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  xcalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  xcalidrawAPI,
                  erroredFiles,
                  elements: xcalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
          LocalData.fileStorage.clearObsoleteFiles({ currentFileIds: fileIds });
        }
      }
    };

    initializeScene({ collabAPI, xcalidrawAPI, boardId, boardData }).then(async (data) => {
      loadImages(data, true);
      initialStatePromiseRef.current.promise.resolve(data.scene);
      if (data.scene?.elements) {
        lastSceneVersionRef.current = hashElementsVersion(data.scene.elements);
      }
      if (data.scene?.appState?.name) {
        lastBoardTitleRef.current = data.scene.appState.name;
      }
    });

    const onHashChange = async (event: HashChangeEvent) => {
      event.preventDefault();
      const libraryUrlTokens = parseLibraryTokensFromUrl();
      if (!libraryUrlTokens) {
        if (
          collabAPI?.isCollaborating() &&
          !isCollaborationLink(window.location.href)
        ) {
          collabAPI.stopCollaboration(false);
        }
        xcalidrawAPI.updateScene({ appState: { isLoading: true } });

        initializeScene({ collabAPI, xcalidrawAPI, boardId }).then((data) => {
          loadImages(data);
          if (data.scene) {
            xcalidrawAPI.updateScene({
              ...data.scene,
              ...restore(data.scene, null, null, { repairBindings: true }),
              captureUpdate: CaptureUpdateAction.IMMEDIATELY,
            });
          }
        });
      }
    };

    const syncData = debounce(() => {
      if (isTestEnv()) {
        return;
      }
      if (
        !document.hidden &&
        ((collabAPI && !collabAPI.isCollaborating()) || isCollabDisabled)
      ) {
        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_DATA_STATE)) {
          const localDataState = importFromLocalStorage();
          const username = importUsernameFromLocalStorage();
          setLangCode(getPreferredLanguage());
          xcalidrawAPI.updateScene({
            ...localDataState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });
          LibraryIndexedDBAdapter.load().then((data) => {
            if (data) {
              xcalidrawAPI.updateLibrary({
                libraryItems: data.libraryItems,
              });
            }
          });
          collabAPI?.setUsername(username || "");
        }

        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
          const elements = xcalidrawAPI.getSceneElementsIncludingDeleted();
          const currFiles = xcalidrawAPI.getFiles();
          const fileIds =
            elements?.reduce((acc, element) => {
              if (
                isInitializedImageElement(element) &&
                !currFiles[element.fileId]
              ) {
                return acc.concat(element.fileId);
              }
              return acc;
            }, [] as FileId[]) || [];
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  xcalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  xcalidrawAPI,
                  erroredFiles,
                  elements: xcalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
        }
      }
    }, SYNC_BROWSER_TABS_TIMEOUT);

    const onUnload = () => {
      LocalData.flushSave();
    };

    const visibilityChange = (event: FocusEvent | Event) => {
      if (event.type === EVENT.BLUR || document.hidden) {
        LocalData.flushSave();
      }
      if (
        event.type === EVENT.VISIBILITY_CHANGE ||
        event.type === EVENT.FOCUS
      ) {
        syncData();
      }
    };

    window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
    window.addEventListener(EVENT.UNLOAD, onUnload, false);
    window.addEventListener(EVENT.BLUR, visibilityChange, false);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
    window.addEventListener(EVENT.FOCUS, visibilityChange, false);
    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
      window.removeEventListener(EVENT.UNLOAD, onUnload, false);
      window.removeEventListener(EVENT.BLUR, visibilityChange, false);
      window.removeEventListener(EVENT.FOCUS, visibilityChange, false);
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        visibilityChange,
        false,
      );
    };
  }, [isCollabDisabled, collabAPI, xcalidrawAPI, setLangCode, boardId, boardData]);

  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      LocalData.flushSave();

      if (
        xcalidrawAPI &&
        LocalData.fileStorage.shouldPreventUnload(
          xcalidrawAPI.getSceneElements(),
        )
      ) {
        if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
          preventUnload(event);
        } else {
          console.warn(
            "preventing unload disabled (VITE_APP_DISABLE_PREVENT_UNLOAD)",
          );
        }
      }
    };
    window.addEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    return () => {
      window.removeEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    };
  }, [xcalidrawAPI]);

  const onChange = (
    elements: readonly OrderedXcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    if (collabAPI?.isCollaborating()) {
      collabAPI.syncElements(elements);
    }

    if (!LocalData.isSavePaused()) {
      if (boardId) {
        const currentVersion = hashElementsVersion(elements);
        const currentTitle = appState.name || "";
        if (
          currentVersion !== lastSceneVersionRef.current ||
          currentTitle !== lastBoardTitleRef.current
        ) {
          lastSceneVersionRef.current = currentVersion;
          lastBoardTitleRef.current = currentTitle;
          saveToBackend(elements, appState, boardId);
        }
      }
      LocalData.save(elements, appState, files, () => {
        if (xcalidrawAPI) {
          let didChange = false;

          const elements = xcalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
              if (
                LocalData.fileStorage.shouldUpdateImageElementStatus(element)
              ) {
                const newElement = newElementWith(element, { status: "saved" });
                if (newElement !== element) {
                  didChange = true;
                }
                return newElement;
              }
              return element;
            });

          if (didChange) {
            xcalidrawAPI.updateScene({
              elements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
          }
        }
      });
    }

    if (debugCanvasRef.current && xcalidrawAPI) {
      debugRenderer(
        debugCanvasRef.current,
        appState,
        elements,
        window.devicePixelRatio,
      );
    }

    // Trigger re-render for comments only when scroll/zoom changes
    const zoomValue = typeof appState.zoom === 'object' ? appState.zoom.value : appState.zoom;
    if (
      appState.scrollX !== lastViewRef.current.scrollX ||
      appState.scrollY !== lastViewRef.current.scrollY ||
      zoomValue !== lastViewRef.current.zoom
    ) {
      lastViewRef.current = { scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: zoomValue };
      setRenderKey((k) => k + 1);
    }
  };

  const [latestShareableLink, setLatestShareableLink] = useState<string | null>(
    null,
  );

  const onExportToBackend = async (
    exportedElements: readonly NonDeletedXcalidrawElement[],
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => {
    if (exportedElements.length === 0) {
      throw new Error(t("alerts.cannotExportEmptyCanvas"));
    }
    try {
      const { url, errorMessage } = await exportToBackend(
        exportedElements,
        {
          ...appState,
          viewBackgroundColor: appState.exportBackground
            ? appState.viewBackgroundColor
            : getDefaultAppState().viewBackgroundColor,
        },
        files,
      );

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      if (url) {
        setLatestShareableLink(url);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        const { width, height } = appState;
        console.error(error, {
          width,
          height,
          devicePixelRatio: window.devicePixelRatio,
        });
        throw new Error(error.message);
      }
    }
  };

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

  if (boardId && isBoardLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-muted">
        <div className="text-muted-foreground animate-pulse">Loading board...</div>
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
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend,
              renderCustomUI: xcalidrawAPI
                ? (elements, appState, files) => {
                    return (
                      <ExportToXcalidrawPlus
                        elements={elements}
                        appState={appState}
                        files={files}
                        name={xcalidrawAPI.getName()}
                        onError={(error) => {
                          xcalidrawAPI?.updateScene({
                            appState: {
                              errorMessage: error.message,
                            },
                          });
                        }}
                        onSuccess={() => {
                          xcalidrawAPI.updateScene({
                            appState: { openDialog: null },
                          });
                        }}
                      />
                    );
                  }
                : undefined,
            },
          },
        }}
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
          {xcalidrawAPI && (
            <OverwriteConfirmDialog.Action
              title={t("overwriteConfirm.action.xcalidrawPlus.title")}
              actionLabel={t("overwriteConfirm.action.xcalidrawPlus.button")}
              onClick={() => {
                exportToXcalidrawPlus(
                  xcalidrawAPI.getSceneElements(),
                  xcalidrawAPI.getAppState(),
                  xcalidrawAPI.getFiles(),
                  xcalidrawAPI.getName(),
                );
              }}
            >
              {t("overwriteConfirm.action.xcalidrawPlus.description")}
            </OverwriteConfirmDialog.Action>
          )}
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
                setIsCommentMode(!isCommentMode);
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
      </Xcalidraw>
      {xcalidrawAPI && <Collab xcalidrawAPI={xcalidrawAPI} />}
      
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
        />
      )}
    </div>
  );
};

const BoardPage = () => {
  const { boardId } = useParams<{ boardId?: string }>();
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
          onHomeClick={handleHomeClick}
        />
      </Provider>
    </TopErrorBoundary>
  );
};

export default BoardPage;
