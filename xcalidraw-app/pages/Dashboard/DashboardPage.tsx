import { useAtom } from "jotai";
import { useEffect } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { DashboardSkeleton } from "./components/Skeleton/DashboardSkeleton";

import { Header } from "./components/Header/Header";
import { Templates } from "./components/Templates/Templates";
import { BoardsTable } from "./components/BoardsTable/BoardsTable";
import { boardsContextAtom, boardsLoadingAtom } from "./store";
import { useListTeamsQuery } from "../../hooks/api.hooks";

import "./DashboardPage.scss";

export const DashboardPage = () => {
  const { data: teamsData, isLoading: isTeamsLoading } = useListTeamsQuery();
  const teamId = teamsData?.items?.[0]?.team_id;
  
  const [, setBoardsContext] = useAtom(boardsContextAtom);
  const [isBoardsLoading] = useAtom(boardsLoadingAtom);
  
  // Set context when teamId is available
  useEffect(() => {
    if (teamId) {
      setBoardsContext({ teamId });
    }
  }, [teamId, setBoardsContext]);
  
  // Show loading only if teams are loading (initial state)
  if (isTeamsLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="dashboard-content-inner">
      <Templates />
      <BoardsTable />
    </div>
  );
};
