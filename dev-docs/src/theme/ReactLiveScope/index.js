import React from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import initialData from "@site/src/initialData";
import { useColorMode } from "@docusaurus/theme-common";

import "@xcalidraw/xcalidraw/index.css";

let XcalidrawComp = {};
if (ExecutionEnvironment.canUseDOM) {
  XcalidrawComp = require("@xcalidraw/xcalidraw");
}
const Xcalidraw = React.forwardRef((props, ref) => {
  if (!window.XCALIDRAW_ASSET_PATH) {
    window.XCALIDRAW_ASSET_PATH =
      "https://esm.sh/@xcalidraw/xcalidraw@0.18.0/dist/prod/";
  }

  const { colorMode } = useColorMode();
  return <XcalidrawComp.Xcalidraw theme={colorMode} {...props} ref={ref} />;
});
// Add react-live imports you need here
const XcalidrawScope = {
  React,
  ...React,
  Xcalidraw,
  Footer: XcalidrawComp.Footer,
  useDevice: XcalidrawComp.useDevice,
  MainMenu: XcalidrawComp.MainMenu,
  WelcomeScreen: XcalidrawComp.WelcomeScreen,
  LiveCollaborationTrigger: XcalidrawComp.LiveCollaborationTrigger,
  Sidebar: XcalidrawComp.Sidebar,
  exportToCanvas: XcalidrawComp.exportToCanvas,
  initialData,
  useI18n: XcalidrawComp.useI18n,
  convertToXcalidrawElements: XcalidrawComp.convertToXcalidrawElements,
  CaptureUpdateAction: XcalidrawComp.CaptureUpdateAction,
};

export default XcalidrawScope;
