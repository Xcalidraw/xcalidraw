/**
 * Event handler helpers for BoardPage.
 */

import { EVENT } from "@xcalidraw/common";
import { CaptureUpdateAction, restore } from "@xcalidraw/xcalidraw";
import type { XcalidrawImperativeAPI } from "@xcalidraw/xcalidraw/types";

import { LocalData } from "../../../data/LocalData";
import { isCollaborationLink } from "../../../data";
import { parseLibraryTokensFromUrl } from "@xcalidraw/xcalidraw/data/library";
import { initializeScene } from "../hooks/useSceneInitialization";
import { loadImages } from "./loadImages";
import type { CollabAPI } from "../../../collab/Collab";

interface EventHandlerParams {
  xcalidrawAPI: XcalidrawImperativeAPI;
  collabAPI: CollabAPI | null;
  boardId?: string;
}

/**
 * Create hash change handler.
 */
export const createOnHashChange = ({
  xcalidrawAPI,
  collabAPI,
  boardId,
}: EventHandlerParams) => {
  return async (event: HashChangeEvent) => {
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
  };
};

/**
 * Create unload handler.
 */
export const createOnUnload = () => {
  return () => {
    LocalData.flushSave();
  };
};

/**
 * Create visibility change handler.
 */
export const createVisibilityChange = (syncData: () => void) => {
  return (event: FocusEvent | Event) => {
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
};

/**
 * Setup all event listeners and return cleanup function.
 */
export const setupEventListeners = (
  onHashChange: (event: HashChangeEvent) => void,
  onUnload: () => void,
  visibilityChange: (event: FocusEvent | Event) => void,
) => {
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
};
