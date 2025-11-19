import React from "react";

import { Xcalidraw, MainMenu } from "../../index";
import { render, queryAllByTestId } from "../../tests/test-utils";

describe("Test internal component fallback rendering", () => {
  it("should render only one menu per xcalidraw instance (custom menu first scenario)", async () => {
    const { container } = await render(
      <div>
        <Xcalidraw>
          <MainMenu>test</MainMenu>
        </Xcalidraw>
        <Xcalidraw />
      </div>,
    );

    expect(queryAllByTestId(container, "main-menu-trigger")?.length).toBe(2);

    const excalContainers = container.querySelectorAll<HTMLDivElement>(
      ".xcalidraw-container",
    );

    expect(
      queryAllByTestId(excalContainers[0], "main-menu-trigger")?.length,
    ).toBe(1);
    expect(
      queryAllByTestId(excalContainers[1], "main-menu-trigger")?.length,
    ).toBe(1);
  });

  it("should render only one menu per xcalidraw instance (default menu first scenario)", async () => {
    const { container } = await render(
      <div>
        <Xcalidraw />
        <Xcalidraw>
          <MainMenu>test</MainMenu>
        </Xcalidraw>
      </div>,
    );

    expect(queryAllByTestId(container, "main-menu-trigger")?.length).toBe(2);

    const excalContainers = container.querySelectorAll<HTMLDivElement>(
      ".xcalidraw-container",
    );

    expect(
      queryAllByTestId(excalContainers[0], "main-menu-trigger")?.length,
    ).toBe(1);
    expect(
      queryAllByTestId(excalContainers[1], "main-menu-trigger")?.length,
    ).toBe(1);
  });

  it("should render only one menu per xcalidraw instance (two custom menus scenario)", async () => {
    const { container } = await render(
      <div>
        <Xcalidraw>
          <MainMenu>test</MainMenu>
        </Xcalidraw>
        <Xcalidraw>
          <MainMenu>test</MainMenu>
        </Xcalidraw>
      </div>,
    );

    expect(queryAllByTestId(container, "main-menu-trigger")?.length).toBe(2);

    const excalContainers = container.querySelectorAll<HTMLDivElement>(
      ".xcalidraw-container",
    );

    expect(
      queryAllByTestId(excalContainers[0], "main-menu-trigger")?.length,
    ).toBe(1);
    expect(
      queryAllByTestId(excalContainers[1], "main-menu-trigger")?.length,
    ).toBe(1);
  });

  it("should render only one menu per xcalidraw instance (two default menus scenario)", async () => {
    const { container } = await render(
      <div>
        <Xcalidraw />
        <Xcalidraw />
      </div>,
    );

    expect(queryAllByTestId(container, "main-menu-trigger")?.length).toBe(2);

    const excalContainers = container.querySelectorAll<HTMLDivElement>(
      ".xcalidraw-container",
    );

    expect(
      queryAllByTestId(excalContainers[0], "main-menu-trigger")?.length,
    ).toBe(1);
    expect(
      queryAllByTestId(excalContainers[1], "main-menu-trigger")?.length,
    ).toBe(1);
  });
});
