"use client";
import * as xcalidrawLib from "@xcalidraw/xcalidraw";
import { Xcalidraw } from "@xcalidraw/xcalidraw";

import "@xcalidraw/xcalidraw/index.css";

import App from "../../with-script-in-browser/components/ExampleApp";

const XcalidrawWrapper: React.FC = () => {
  return (
    <>
      <App
        appTitle={"Xcalidraw with Nextjs Example"}
        useCustom={(api: any, args?: any[]) => {}}
        xcalidrawLib={xcalidrawLib}
      >
        <Xcalidraw />
      </App>
    </>
  );
};

export default XcalidrawWrapper;
