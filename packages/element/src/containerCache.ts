import type { XcalidrawTextContainer } from "./types";

export const originalContainerCache: {
  [id: XcalidrawTextContainer["id"]]:
    | {
        height: XcalidrawTextContainer["height"];
      }
    | undefined;
} = {};

export const updateOriginalContainerCache = (
  id: XcalidrawTextContainer["id"],
  height: XcalidrawTextContainer["height"],
) => {
  const data =
    originalContainerCache[id] || (originalContainerCache[id] = { height });
  data.height = height;
  return data;
};

export const resetOriginalContainerCache = (
  id: XcalidrawTextContainer["id"],
) => {
  if (originalContainerCache[id]) {
    delete originalContainerCache[id];
  }
};

export const getOriginalContainerHeightFromCache = (
  id: XcalidrawTextContainer["id"],
) => {
  return originalContainerCache[id]?.height ?? null;
};
