/**
 * Hook for initializing the scene from various sources.
 * Handles: local storage, board data from API, collaboration links, external URLs.
 */

import { APP_NAME } from "@xcalidraw/common";
import { getDefaultAppState } from "@xcalidraw/xcalidraw/appState";
import { reconcileElements } from "@xcalidraw/xcalidraw";
import { restoreAppState } from "@xcalidraw/xcalidraw/data/restore";
import { loadFromBlob } from "@xcalidraw/xcalidraw/data/blob";
import { t } from "@xcalidraw/xcalidraw/i18n";
import { openConfirmModal } from "@xcalidraw/xcalidraw/components/OverwriteConfirm/OverwriteConfirmState";
import Trans from "@xcalidraw/xcalidraw/components/Trans";

import { 
  getCollaborationLink,
  getCollaborationLinkData,
  loadScene,
} from "../../../data";
import { importFromLocalStorage } from "../../../data/localStorage";
import { getRoomKey, setRoomKey } from "../utils/roomKeyCache";
import { deriveKeyFromBoardId } from "../utils/deriveKey";
import type { InitializeSceneOpts, InitializeSceneResult } from "../types";
import type { RestoredDataState } from "@xcalidraw/xcalidraw/data/restore";
import type { RemoteXcalidrawElement } from "@xcalidraw/xcalidraw/data/reconcile";
import type { OrderedXcalidrawElement } from "@xcalidraw/element/types";

/**
 * Dialog config for confirming overwrite with shareable link data.
 */
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

/**
 * Initialize the scene from various sources.
 * @param opts - The initialization options
 * @returns The scene data and metadata
 */
export const initializeScene = async (
  opts: InitializeSceneOpts
): Promise<InitializeSceneResult> => {
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

  // If we have board data from API, use it
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

  // Get collaboration link data from URL hash
  let roomLinkData = getCollaborationLinkData(window.location.href);

  // Cache/retrieve room key for image loading
  if (roomLinkData?.roomKey && roomLinkData?.roomId) {
    setRoomKey(roomLinkData.roomId, roomLinkData.roomKey);
  } else if (opts.boardId && !roomLinkData) {
    const cachedKey = getRoomKey(opts.boardId);
    if (cachedKey) {
      roomLinkData = { roomId: opts.boardId, roomKey: cachedKey };
      window.history.replaceState(
        {},
        APP_NAME,
        getCollaborationLink({ roomId: opts.boardId, roomKey: cachedKey }),
      );
    }
  }

  const isExternalScene = !!(id || jsonBackendMatch || roomLinkData);

  // Handle external scenes
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
            { once: true },
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

  // Handle collaboration
  if (roomLinkData && opts.collabAPI) {
    const { xcalidrawAPI } = opts;

    const collabScene = await opts.collabAPI.startCollaboration(roomLinkData);

    if (collabScene) {
        return {
        scene: {
            ...collabScene,
            appState: {
            ...restoreAppState(
                {
                ...collabScene?.appState,
                theme: localDataState?.appState?.theme || collabScene?.appState?.theme,
                },
                xcalidrawAPI.getAppState(),
            ),
            isLoading: false,
            },
            elements: reconcileElements(
            (collabScene?.elements || []) as unknown as OrderedXcalidrawElement[],
            xcalidrawAPI.getSceneElementsIncludingDeleted() as any as RemoteXcalidrawElement[],
            xcalidrawAPI.getAppState(),
            ),
        },
        isExternalScene: true,
        id: roomLinkData.roomId,
        key: roomLinkData.roomKey,
        };
    } else {
        // Yjs Path: Collaboration started, but data sync is async.
        // We rely on the initial data loaded from `opts.boardData` (stored in `scene`).
        return {
            scene: {
                ...scene,
                appState: {
                    ...scene.appState,
                    isLoading: false,
                }
            },
            isExternalScene: true,
            id: roomLinkData.roomId,
            key: roomLinkData.roomKey,
        };
    }
  } else if (scene) {
    let key: string | null = null;
    if (opts.boardId) {
        key = await deriveKeyFromBoardId(opts.boardId);
    }
    return isExternalScene && jsonBackendMatch
      ? {
          scene,
          isExternalScene,
          id: jsonBackendMatch[1],
          key: jsonBackendMatch[2],
        }
      : { scene, isExternalScene: false, key: key || undefined };
  }

  return { scene: null, isExternalScene: false };
};
