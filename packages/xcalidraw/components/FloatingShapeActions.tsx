import clsx from "clsx";

import { CLASSES, sceneCoordsToViewportCoords } from "@xcalidraw/common";
import {
  getCommonBoundingBox,
  getContainerElement,
  getElementAbsoluteCoords,
  isTextElement,
} from "@xcalidraw/element";

import type {
  NonDeletedSceneElementsMap,
  XcalidrawTextElement,
} from "@xcalidraw/element/types";

import { useCanvasMoving } from "../hooks/useCanvasMoving";

import { SelectedShapeActions } from "./Actions";
import { Island } from "./Island";
import { Section } from "./Section";

import "./FloatingShapeActions.scss";

import type { ActionManager } from "../actions/manager";
import type { AppClassProperties, UIAppState } from "../types";

const MENU_WIDTH = 202;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 10;

type FloatingShapeActionsProps = {
  appState: UIAppState;
  app: AppClassProperties;
  actionManager: ActionManager;
};

export const FloatingShapeActions = ({
  appState,
  app,
  actionManager,
}: FloatingShapeActionsProps) => {
  // Hook returns scroll/zoom state to force re-render with fresh position after movement
  const { isStable: isCanvasStable } = useCanvasMoving(app);

  const elementsMap = app.scene.getNonDeletedElementsMap();
  const selectedElements = app.scene.getSelectedElements(app.state);

  // Use editing text element or selected elements
  const targetElements = app.state.editingTextElement
    ? [app.state.editingTextElement]
    : selectedElements;

  if (targetElements.length === 0) {
    return null;
  }

  // Get position elements (use container for bound text)
  const positionElements = targetElements.map((el) => {
    if (isTextElement(el)) {
      const container = getContainerElement(
        el as XcalidrawTextElement,
        elementsMap,
      );
      return container || el;
    }
    return el;
  });

  // Get bounding box
  const bounds =
    positionElements.length === 1
      ? (() => {
          const el = positionElements[0];
          const [x1, y1, x2, y2] = getElementAbsoluteCoords(el, elementsMap);
          return { minX: x1, minY: y1, maxX: x2, maxY: y2 };
        })()
      : getCommonBoundingBox(positionElements);

  // Convert to viewport coordinates
  const { offsetLeft, offsetTop, width, height } = app.state;
  const topLeft = sceneCoordsToViewportCoords(
    { sceneX: bounds.minX, sceneY: bounds.minY },
    app.state,
  );
  const bottomRight = sceneCoordsToViewportCoords(
    { sceneX: bounds.maxX, sceneY: bounds.maxY },
    app.state,
  );

  // Check if element is in viewport
  const elLeft = topLeft.x - offsetLeft;
  const elTop = topLeft.y - offsetTop;
  const elRight = bottomRight.x - offsetLeft;
  const elBottom = bottomRight.y - offsetTop;

  const isInViewport =
    elRight > 0 && elLeft < width && elBottom > 0 && elTop < height;

  if (!isInViewport) {
    return null;
  }

  // Calculate menu position (clamped to viewport)
  const left = Math.min(
    Math.max(VIEWPORT_PADDING, elLeft - MENU_WIDTH - MENU_GAP),
    width - MENU_WIDTH - VIEWPORT_PADDING,
  );
  const top = Math.max(VIEWPORT_PADDING, elTop);
  const maxHeight = Math.max(200, height - top - VIEWPORT_PADDING);

  return (
    <div
      className={clsx("floating-shape-actions", { hidden: !isCanvasStable })}
      style={{ left, top }}
    >
      <Section
        heading="selectedShapeActions"
        className={clsx("selected-shape-actions zen-mode-transition", {
          "transition-left": appState.zenModeEnabled,
        })}
      >
        <Island
          className={CLASSES.SHAPE_ACTIONS_MENU}
          padding={2}
          style={{ maxHeight, overflowY: "auto" }}
        >
          <SelectedShapeActions
            appState={app.state}
            elementsMap={elementsMap as NonDeletedSceneElementsMap}
            renderAction={actionManager.renderAction}
            app={app}
          />
        </Island>
      </Section>
    </div>
  );
};
