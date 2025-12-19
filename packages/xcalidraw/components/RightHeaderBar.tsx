import React, { useMemo } from "react";

import { useTunnels } from "../context/tunnels";
import { useUIAppState } from "../context/ui-appState";

import { usersIcon, userIcon } from "./icons";

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
  const appState = useUIAppState();

  const collaboratorsCount = useMemo(() => {
    const count = appState.collaborators.size;

    if (count > 99) {
      return "99+";
    }

    return count;
  }, [appState.collaborators]);

  return (
    <div className="RightHeaderBar">
      

      {!!collaboratorsCount && (
        <button
          className="RightHeaderBar__btn RightHeaderBar__btn--users"
          title="User"
          type="button"
        >
          {usersIcon}
          <div className="CollabButton-collaborators">
            {collaboratorsCount}
          </div>
        </button>
      )}

      <button
        className="RightHeaderBar__btn RightHeaderBar__btn--user"
        title="User"
        type="button"
      >
        {userIcon}
      </button>

      {showLibraryButton && <DefaultSidebarTriggerTunnel.Out />}

      {renderCustomContent?.()}
    </div>
  );
};
