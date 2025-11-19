import { ROUNDNESS, assertNever } from "@xcalidraw/common";

import { pointsEqual } from "@xcalidraw/math";

import type { ElementOrToolType } from "@xcalidraw/xcalidraw/types";

import type { MarkNonNullable } from "@xcalidraw/common/utility-types";

import type { Bounds } from "./bounds";
import type {
  XcalidrawElement,
  XcalidrawTextElement,
  XcalidrawEmbeddableElement,
  XcalidrawLinearElement,
  XcalidrawBindableElement,
  XcalidrawFreeDrawElement,
  InitializedXcalidrawImageElement,
  XcalidrawImageElement,
  XcalidrawTextElementWithContainer,
  XcalidrawTextContainer,
  XcalidrawFrameElement,
  RoundnessType,
  XcalidrawFrameLikeElement,
  XcalidrawElementType,
  XcalidrawIframeElement,
  XcalidrawIframeLikeElement,
  XcalidrawMagicFrameElement,
  XcalidrawArrowElement,
  XcalidrawElbowArrowElement,
  XcalidrawLineElement,
  PointBinding,
  FixedPointBinding,
  XcalidrawFlowchartNodeElement,
  XcalidrawLinearElementSubType,
} from "./types";

export const isInitializedImageElement = (
  element: XcalidrawElement | null,
): element is InitializedXcalidrawImageElement => {
  return !!element && element.type === "image" && !!element.fileId;
};

export const isImageElement = (
  element: XcalidrawElement | null,
): element is XcalidrawImageElement => {
  return !!element && element.type === "image";
};

export const isEmbeddableElement = (
  element: XcalidrawElement | null | undefined,
): element is XcalidrawEmbeddableElement => {
  return !!element && element.type === "embeddable";
};

export const isIframeElement = (
  element: XcalidrawElement | null,
): element is XcalidrawIframeElement => {
  return !!element && element.type === "iframe";
};

export const isIframeLikeElement = (
  element: XcalidrawElement | null,
): element is XcalidrawIframeLikeElement => {
  return (
    !!element && (element.type === "iframe" || element.type === "embeddable")
  );
};

export const isTextElement = (
  element: XcalidrawElement | null,
): element is XcalidrawTextElement => {
  return element != null && element.type === "text";
};

export const isFrameElement = (
  element: XcalidrawElement | null,
): element is XcalidrawFrameElement => {
  return element != null && element.type === "frame";
};

export const isMagicFrameElement = (
  element: XcalidrawElement | null,
): element is XcalidrawMagicFrameElement => {
  return element != null && element.type === "magicframe";
};

export const isFrameLikeElement = (
  element: XcalidrawElement | null,
): element is XcalidrawFrameLikeElement => {
  return (
    element != null &&
    (element.type === "frame" || element.type === "magicframe")
  );
};

export const isFreeDrawElement = (
  element?: XcalidrawElement | null,
): element is XcalidrawFreeDrawElement => {
  return element != null && isFreeDrawElementType(element.type);
};

export const isFreeDrawElementType = (
  elementType: XcalidrawElementType,
): boolean => {
  return elementType === "freedraw";
};

export const isLinearElement = (
  element?: XcalidrawElement | null,
): element is XcalidrawLinearElement => {
  return element != null && isLinearElementType(element.type);
};

export const isLineElement = (
  element?: XcalidrawElement | null,
): element is XcalidrawLineElement => {
  return element != null && element.type === "line";
};

export const isArrowElement = (
  element?: XcalidrawElement | null,
): element is XcalidrawArrowElement => {
  return element != null && element.type === "arrow";
};

export const isElbowArrow = (
  element?: XcalidrawElement,
): element is XcalidrawElbowArrowElement => {
  return isArrowElement(element) && element.elbowed;
};

/**
 * sharp or curved arrow, but not elbow
 */
export const isSimpleArrow = (
  element?: XcalidrawElement,
): element is XcalidrawArrowElement => {
  return isArrowElement(element) && !element.elbowed;
};

export const isSharpArrow = (
  element?: XcalidrawElement,
): element is XcalidrawArrowElement => {
  return isArrowElement(element) && !element.elbowed && !element.roundness;
};

export const isCurvedArrow = (
  element?: XcalidrawElement,
): element is XcalidrawArrowElement => {
  return (
    isArrowElement(element) && !element.elbowed && element.roundness !== null
  );
};

export const isLinearElementType = (
  elementType: ElementOrToolType,
): boolean => {
  return (
    elementType === "arrow" || elementType === "line" // || elementType === "freedraw"
  );
};

export const isBindingElement = (
  element?: XcalidrawElement | null,
  includeLocked = true,
): element is XcalidrawLinearElement => {
  return (
    element != null &&
    (!element.locked || includeLocked === true) &&
    isBindingElementType(element.type)
  );
};

export const isBindingElementType = (
  elementType: ElementOrToolType,
): boolean => {
  return elementType === "arrow";
};

export const isBindableElement = (
  element: XcalidrawElement | null | undefined,
  includeLocked = true,
): element is XcalidrawBindableElement => {
  return (
    element != null &&
    (!element.locked || includeLocked === true) &&
    (element.type === "rectangle" ||
      element.type === "diamond" ||
      element.type === "ellipse" ||
      element.type === "image" ||
      element.type === "iframe" ||
      element.type === "embeddable" ||
      element.type === "frame" ||
      element.type === "magicframe" ||
      (element.type === "text" && !element.containerId))
  );
};

export const isRectanguloidElement = (
  element?: XcalidrawElement | null,
): element is XcalidrawBindableElement => {
  return (
    element != null &&
    (element.type === "rectangle" ||
      element.type === "diamond" ||
      element.type === "image" ||
      element.type === "iframe" ||
      element.type === "embeddable" ||
      element.type === "frame" ||
      element.type === "magicframe" ||
      (element.type === "text" && !element.containerId))
  );
};

// TODO: Remove this when proper distance calculation is introduced
// @see binding.ts:distanceToBindableElement()
export const isRectangularElement = (
  element?: XcalidrawElement | null,
): element is XcalidrawBindableElement => {
  return (
    element != null &&
    (element.type === "rectangle" ||
      element.type === "image" ||
      element.type === "text" ||
      element.type === "iframe" ||
      element.type === "embeddable" ||
      element.type === "frame" ||
      element.type === "magicframe" ||
      element.type === "freedraw")
  );
};

export const isTextBindableContainer = (
  element: XcalidrawElement | null,
  includeLocked = true,
): element is XcalidrawTextContainer => {
  return (
    element != null &&
    (!element.locked || includeLocked === true) &&
    (element.type === "rectangle" ||
      element.type === "diamond" ||
      element.type === "ellipse" ||
      isArrowElement(element))
  );
};

export const isXcalidrawElement = (
  element: any,
): element is XcalidrawElement => {
  const type: XcalidrawElementType | undefined = element?.type;
  if (!type) {
    return false;
  }
  switch (type) {
    case "text":
    case "diamond":
    case "rectangle":
    case "iframe":
    case "embeddable":
    case "ellipse":
    case "arrow":
    case "freedraw":
    case "line":
    case "frame":
    case "magicframe":
    case "image":
    case "selection": {
      return true;
    }
    default: {
      assertNever(type, null);
      return false;
    }
  }
};

export const isFlowchartNodeElement = (
  element: XcalidrawElement,
): element is XcalidrawFlowchartNodeElement => {
  return (
    element.type === "rectangle" ||
    element.type === "ellipse" ||
    element.type === "diamond"
  );
};

export const hasBoundTextElement = (
  element: XcalidrawElement | null,
): element is MarkNonNullable<XcalidrawBindableElement, "boundElements"> => {
  return (
    isTextBindableContainer(element) &&
    !!element.boundElements?.some(({ type }) => type === "text")
  );
};

export const isBoundToContainer = (
  element: XcalidrawElement | null,
): element is XcalidrawTextElementWithContainer => {
  return (
    element !== null &&
    "containerId" in element &&
    element.containerId !== null &&
    isTextElement(element)
  );
};

export const isArrowBoundToElement = (element: XcalidrawArrowElement) => {
  return !!element.startBinding || !!element.endBinding;
};

export const isUsingAdaptiveRadius = (type: string) =>
  type === "rectangle" ||
  type === "embeddable" ||
  type === "iframe" ||
  type === "image";

export const isUsingProportionalRadius = (type: string) =>
  type === "line" || type === "arrow" || type === "diamond";

export const canApplyRoundnessTypeToElement = (
  roundnessType: RoundnessType,
  element: XcalidrawElement,
) => {
  if (
    (roundnessType === ROUNDNESS.ADAPTIVE_RADIUS ||
      // if legacy roundness, it can be applied to elements that currently
      // use adaptive radius
      roundnessType === ROUNDNESS.LEGACY) &&
    isUsingAdaptiveRadius(element.type)
  ) {
    return true;
  }
  if (
    roundnessType === ROUNDNESS.PROPORTIONAL_RADIUS &&
    isUsingProportionalRadius(element.type)
  ) {
    return true;
  }

  return false;
};

export const getDefaultRoundnessTypeForElement = (
  element: XcalidrawElement,
) => {
  if (isUsingProportionalRadius(element.type)) {
    return {
      type: ROUNDNESS.PROPORTIONAL_RADIUS,
    };
  }

  if (isUsingAdaptiveRadius(element.type)) {
    return {
      type: ROUNDNESS.ADAPTIVE_RADIUS,
    };
  }

  return null;
};

export const isFixedPointBinding = (
  binding: PointBinding | FixedPointBinding,
): binding is FixedPointBinding => {
  return (
    Object.hasOwn(binding, "fixedPoint") &&
    (binding as FixedPointBinding).fixedPoint != null
  );
};

// TODO: Move this to @xcalidraw/math
export const isBounds = (box: unknown): box is Bounds =>
  Array.isArray(box) &&
  box.length === 4 &&
  typeof box[0] === "number" &&
  typeof box[1] === "number" &&
  typeof box[2] === "number" &&
  typeof box[3] === "number";

export const getLinearElementSubType = (
  element: XcalidrawLinearElement,
): XcalidrawLinearElementSubType => {
  if (isSharpArrow(element)) {
    return "sharpArrow";
  }
  if (isCurvedArrow(element)) {
    return "curvedArrow";
  }
  if (isElbowArrow(element)) {
    return "elbowArrow";
  }
  return "line";
};

/**
 * Checks if current element points meet all the conditions for polygon=true
 * (this isn't a element type check, for that use isLineElement).
 *
 * If you want to check if points *can* be turned into a polygon, use
 *  canBecomePolygon(points).
 */
export const isValidPolygon = (
  points: XcalidrawLineElement["points"],
): boolean => {
  return points.length > 3 && pointsEqual(points[0], points[points.length - 1]);
};

export const canBecomePolygon = (
  points: XcalidrawLineElement["points"],
): boolean => {
  return (
    points.length > 3 ||
    // 3-point polygons can't have all points in a single line
    (points.length === 3 && !pointsEqual(points[0], points[points.length - 1]))
  );
};
