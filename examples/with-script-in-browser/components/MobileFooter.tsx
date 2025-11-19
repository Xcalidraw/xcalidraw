import React from "react";

import CustomFooter from "./CustomFooter";

import type * as TXcalidraw from "@xcalidraw/xcalidraw";
import type { XcalidrawImperativeAPI } from "@xcalidraw/xcalidraw/types";

const MobileFooter = ({
  xcalidrawAPI,
  xcalidrawLib,
}: {
  xcalidrawAPI: XcalidrawImperativeAPI;
  xcalidrawLib: typeof TXcalidraw;
}) => {
  const { useEditorInterface, Footer } = xcalidrawLib;

  const editorInterface = useEditorInterface();
  if (editorInterface.formFactor === "phone") {
    return (
      <Footer>
        <CustomFooter
          xcalidrawAPI={xcalidrawAPI}
          xcalidrawLib={xcalidrawLib}
        />
      </Footer>
    );
  }
  return null;
};
export default MobileFooter;
