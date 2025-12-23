/**
 * Factory function to create the onExportToBackend handler.
 */

import { getDefaultAppState } from "@xcalidraw/xcalidraw/appState";
import { t } from "@xcalidraw/xcalidraw/i18n";
import type { NonDeletedXcalidrawElement } from "@xcalidraw/element/types";
import type { AppState, BinaryFiles } from "@xcalidraw/xcalidraw/types";

import { exportToBackend } from "../../../data";

interface CreateOnExportParams {
  setLatestShareableLink: (link: string | null) => void;
}

/**
 * Create the onExportToBackend handler.
 */
export const createOnExportToBackend = ({
  setLatestShareableLink,
}: CreateOnExportParams) => {
  return async (
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
};
