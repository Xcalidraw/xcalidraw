import React, { useEffect, useRef } from "react";

import {
  CURSOR_TYPE,
  isShallowEqual,
  sceneCoordsToViewportCoords,
  type EditorInterface,
} from "@xcalidraw/common";

import type {
  NonDeletedXcalidrawElement,
  NonDeletedSceneElementsMap,
} from "@xcalidraw/element/types";

import { t } from "../../i18n";

import { AnimationController } from "../../renderer/animation";
import { renderInteractiveScene } from "../../renderer/interactiveScene";
import {
  updateCursorPosition,
  advanceCursorInterpolation,
  getInterpolatedPosition,
} from "../../cursorInterpolation";

import type {
  InteractiveCanvasRenderConfig,
  InteractiveSceneRenderAnimationState,
  InteractiveSceneRenderConfig,
  RenderableElementsMap,
  RenderInteractiveSceneCallback,
} from "../../scene/types";

import type {
  AppClassProperties,
  AppState,
  InteractiveCanvasAppState,
} from "../../types";
import type { DOMAttributes } from "react";


type InteractiveCanvasProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvas: HTMLCanvasElement | null;
  elementsMap: RenderableElementsMap;
  visibleElements: readonly NonDeletedXcalidrawElement[];
  selectedElements: readonly NonDeletedXcalidrawElement[];
  allElementsMap: NonDeletedSceneElementsMap;
  sceneNonce: number | undefined;
  selectionNonce: number | undefined;
  scale: number;
  appState: InteractiveCanvasAppState;
  renderScrollbars: boolean;
  editorInterface: EditorInterface;
  app: AppClassProperties;
  renderInteractiveSceneCallback: (
    data: RenderInteractiveSceneCallback,
  ) => void;
  handleCanvasRef: (canvas: HTMLCanvasElement | null) => void;
  onContextMenu: Exclude<
    DOMAttributes<HTMLCanvasElement | HTMLDivElement>["onContextMenu"],
    undefined
  >;
  onPointerMove: Exclude<
    DOMAttributes<HTMLCanvasElement>["onPointerMove"],
    undefined
  >;
  onPointerUp: Exclude<
    DOMAttributes<HTMLCanvasElement>["onPointerUp"],
    undefined
  >;
  onPointerCancel: Exclude<
    DOMAttributes<HTMLCanvasElement>["onPointerCancel"],
    undefined
  >;
  onTouchMove: Exclude<
    DOMAttributes<HTMLCanvasElement>["onTouchMove"],
    undefined
  >;
  onPointerDown: Exclude<
    DOMAttributes<HTMLCanvasElement>["onPointerDown"],
    undefined
  >;
  onDoubleClick: Exclude<
    DOMAttributes<HTMLCanvasElement>["onDoubleClick"],
    undefined
  >;
};

export const INTERACTIVE_SCENE_ANIMATION_KEY = "animateInteractiveScene";

const InteractiveCanvas = (props: InteractiveCanvasProps) => {
  const rendererParams = useRef(null as InteractiveSceneRenderConfig | null);

  useEffect(() => {
    const remotePointerButton: InteractiveCanvasRenderConfig["remotePointerButton"] =
      new Map();
    const remotePointerViewportCoords: InteractiveCanvasRenderConfig["remotePointerViewportCoords"] =
      new Map();
    const remoteSelectedElementIds: InteractiveCanvasRenderConfig["remoteSelectedElementIds"] =
      new Map();
    const remotePointerUsernames: InteractiveCanvasRenderConfig["remotePointerUsernames"] =
      new Map();
    const remotePointerUserStates: InteractiveCanvasRenderConfig["remotePointerUserStates"] =
      new Map();

    props.appState.collaborators.forEach((user, socketId) => {
      if (user.selectedElementIds) {
        for (const id of Object.keys(user.selectedElementIds)) {
          if (!remoteSelectedElementIds.has(id)) {
            remoteSelectedElementIds.set(id, []);
          }
          remoteSelectedElementIds.get(id)!.push(socketId);
        }
      }
      if (!user.pointer || user.pointer.renderCursor === false) {
        return;
      }
      if (user.username) {
        remotePointerUsernames.set(socketId, user.username);
      }
      if (user.userState) {
        remotePointerUserStates.set(socketId, user.userState);
      }
      remotePointerButton.set(socketId, user.button);

      // Get target viewport coords
      const targetCoords = sceneCoordsToViewportCoords(
        {
          sceneX: user.pointer.x,
          sceneY: user.pointer.y,
        },
        props.appState,
      );

      // Apply interpolation for smooth cursor movement
      const interpolatedCoords = updateCursorPosition(
        socketId,
        targetCoords.x,
        targetCoords.y,
      );

      remotePointerViewportCoords.set(socketId, interpolatedCoords);
    });

    const selectionColor = props.containerRef?.current
      ? getComputedStyle(props.containerRef.current)
          .getPropertyValue("--color-selection")
          .trim() || "#087f5b"
      : "#087f5b";

    rendererParams.current = {
      app: props.app,
      canvas: props.canvas,
      elementsMap: props.elementsMap,
      visibleElements: props.visibleElements,
      selectedElements: props.selectedElements,
      allElementsMap: props.allElementsMap,
      scale: window.devicePixelRatio,
      appState: props.appState,
      renderConfig: {
        remotePointerViewportCoords,
        remotePointerButton,
        remoteSelectedElementIds,
        remotePointerUsernames,
        remotePointerUserStates,
        selectionColor,
        renderScrollbars: props.renderScrollbars,
      },
      editorInterface: props.editorInterface,
      callback: props.renderInteractiveSceneCallback,
      animationState: {
        bindingHighlight: undefined,
      },
      deltaTime: 0,
    };
  });

  useEffect(() => {
    AnimationController.start<InteractiveSceneRenderAnimationState>(
      INTERACTIVE_SCENE_ANIMATION_KEY,
      ({
        deltaTime,
        state,
      }: {
        deltaTime: number;
        state?: InteractiveSceneRenderAnimationState;
      }) => {
        if (!rendererParams.current) {
          return {} as InteractiveSceneRenderAnimationState;
        }

        // Advance cursor interpolation each frame
        advanceCursorInterpolation();

        // Update remotePointerViewportCoords with latest interpolated positions
        if (rendererParams.current?.renderConfig.remotePointerViewportCoords) {
          rendererParams.current.renderConfig.remotePointerViewportCoords.forEach(
            (_, socketId) => {
              const interpolatedPos = getInterpolatedPosition(socketId);
              if (interpolatedPos) {
                rendererParams.current!.renderConfig.remotePointerViewportCoords.set(
                  socketId,
                  interpolatedPos,
                );
              }
            },
          );
        }

        const nextAnimationState = renderInteractiveScene({
          ...rendererParams.current!,
          deltaTime,
          animationState: state,
        }).animationState;

        // IMPORTANT: Always return a state object to keep the animation loop running
        // for smooth cursor interpolation. Previously this returned undefined when
        // no animation state, which caused the RAF loop to stop.
        if (nextAnimationState) {
          for (const key in nextAnimationState) {
            if (
              nextAnimationState[
                key as keyof InteractiveSceneRenderAnimationState
              ] !== undefined
            ) {
              return nextAnimationState;
            }
          }
        }

        // Return empty object to keep animation running for cursor interpolation
        return {} as InteractiveSceneRenderAnimationState;
      },
    );

    return () => {
      AnimationController.cancel(INTERACTIVE_SCENE_ANIMATION_KEY);
    };
  }, []);

  return (
    <canvas
      className="xcalidraw__canvas interactive"
      style={{
        width: props.appState.width,
        height: props.appState.height,
        cursor: props.appState.viewModeEnabled
          ? CURSOR_TYPE.GRAB
          : CURSOR_TYPE.AUTO,
      }}
      width={props.appState.width * props.scale}
      height={props.appState.height * props.scale}
      ref={props.handleCanvasRef}
      onContextMenu={props.onContextMenu}
      onPointerMove={props.onPointerMove}
      onPointerUp={props.onPointerUp}
      onPointerCancel={props.onPointerCancel}
      onTouchMove={props.onTouchMove}
      onPointerDown={props.onPointerDown}
      onDoubleClick={
        props.appState.viewModeEnabled ? undefined : props.onDoubleClick
      }
    >
      {t("labels.drawingCanvas")}
    </canvas>
  );
};

const getRelevantAppStateProps = (
  appState: AppState,
): InteractiveCanvasAppState => ({
  zoom: appState.zoom,
  scrollX: appState.scrollX,
  scrollY: appState.scrollY,
  width: appState.width,
  height: appState.height,
  viewModeEnabled: appState.viewModeEnabled,
  openDialog: appState.openDialog,
  editingGroupId: appState.editingGroupId,
  selectedElementIds: appState.selectedElementIds,
  frameToHighlight: appState.frameToHighlight,
  offsetLeft: appState.offsetLeft,
  offsetTop: appState.offsetTop,
  theme: appState.theme,
  selectionElement: appState.selectionElement,
  selectedGroupIds: appState.selectedGroupIds,
  selectedLinearElement: appState.selectedLinearElement,
  multiElement: appState.multiElement,
  isBindingEnabled: appState.isBindingEnabled,
  suggestedBindings: appState.suggestedBindings,
  isRotating: appState.isRotating,
  elementsToHighlight: appState.elementsToHighlight,
  collaborators: appState.collaborators, // Necessary for collab. sessions
  activeEmbeddable: appState.activeEmbeddable,
  snapLines: appState.snapLines,
  zenModeEnabled: appState.zenModeEnabled,
  editingTextElement: appState.editingTextElement,
  isCropping: appState.isCropping,
  croppingElementId: appState.croppingElementId,
  searchMatches: appState.searchMatches,
  activeLockedId: appState.activeLockedId,
});

const areEqual = (
  prevProps: InteractiveCanvasProps,
  nextProps: InteractiveCanvasProps,
) => {
  // This could be further optimised if needed, as we don't have to render interactive canvas on each scene mutation
  if (
    prevProps.selectionNonce !== nextProps.selectionNonce ||
    prevProps.sceneNonce !== nextProps.sceneNonce ||
    prevProps.scale !== nextProps.scale ||
    // we need to memoize on elementsMap because they may have renewed
    // even if sceneNonce didn't change (e.g. we filter elements out based
    // on appState)
    prevProps.elementsMap !== nextProps.elementsMap ||
    prevProps.visibleElements !== nextProps.visibleElements ||
    prevProps.selectedElements !== nextProps.selectedElements ||
    prevProps.renderScrollbars !== nextProps.renderScrollbars
  ) {
    return false;
  }

  // Comparing the interactive appState for changes in case of some edge cases
  return isShallowEqual(
    // asserting AppState because we're being passed the whole AppState
    // but resolve to only the InteractiveCanvas-relevant props
    getRelevantAppStateProps(prevProps.appState as AppState),
    getRelevantAppStateProps(nextProps.appState as AppState),
  );
};

export default React.memo(InteractiveCanvas, areEqual);
