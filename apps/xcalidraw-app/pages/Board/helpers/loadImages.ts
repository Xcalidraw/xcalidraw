/**
 * Helper function to load images from various sources.
 * Prioritizes: backend, collab API, external scene, local storage.
 */

import { isInitializedImageElement } from "@xcalidraw/element";
import type { FileId } from "@xcalidraw/element/types";
import type { XcalidrawImperativeAPI } from "@xcalidraw/xcalidraw/types";

import { loadFilesFromBackend } from "../../../data/files";
import { LocalData } from "../../../data/LocalData";
import { updateStaleImageStatuses } from "../../../data/FileManager";
import type { CollabAPI } from "../../../collab/Collab";
import type { InitializeSceneResult } from "../types";

interface LoadImagesParams {
  data: InitializeSceneResult;
  isInitialLoad?: boolean;
  xcalidrawAPI: XcalidrawImperativeAPI;
  collabAPI: CollabAPI | null;
  boardId?: string;
}

/**
 * Load images for the scene based on priority.
 */
export const loadImages = ({
  data,
  isInitialLoad = false,
  xcalidrawAPI,
  collabAPI,
  boardId,
}: LoadImagesParams): void => {
  if (!data.scene) {
    return;
  }

  // Extract file IDs from scene elements
  const fileIds =
    data.scene.elements?.reduce((acc, element) => {
      if (isInitializedImageElement(element)) {
        return acc.concat(element.fileId as FileId);
      }
      return acc;
    }, [] as FileId[]) || [];

  if (!fileIds.length) {
    return; // No images to load
  }

  // Priority 1: Direct backend loading for board pages (most reliable)
  if (boardId && data.key) {
    console.log("[BoardPage] Loading images from backend for boardId:", boardId);
    loadFilesFromBackend(boardId, data.key, fileIds).then(
      ({ loadedFiles, erroredFiles }) => {
        if (loadedFiles.length) {
          xcalidrawAPI.addFiles(loadedFiles);
        }
        updateStaleImageStatuses({
          xcalidrawAPI,
          erroredFiles,
          elements: xcalidrawAPI.getSceneElementsIncludingDeleted(),
        });
      }
    );
    return;
  }

  // Priority 2: Collab API image loading (for real-time sync scenarios)
  if (collabAPI?.isCollaborating() && data.scene.elements) {
    collabAPI
      .fetchImageFilesFromBackend({
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
    return;
  }

  // Priority 3: External scene loading
  if (data.isExternalScene && data.id && data.key) {
    loadFilesFromBackend(data.id, data.key, fileIds).then(
      ({ loadedFiles, erroredFiles }) => {
        xcalidrawAPI.addFiles(loadedFiles);
        updateStaleImageStatuses({
          xcalidrawAPI,
          erroredFiles,
          elements: xcalidrawAPI.getSceneElementsIncludingDeleted(),
        });
      }
    );
    return;
  }

  // Fallback: Local storage for non-board pages
  if (isInitialLoad) {
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
    LocalData.fileStorage.clearObsoleteFiles({ currentFileIds: fileIds });
  }
};
