/**
 * Helper function to sync data across browser tabs.
 */

import { debounce, isTestEnv } from "@xcalidraw/common";
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

interface SyncDataParams {
  xcalidrawAPI: XcalidrawImperativeAPI;
  collabAPI: CollabAPI | null;
  isCollabDisabled: boolean;
  setLangCode: (code: string) => void;
}

/**
 * Create a debounced sync function for browser tab data.
 */
export const createSyncData = ({
  xcalidrawAPI,
  collabAPI,
  isCollabDisabled,
  setLangCode,
}: SyncDataParams) => {
  return debounce(() => {
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
};
