import { useAtom } from "jotai";
import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { DashboardSkeleton } from "./Skeleton/DashboardSkeleton";

import { Templates } from "./Templates/Templates";
import { BoardsTable } from "./BoardsTable/BoardsTable";
import { boardsContextAtom, currentTeamAtom, teamsAtom } from "../store";

export const DashboardPage = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [teams] = useAtom(teamsAtom);
  const [context, setBoardsContext] = useAtom(boardsContextAtom);
  const location = useLocation();
  
  // Sync boards context with URL
  useEffect(() => {
    const pathname = location.pathname;
    const spaceMatch = matchPath('/dashboard/space/:spaceId', pathname);
    
    if (spaceMatch && spaceMatch.params.spaceId) {
      setBoardsContext({ spaceId: spaceMatch.params.spaceId });
    } else if (currentTeam.id) {
      setBoardsContext({ teamId: currentTeam.id });
    }
  }, [location.pathname, currentTeam.id, setBoardsContext]);
  
  // Basic loading check - if we have no currentTeam and no teams loaded yet
  if (!currentTeam.id && teams.length === 0) {
    return <DashboardSkeleton />;
  }

  // Ensure we are in the correct context (Team view, not Space view)
  const isContextSynced = context.teamId === currentTeam.id && !context.spaceId;

  if (!isContextSynced) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="flex flex-col w-full">
      <Templates />
      <BoardsTable />
    </div>
  );
};
