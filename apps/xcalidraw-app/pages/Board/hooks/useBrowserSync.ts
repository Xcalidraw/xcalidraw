/**
 * Hook/utilities for browser tab synchronization.
 * Handles: visibility changes, focus events, unload, localStorage sync.
 */

import { useEffect } from "react";
import { debounce, EVENT, isTestEnv } from "@xcalidraw/common";
import { CaptureUpdateAction } from "@xcalidraw/xcalidraw";
import { isInitializedImageElement } from "@xcalidraw/element";
import type { FileId } from "@xcalidraw/element/types";
import type { XcalidrawImperativeAPI } from "@xcalidraw/xcalidraw/types";

import { LocalData, LibraryIndexedDBAdapter } from "../../../data/LocalData";
import { 
  importFromLocalStorage, 
  importUsernameFromLocalStorage,
} from "../../../data/localStorage";
import { isBrowserStorageStateNewer } from "../../../data/tabSync";
import { updateStaleImageStatuses } from "../../../data/FileManager";
import { STORAGE_KEYS, SYNC_BROWSER_TABS_TIMEOUT } from "../../../app_constants";
import { getPreferredLanguage } from "../../../app-language/language-detector";
import type { CollabAPI } from "../../../collab/Collab";

interface BrowserSyncOpts {
  xcalidrawAPI: XcalidrawImperativeAPI;
  collabAPI: CollabAPI | null;
  isCollabDisabled: boolean;
  setLangCode: (code: string) => void;
  onHashChange: (event: HashChangeEvent) => Promise<void>;
}

/**
 * Custom hook for browser tab synchronization.
 * Sets up event listeners for visibility, focus, and unload.
 */
export const useBrowserSync = (opts: BrowserSyncOpts) => {
  const { xcalidrawAPI, collabAPI, isCollabDisabled, setLangCode, onHashChange } = opts;

  useEffect(() => {
    if (!xcalidrawAPI) return;

    // Sync data when tab becomes visible or focused
    const syncData = debounce(() => {
      if (isTestEnv()) {
        return;
      }
      if (
        !document.hidden &&
        ((collabAPI && !collabAPI.isCollaborating()) || isCollabDisabled)
      ) {
        // Sync scene data
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

        // Sync files
        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
          const elements = xcalidrawAPI.getSceneElementsIncludingDeleted();
          const currFiles = xcalidrawAPI.getFiles();
          const fileIds =
            elements?.reduce((acc, element) => {
              if (
                isInitializedImageElement(element) &&
                !currFiles[(element as any).fileId]
              ) {
                return acc.concat((element as any).fileId as FileId);
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
  }, [xcalidrawAPI, collabAPI, isCollabDisabled, setLangCode, onHashChange]);
};
