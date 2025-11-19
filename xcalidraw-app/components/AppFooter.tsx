import { Footer } from "@xcalidraw/xcalidraw/index";
import React from "react";

import { isXcalidrawPlusSignedUser } from "../app_constants";

import { DebugFooter, isVisualDebuggerEnabled } from "./DebugCanvas";
import { EncryptedIcon } from "./EncryptedIcon";

export const AppFooter = React.memo(
  ({ onChange }: { onChange: () => void }) => {
    return (
      <Footer>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
          }}
        >
          {isVisualDebuggerEnabled() && <DebugFooter onChange={onChange} />}
          {!isXcalidrawPlusSignedUser && <EncryptedIcon />}
        </div>
      </Footer>
    );
  },
);
