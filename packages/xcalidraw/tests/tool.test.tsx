import React from "react";

import { resolvablePromise } from "@xcalidraw/common";

import { Xcalidraw } from "../index";

import { Pointer } from "./helpers/ui";
import { act, render } from "./test-utils";

import type { XcalidrawImperativeAPI } from "../types";

describe("setActiveTool()", () => {
  const h = window.h;

  let xcalidrawAPI: XcalidrawImperativeAPI;

  const mouse = new Pointer("mouse");

  beforeEach(async () => {
    const xcalidrawAPIPromise = resolvablePromise<XcalidrawImperativeAPI>();
    await render(
      <Xcalidraw
        xcalidrawAPI={(api) => xcalidrawAPIPromise.resolve(api as any)}
      />,
    );
    xcalidrawAPI = await xcalidrawAPIPromise;
  });

  it("should expose setActiveTool on package API", () => {
    expect(xcalidrawAPI.setActiveTool).toBeDefined();
    expect(xcalidrawAPI.setActiveTool).toBe(h.app.setActiveTool);
  });

  it("should set the active tool type", async () => {
    expect(h.state.activeTool.type).toBe("selection");
    act(() => {
      xcalidrawAPI.setActiveTool({ type: "rectangle" });
    });
    expect(h.state.activeTool.type).toBe("rectangle");

    mouse.down(10, 10);
    mouse.up(20, 20);

    expect(h.state.activeTool.type).toBe("selection");
  });

  it("should support tool locking", async () => {
    expect(h.state.activeTool.type).toBe("selection");
    act(() => {
      xcalidrawAPI.setActiveTool({ type: "rectangle", locked: true });
    });
    expect(h.state.activeTool.type).toBe("rectangle");

    mouse.down(10, 10);
    mouse.up(20, 20);

    expect(h.state.activeTool.type).toBe("rectangle");
  });

  it("should set custom tool", async () => {
    expect(h.state.activeTool.type).toBe("selection");
    act(() => {
      xcalidrawAPI.setActiveTool({ type: "custom", customType: "comment" });
    });
    expect(h.state.activeTool.type).toBe("custom");
    expect(h.state.activeTool.customType).toBe("comment");
  });
});
