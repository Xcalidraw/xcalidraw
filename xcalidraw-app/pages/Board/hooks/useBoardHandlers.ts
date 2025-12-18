/**
 * useBoardHandlers - Consolidated hook for all board event handlers.
 * Returns a single object with all handlers for clean access.
 * 
 * Usage:
 *   const boardHandlers = useBoardHandlers({ ...deps });
 *   boardHandlers.onChange(elements, appState, files);
 *   boardHandlers.onExportToBackend(elements, appState, files);
 */

import { useMemo, useCallback } from "react";
import { hashElementsVersion, CaptureUpdateAction, restore } from "@xcalidraw/xcalidraw";
import { debounce, EVENT, isTestEnv, preventUnload } from "@xcalidraw/common";
import { newElementWith, isInitializedImageElement } from "@xcalidraw/element";
import { parseLibraryTokensFromUrl } from "@xcalidraw/xcalidraw/data/library";
import { getDefaultAppState } from "@xcalidraw/xcalidraw/appState";
import { t } from "@xcalidraw/xcalidraw/i18n";
import type { FileId, OrderedXcalidrawElement, NonDeletedXcalidrawElement } from "@xcalidraw/element/types";
import type { AppState, XcalidrawImperativeAPI, BinaryFiles, UIAppState } from "@xcalidraw/xcalidraw/types";

import { LocalData, LibraryIndexedDBAdapter } from "../../../data/LocalData";
import { exportToBackend, isCollaborationLink } from "../../../data";
import { isBrowserStorageStateNewer } from "../../../data/tabSync";
import { updateStaleImageStatuses } from "../../../data/FileManager";
import { importFromLocalStorage, importUsernameFromLocalStorage } from "../../../data/localStorage";
import { debugRenderer } from "../../../components/DebugCanvas";
import { getPreferredLanguage } from "../../../app-language/language-detector";
import { STORAGE_KEYS, SYNC_BROWSER_TABS_TIMEOUT } from "../../../app_constants";
import { initializeScene } from "./useSceneInitialization";
import { loadImages } from "../helpers/loadImages";
import type { CollabAPI } from "../../../collab/Collab";

/**
 * Dependencies for useBoardHandlers hook.
 */
export interface UseBoardHandlersDeps {
  xcalidrawAPI: XcalidrawImperativeAPI | null;
  collabAPI: CollabAPI | null;
  isCollabDisabled: boolean;
  boardId?: string;
  // Refs
  lastSceneVersionRef: React.MutableRefObject<number>;
  lastBoardTitleRef: React.MutableRefObject<string>;
  lastViewRef: React.MutableRefObject<{ scrollX: number; scrollY: number; zoom: number }>;
  debugCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  // State setters
  setLangCode: (code: string) => void;
  setRenderKey: React.Dispatch<React.SetStateAction<number>>;
  setLatestShareableLink: (link: string | null) => void;
  // Callbacks
  saveToBackend: (elements: readonly OrderedXcalidrawElement[], appState: AppState, boardId: string) => void;
}

/**
 * Board handlers returned by the hook.
 */
export interface BoardHandlers {
  onChange: (elements: readonly OrderedXcalidrawElement[], appState: AppState, files: BinaryFiles) => void;
  onExportToBackend: (exportedElements: readonly NonDeletedXcalidrawElement[], appState: Partial<AppState>, files: BinaryFiles) => Promise<void>;
  onHashChange: (event: HashChangeEvent) => Promise<void>;
  onUnload: () => void;
  onBeforeUnload: (event: BeforeUnloadEvent) => void;
  syncData: ReturnType<typeof debounce>;
  visibilityChange: (event: FocusEvent | Event) => void;
  setupEventListeners: () => () => void;
}

/**
 * Hook to create all board handlers with consistent dependencies.
 */
export const useBoardHandlers = (deps: UseBoardHandlersDeps): BoardHandlers => {
  const {
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
  } = deps;

  // onChange handler - syncs scene, saves to backend/localStorage
  const onChange = useCallback((
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
          const updatedElements = xcalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
              if (LocalData.fileStorage.shouldUpdateImageElementStatus(element)) {
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
              elements: updatedElements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
          }
        }
      });
    }

    if (debugCanvasRef.current && xcalidrawAPI) {
      debugRenderer(debugCanvasRef.current, appState, elements, window.devicePixelRatio);
    }

    const zoomValue = typeof appState.zoom === 'object' ? appState.zoom.value : appState.zoom;
    if (
      appState.scrollX !== lastViewRef.current.scrollX ||
      appState.scrollY !== lastViewRef.current.scrollY ||
      zoomValue !== lastViewRef.current.zoom
    ) {
      lastViewRef.current = { scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: zoomValue };
      setRenderKey((k) => k + 1);
    }
  }, [collabAPI, xcalidrawAPI, boardId, lastSceneVersionRef, lastBoardTitleRef, lastViewRef, debugCanvasRef, saveToBackend, setRenderKey]);

  // onExportToBackend handler
  const onExportToBackend = useCallback(async (
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
        console.error(error, { devicePixelRatio: window.devicePixelRatio });
        throw new Error(error.message);
      }
    }
  }, [setLatestShareableLink]);

  // onHashChange handler
  const onHashChange = useCallback(async (event: HashChangeEvent) => {
    if (!xcalidrawAPI) return;
    event.preventDefault();
    const libraryUrlTokens = parseLibraryTokensFromUrl();
    if (!libraryUrlTokens) {
      if (collabAPI?.isCollaborating() && !isCollaborationLink(window.location.href)) {
        collabAPI.stopCollaboration(false);
      }
      xcalidrawAPI.updateScene({ appState: { isLoading: true } });

      initializeScene({ collabAPI, xcalidrawAPI, boardId }).then((data) => {
        loadImages({ data, xcalidrawAPI, collabAPI, boardId });
        if (data.scene) {
          xcalidrawAPI.updateScene({
            ...data.scene,
            ...restore(data.scene, null, null, { repairBindings: true }),
            captureUpdate: CaptureUpdateAction.IMMEDIATELY,
          });
        }
      });
    }
  }, [xcalidrawAPI, collabAPI, boardId]);

  // onUnload handler
  const onUnload = useCallback(() => {
    LocalData.flushSave();
  }, []);

  // onBeforeUnload handler
  const onBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    LocalData.flushSave();
    if (
      xcalidrawAPI &&
      LocalData.fileStorage.shouldPreventUnload(xcalidrawAPI.getSceneElements())
    ) {
      if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
        preventUnload(event);
      }
    }
  }, [xcalidrawAPI]);

  // syncData - debounced sync for browser tabs
  const syncData = useMemo(() => debounce(() => {
    if (isTestEnv() || !xcalidrawAPI) return;
    if (!document.hidden && ((collabAPI && !collabAPI.isCollaborating()) || isCollabDisabled)) {
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
            xcalidrawAPI.updateLibrary({ libraryItems: data.libraryItems });
          }
        });
        collabAPI?.setUsername(username || "");
      }

      if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
        const elements = xcalidrawAPI.getSceneElementsIncludingDeleted();
        const currFiles = xcalidrawAPI.getFiles();
        const fileIds = elements?.reduce((acc, element) => {
          if (isInitializedImageElement(element) && !currFiles[(element as any).fileId]) {
            return acc.concat((element as any).fileId as FileId);
          }
          return acc;
        }, [] as FileId[]) || [];
        if (fileIds.length) {
          LocalData.fileStorage.getFiles(fileIds).then(({ loadedFiles, erroredFiles }) => {
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
  }, SYNC_BROWSER_TABS_TIMEOUT), [xcalidrawAPI, collabAPI, isCollabDisabled, setLangCode]);

  // visibilityChange handler
  const visibilityChange = useCallback((event: FocusEvent | Event) => {
    if (event.type === EVENT.BLUR || document.hidden) {
      LocalData.flushSave();
    }
    if (event.type === EVENT.VISIBILITY_CHANGE || event.type === EVENT.FOCUS) {
      syncData();
    }
  }, [syncData]);

  // Setup all event listeners - returns cleanup function
  const setupEventListeners = useCallback(() => {
    window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
    window.addEventListener(EVENT.UNLOAD, onUnload, false);
    window.addEventListener(EVENT.BLUR, visibilityChange, false);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
    window.addEventListener(EVENT.FOCUS, visibilityChange, false);
    window.addEventListener(EVENT.BEFORE_UNLOAD, onBeforeUnload);

    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
      window.removeEventListener(EVENT.UNLOAD, onUnload, false);
      window.removeEventListener(EVENT.BLUR, visibilityChange, false);
      window.removeEventListener(EVENT.FOCUS, visibilityChange, false);
      document.removeEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
      window.removeEventListener(EVENT.BEFORE_UNLOAD, onBeforeUnload);
    };
  }, [onHashChange, onUnload, visibilityChange, onBeforeUnload]);

  return {
    onChange,
    onExportToBackend,
    onHashChange,
    onUnload,
    onBeforeUnload,
    syncData,
    visibilityChange,
    setupEventListeners,
  };
};
