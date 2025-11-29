import React from "react";

import { useTunnels } from "../context/tunnels";

import { userIcon } from "./icons";

import "./RightHeaderBar.scss";

type RightHeaderBarProps = {
  renderCustomContent?: () => React.ReactNode;
  showLibraryButton?: boolean;
};

export const RightHeaderBar = ({
  renderCustomContent,
  showLibraryButton = true,
}: RightHeaderBarProps) => {
  const { DefaultSidebarTriggerTunnel } = useTunnels();

  return (
    <div className="RightHeaderBar">
      {renderCustomContent?.()}

      <button
        className="RightHeaderBar__btn RightHeaderBar__btn--user"
        title="User"
        type="button"
      >
        {userIcon}
      </button>

      {showLibraryButton && <DefaultSidebarTriggerTunnel.Out />}
    </div>
  );
};
