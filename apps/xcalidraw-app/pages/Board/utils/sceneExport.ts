/**
 * Functions for exporting scenes to the backend.
 */

import { getDefaultAppState } from "@xcalidraw/xcalidraw/appState";
import { t } from "@xcalidraw/xcalidraw/i18n";
import type { NonDeletedXcalidrawElement } from "@xcalidraw/element/types";
import type { AppState, BinaryFiles } from "@xcalidraw/xcalidraw/types";

import { exportToBackend } from "../../../data";

interface ExportToBackendResult {
  url: string | null;
  setShareableLink: (link: string | null) => void;
}

/**
 * Export scene to backend and get shareable link.
 */
export const exportSceneToBackend = async (
  exportedElements: readonly NonDeletedXcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  opts: {
    setLatestShareableLink: (link: string | null) => void;
    setShareDialogState: (state: { isOpen: boolean; type: string }) => void;
  }
): Promise<void> => {
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
      opts.setLatestShareableLink(url);
      opts.setShareDialogState({ isOpen: true, type: "share" });
    }
  } catch (error: any) {
    if (error.name !== "AbortError") {
      console.error(error, {
        devicePixelRatio: window.devicePixelRatio,
      });
      throw new Error(error.message);
    }
  }
};
