import { VERSIONS } from "@xcalidraw/common";

import {
  diamondFixture,
  ellipseFixture,
  rectangleFixture,
} from "./elementFixture";

export const diagramFixture = {
  type: "xcalidraw",
  version: VERSIONS.xcalidraw,
  source: "https://xcalidraw.com",
  elements: [diamondFixture, ellipseFixture, rectangleFixture],
  appState: {
    viewBackgroundColor: "#ffffff",
    gridModeEnabled: false,
  },
  files: {},
};

export const diagramFactory = ({
  overrides = {},
  elementOverrides = {},
} = {}) => ({
  ...diagramFixture,
  elements: [
    { ...diamondFixture, ...elementOverrides },
    { ...ellipseFixture, ...elementOverrides },
    { ...rectangleFixture, ...elementOverrides },
  ],
  ...overrides,
});

export default diagramFixture;
