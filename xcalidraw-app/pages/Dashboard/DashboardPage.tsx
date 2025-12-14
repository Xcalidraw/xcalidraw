import { useAtom } from "jotai";
import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { DashboardSkeleton } from "./components/Skeleton/DashboardSkeleton";

import { Header } from "./components/Header/Header";
import { Templates } from "./components/Templates/Templates";
import { BoardsTable } from "./components/BoardsTable/BoardsTable";
import { boardsContextAtom, currentTeamAtom, teamsAtom } from "./store";

import "./DashboardPage.scss";

export const DashboardPage = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [teams] = useAtom(teamsAtom); // Just to check if teams are loaded/exist
  const [, setBoardsContext] = useAtom(boardsContextAtom);
  const location = useLocation();
  
  // Sync boards context with URL
  useEffect(() => {
    const pathname = location.pathname;
    const spaceMatch = matchPath('/dashboard/space/:spaceId', pathname);
    
    if (spaceMatch && spaceMatch.params.spaceId) {
      // 1. Space View
      setBoardsContext({ spaceId: spaceMatch.params.spaceId });
    } else if (currentTeam.id) {
      // 2. Team View (default) - Only if we have a current team
      setBoardsContext({ teamId: currentTeam.id });
    }
  }, [location.pathname, currentTeam.id]);
  
  // Basic loading check - if we have no currentTeam and no teams loaded yet?
  if (!currentTeam.id && teams.length === 0) {
    return <DashboardSkeleton />;
  }

  const [context] = useAtom(boardsContextAtom);
  
  // Ensure we are in the correct context (Team view, not Space view)
  // We check if context.teamId matches currentTeam AND spaceId is undefined
  const isContextSynced = context.teamId === currentTeam.id && !context.spaceId;

  if (!isContextSynced) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="dashboard-content-inner">
      <Templates />
      <BoardsTable />
    </div>
  );
};
