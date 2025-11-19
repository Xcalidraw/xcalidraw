import { DEFAULT_EXPORT_PADDING, EDITOR_LS_KEYS } from "@xcalidraw/common";

import type { MermaidConfig } from "@excalidraw/mermaid-to-excalidraw";
import type { MermaidToXcalidrawResult } from "@excalidraw/mermaid-to-excalidraw/dist/interfaces";

import { EditorLocalStorage } from "../../data/EditorLocalStorage";
import { canvasToBlob } from "../../data/blob";
import { t } from "../../i18n";
import { convertToXcalidrawElements, exportToCanvas } from "../../index";

import type { NonDeletedXcalidrawElement } from "@xcalidraw/element/types";

import type { AppClassProperties, BinaryFiles } from "../../types";

const resetPreview = ({
  canvasRef,
  setError,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  setError: (error: Error | null) => void;
}) => {
  const canvasNode = canvasRef.current;

  if (!canvasNode) {
    return;
  }
  const parent = canvasNode.parentElement;
  if (!parent) {
    return;
  }
  parent.style.background = "";
  setError(null);
  canvasNode.replaceChildren();
};

export interface MermaidToXcalidrawLibProps {
  loaded: boolean;
  api: Promise<{
    parseMermaidToExcalidraw: (
      definition: string,
      config?: MermaidConfig,
    ) => Promise<MermaidToXcalidrawResult>;
  }>;
}

interface ConvertMermaidToXcalidrawFormatProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  mermaidToXcalidrawLib: MermaidToXcalidrawLibProps;
  mermaidDefinition: string;
  setError: (error: Error | null) => void;
  data: React.MutableRefObject<{
    elements: readonly NonDeletedXcalidrawElement[];
    files: BinaryFiles | null;
  }>;
}

export const convertMermaidToXcalidraw = async ({
  canvasRef,
  mermaidToXcalidrawLib,
  mermaidDefinition,
  setError,
  data,
}: ConvertMermaidToXcalidrawFormatProps) => {
  const canvasNode = canvasRef.current;
  const parent = canvasNode?.parentElement;

  if (!canvasNode || !parent) {
    return;
  }

  if (!mermaidDefinition) {
    resetPreview({ canvasRef, setError });
    return;
  }

  try {
    const api = await mermaidToXcalidrawLib.api;

    let ret;
    try {
      ret = await api.parseMermaidToExcalidraw(mermaidDefinition);
    } catch (err: any) {
      ret = await api.parseMermaidToExcalidraw(
        mermaidDefinition.replace(/"/g, "'"),
      );
    }
    const { elements, files } = ret;
    setError(null);

    data.current = {
      elements: convertToXcalidrawElements(elements, {
        regenerateIds: true,
      }),
      files,
    };

    const canvas = await exportToCanvas({
      elements: data.current.elements,
      files: data.current.files,
      exportPadding: DEFAULT_EXPORT_PADDING,
      maxWidthOrHeight:
        Math.max(parent.offsetWidth, parent.offsetHeight) *
        window.devicePixelRatio,
    });
    // if converting to blob fails, there's some problem that will
    // likely prevent preview and export (e.g. canvas too big)
    try {
      await canvasToBlob(canvas);
    } catch (e: any) {
      if (e.name === "CANVAS_POSSIBLY_TOO_BIG") {
        throw new Error(t("canvasError.canvasTooBig"));
      }
      throw e;
    }
    parent.style.background = "var(--default-bg-color)";
    canvasNode.replaceChildren(canvas);
  } catch (err: any) {
    parent.style.background = "var(--default-bg-color)";
    if (mermaidDefinition) {
      setError(err);
    }

    throw err;
  }
};

export const saveMermaidDataToStorage = (mermaidDefinition: string) => {
  EditorLocalStorage.set(
    EDITOR_LS_KEYS.MERMAID_TO_XCALIDRAW,
    mermaidDefinition,
  );
};

export const insertToEditor = ({
  app,
  data,
  text,
  shouldSaveMermaidDataToStorage,
}: {
  app: AppClassProperties;
  data: React.MutableRefObject<{
    elements: readonly NonDeletedXcalidrawElement[];
    files: BinaryFiles | null;
  }>;
  text?: string;
  shouldSaveMermaidDataToStorage?: boolean;
}) => {
  const { elements: newElements, files } = data.current;

  if (!newElements.length) {
    return;
  }

  app.addElementsFromPasteOrLibrary({
    elements: newElements,
    files,
    position: "center",
    fitToContent: true,
  });
  app.setOpenDialog(null);

  if (shouldSaveMermaidDataToStorage && text) {
    saveMermaidDataToStorage(text);
  }
};
