import { useState, useLayoutEffect } from "react";

import { THEME } from "@xcalidraw/common";

import { useEditorInterface, useXcalidrawContainer } from "../components/App";
import { useUIAppState } from "../context/ui-appState";

export const useCreatePortalContainer = (opts?: {
  className?: string;
  parentSelector?: string;
}) => {
  const [div, setDiv] = useState<HTMLDivElement | null>(null);

  const editorInterface = useEditorInterface();
  const { theme } = useUIAppState();

  const { container: xcalidrawContainer } = useXcalidrawContainer();

  useLayoutEffect(() => {
    if (div) {
      div.className = "";
      div.classList.add("xcalidraw", ...(opts?.className?.split(/\s+/) || []));
      div.classList.toggle(
        "xcalidraw--mobile",
        editorInterface.formFactor === "phone",
      );
      div.classList.toggle("theme--dark", theme === THEME.DARK);
    }
  }, [div, theme, editorInterface.formFactor, opts?.className]);

  useLayoutEffect(() => {
    const container = opts?.parentSelector
      ? xcalidrawContainer?.querySelector(opts.parentSelector)
      : document.body;

    if (!container) {
      return;
    }

    const div = document.createElement("div");

    container.appendChild(div);

    setDiv(div);

    return () => {
      container.removeChild(div);
    };
  }, [xcalidrawContainer, opts?.parentSelector]);

  return div;
};
