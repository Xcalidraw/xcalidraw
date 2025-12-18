/**
 * Creates a function for handling scene changes and persistence.
 * Syncs with collab, saves to backend, and updates local storage.
 */

import { hashElementsVersion, CaptureUpdateAction } from "@xcalidraw/xcalidraw";
import { newElementWith } from "@xcalidraw/element";
import type { OrderedXcalidrawElement } from "@xcalidraw/element/types";
import type { AppState, XcalidrawImperativeAPI, BinaryFiles } from "@xcalidraw/xcalidraw/types";

import { LocalData } from "../../../data/LocalData";
import type { CollabAPI } from "../../../collab/Collab";

interface ScenePersistenceOpts {
  xcalidrawAPI: XcalidrawImperativeAPI;
  collabAPI: CollabAPI | null;
  boardId?: string;
  lastSceneVersionRef: React.MutableRefObject<number>;
  lastBoardTitleRef: React.MutableRefObject<string>;
  saveToBackend?: (elements: readonly OrderedXcalidrawElement[], appState: AppState, boardId: string) => void;
  debugCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  debugRenderer?: (canvas: HTMLCanvasElement, appState: AppState, elements: readonly OrderedXcalidrawElement[], devicePixelRatio: number) => void;
  lastViewRef?: React.MutableRefObject<{ scrollX: number; scrollY: number; zoom: number }>;
  setRenderKey?: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Creates an onChange handler for scene persistence.
 * @param opts - Dependencies for persistence
 * @returns The onChange handler
 */
export const createOnChangeHandler = (opts: ScenePersistenceOpts) => {
  const {
    xcalidrawAPI,
    collabAPI,
    boardId,
    lastSceneVersionRef,
    lastBoardTitleRef,
    saveToBackend,
    debugCanvasRef,
    debugRenderer,
    lastViewRef,
    setRenderKey,
  } = opts;

  return (
    elements: readonly OrderedXcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    // Sync with collaboration
    if (collabAPI?.isCollaborating()) {
      collabAPI.syncElements(elements);
    }

    // Save to backend/localStorage
    if (!LocalData.isSavePaused()) {
      if (boardId && saveToBackend) {
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
              elements: updatedElements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
          }
        }
      });
    }

    // Debug canvas rendering
    if (debugCanvasRef?.current && xcalidrawAPI && debugRenderer) {
      debugRenderer(
        debugCanvasRef.current,
        appState,
        elements,
        window.devicePixelRatio,
      );
    }

    // Trigger re-render for comments when scroll/zoom changes
    if (lastViewRef && setRenderKey) {
      const zoomValue = typeof appState.zoom === 'object' ? appState.zoom.value : appState.zoom;
      if (
        appState.scrollX !== lastViewRef.current.scrollX ||
        appState.scrollY !== lastViewRef.current.scrollY ||
        zoomValue !== lastViewRef.current.zoom
      ) {
        lastViewRef.current = { scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: zoomValue };
        setRenderKey((k) => k + 1);
      }
    }
  };
};
