import { useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { BoardsTable } from "../Dashboard/components/BoardsTable/BoardsTable";
import { boardsAtom } from "../Dashboard/store";
import { useListBoardsQuery, useSpaceQuery } from "../../hooks/api.hooks";
import { SpaceSkeleton } from "./SpaceSkeleton";

import "../Dashboard/DashboardPage.scss";

export const SpacePage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [, setBoards] = useAtom(boardsAtom);

  const { data: space, isLoading: isSpaceLoading } = useSpaceQuery(spaceId!);
  const { data: boardsData, isLoading: isBoardsLoading } = useListBoardsQuery(spaceId);

  useEffect(() => {
    if (boardsData?.items) {
      // Map API boards to Store boards
      const mappedBoards = boardsData.items.map((board: any) => ({
        id: board.board_id,
        name: board.title,
        modifiedBy: board.created_by, // TODO: Resolve user name
        modifiedDate: new Date(board.updated_at).toLocaleDateString(),
        team: "Main Team", // TODO: Resolve team name
        space: space?.name,
        parentType: 'SPACE' as const,
        lastOpened: new Date(board.updated_at).toLocaleDateString(),
        owner: board.created_by,
        icon: "blue" as "orange" | "blue" | "pink" | "purple" | "green", // Default icon
        isStarred: false
      }));
      setBoards(mappedBoards);
    }
  }, [boardsData, setBoards, space]);

  if (isSpaceLoading) {
    return <SpaceSkeleton />;
  }

  return (
    <>
      <div className="dashboard-content-inner">
        <BoardsTable 
          title={space?.name ? `Boards in ${space.name}` : "Space Boards"} 
          hideTemplatesBtn={true} 
        />
      </div>
    </>
  );
};

export default SpacePage;

