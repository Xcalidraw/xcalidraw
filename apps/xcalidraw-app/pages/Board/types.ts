/**
 * Shared types for Board page components.
 */

import type { CollabAPI } from "../../collab/Collab";
import type { XcalidrawImperativeAPI, XcalidrawInitialDataState } from "@xcalidraw/xcalidraw/types";

/**
 * Options for initializing the scene.
 */
export interface InitializeSceneOpts {
  collabAPI: CollabAPI | null;
  xcalidrawAPI: XcalidrawImperativeAPI;
  boardId?: string;
  boardData?: any;
}

/**
 * Result from scene initialization - either external with id/key, or local.
 */
export type InitializeSceneResult = { scene: XcalidrawInitialDataState | null } & (
  | { isExternalScene: true; id: string; key: string }
  | { isExternalScene: false; id?: null; key?: string | null }
);

/**
 * Props for the XcalidrawWrapper component.
 */
export interface XcalidrawWrapperProps {
  boardId?: string;
  onHomeClick?: () => void;
}

/**
 * Board data from API.
 */
export interface BoardData {
  id: string;
  title?: string;
  elements?: any[];
  appState?: Record<string, any>;
  files?: Record<string, any>;
}
