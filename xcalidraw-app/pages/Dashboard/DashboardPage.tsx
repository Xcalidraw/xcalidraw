import { useAtom } from "jotai";
import { useEffect } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { DashboardSkeleton } from "./components/Skeleton/DashboardSkeleton";

import { Header } from "./components/Header/Header";
import { Templates } from "./components/Templates/Templates";
import { BoardsTable } from "./components/BoardsTable/BoardsTable";
import { boardsAtom } from "./store";
import { useListBoardsQuery } from "../../hooks/api.hooks";

import "./DashboardPage.scss";

export const DashboardPage = () => {
  const [, setBoards] = useAtom(boardsAtom);
  const { data: boardsData, isLoading } = useListBoardsQuery();

  useEffect(() => {
    if (boardsData?.items) {
      // Map API boards to Store boards
      const mappedBoards = boardsData.items.map((board: any) => ({
        id: board.board_id,
        name: board.title,
        modifiedBy: board.created_by, // TODO: Resolve user name
        modifiedDate: new Date(board.updated_at).toLocaleDateString(),
        team: "Main Team", // TODO: Resolve team name
        space: undefined,
        parentType: 'TEAM' as const, // Dashboard shows root/team boards? Or all boards?
        lastOpened: new Date(board.updated_at).toLocaleDateString(),
        owner: board.created_by,
        icon: "blue" as "orange" | "blue" | "pink" | "purple" | "green", // Default icon
        isStarred: false
      }));
      setBoards(mappedBoards);
    }
    
    return () => {
       setBoards([]);
    };
  }, [boardsData, setBoards]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="dashboard-content-inner">
        <Templates />
        <BoardsTable />
      </div>
    </>
  );
};


