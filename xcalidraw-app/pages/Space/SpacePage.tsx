import { useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { BoardsTable } from "../Dashboard/components/BoardsTable/BoardsTable";
import { boardsContextAtom, boardsLoadingAtom } from "../Dashboard/store";
import { useSpaceQuery } from "../../hooks/api.hooks";
import { SpaceSkeleton } from "./SpaceSkeleton";

import "../Dashboard/DashboardPage.scss";

export const SpacePage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  
  const { data: space, isLoading: isSpaceLoading } = useSpaceQuery(spaceId!);
  const [, setBoardsContext] = useAtom(boardsContextAtom);
  const [isBoardsLoading] = useAtom(boardsLoadingAtom);
  
  // Set context when spaceId and space name are available
  useEffect(() => {
    if (spaceId) {
      setBoardsContext({ 
        spaceId,
        spaceName: space?.name 
      });
    }
  }, [spaceId, space?.name, setBoardsContext]);
  
  if (isSpaceLoading) {
    return <SpaceSkeleton />;
  }
  
  return (
    <div className="dashboard-content-inner">
      <BoardsTable 
        title={space?.name ? `Boards in ${space.name}` : "Space Boards"} 
        hideTemplatesBtn={true} 
      />
    </div>
  );
};

export default SpacePage;
