import { getNonDeletedElements } from "@xcalidraw/element";
import { LinearElementEditor } from "@xcalidraw/element";
import { isLinearElement, isTextElement } from "@xcalidraw/element";

import { arrayToMap, KEYS } from "@xcalidraw/common";

import { selectGroupsForSelectedElements } from "@xcalidraw/element";

import { CaptureUpdateAction } from "@xcalidraw/element";

import { selectAllIcon } from "../components/icons";

import { register } from "./register";

import type { XcalidrawElement } from "@xcalidraw/element/types";

export const actionSelectAll = register({
  name: "selectAll",
  label: "labels.selectAll",
  icon: selectAllIcon,
  trackEvent: { category: "canvas" },
  viewMode: false,
  perform: (elements, appState, value, app) => {
    if (appState.selectedLinearElement?.isEditing) {
      return false;
    }

    const selectedElementIds = elements
      .filter(
        (element) =>
          !element.isDeleted &&
          !(isTextElement(element) && element.containerId) &&
          !element.locked,
      )
      .reduce((map: Record<XcalidrawElement["id"], true>, element) => {
        map[element.id] = true;
        return map;
      }, {});

    return {
      appState: {
        ...appState,
        ...selectGroupsForSelectedElements(
          {
            editingGroupId: null,
            selectedElementIds,
          },
          getNonDeletedElements(elements),
          appState,
          app,
        ),
        selectedLinearElement:
          // single linear element selected
          Object.keys(selectedElementIds).length === 1 &&
          isLinearElement(elements[0])
            ? new LinearElementEditor(elements[0], arrayToMap(elements))
            : null,
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) => event[KEYS.CTRL_OR_CMD] && event.key === KEYS.A,
});
