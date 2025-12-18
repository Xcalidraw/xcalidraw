/**
 * Hook for loading images from backend or local storage.
 * Handles multiple loading priorities: board backend, collab API, external scenes, local storage.
 */

import { isInitializedImageElement } from "@xcalidraw/element";
import type { FileId } from "@xcalidraw/element/types";
import type { XcalidrawImperativeAPI } from "@xcalidraw/xcalidraw/types";

import { loadFilesFromBackend } from "../../../data/files";
import { LocalData } from "../../../data/LocalData";
import { updateStaleImageStatuses } from "../../../data/FileManager";
import type { CollabAPI } from "../../../collab/Collab";
import type { InitializeSceneResult } from "../types";

interface LoadImagesOpts {
  xcalidrawAPI: XcalidrawImperativeAPI;
  collabAPI: CollabAPI | null;
  boardId?: string;
}

/**
 * Creates a function to load images based on scene data.
 * @param opts - Dependencies for image loading
 * @returns A function that loads images for the given scene data
 */
export const createImageLoader = (opts: LoadImagesOpts) => {
  const { xcalidrawAPI, collabAPI, boardId } = opts;

  /**
   * Load images for the scene.
   * @param data - The scene initialization result
   * @param isInitialLoad - Whether this is the initial load
   */
  return (data: InitializeSceneResult, isInitialLoad = false) => {
    if (!data.scene) {
      return;
    }

    // Extract file IDs from scene elements
    const fileIds =
      data.scene.elements?.reduce((acc, element) => {
        if (isInitializedImageElement(element)) {
          return acc.concat((element as any).fileId as FileId);
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
    if (data.isExternalScene && data.id) {
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
};
