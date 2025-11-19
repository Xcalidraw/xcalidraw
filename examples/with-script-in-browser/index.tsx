import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@xcalidraw/xcalidraw/index.css";

import App from "./components/ExampleApp";

import type * as TXcalidraw from "@xcalidraw/xcalidraw";

declare global {
  interface Window {
    XcalidrawLib: typeof TXcalidraw;
  }
}

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
const { Xcalidraw } = window.XcalidrawLib;
root.render(
  <StrictMode>
    <App
      appTitle={"Xcalidraw Example"}
      useCustom={(api: any, args?: any[]) => {}}
      xcalidrawLib={window.XcalidrawLib}
    >
      <Xcalidraw />
    </App>
  </StrictMode>,
);
