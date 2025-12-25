import { useAtom } from "jotai";
import { boardsAtom } from "../../store";
import { BoardsTableHeader } from "./BoardsTableHeader";
import { BoardsTableControls } from "./BoardsTableControls";
import { BoardsTableContent } from "./BoardsTableContent";
import { CreateBoardModal } from "./create-new-action";
import { DeleteBoardDialog } from "./shared";

import "./boards-table.css";

interface BoardsTableProps {
  title?: string;
  hideTemplatesBtn?: boolean;
}

export const BoardsTable = ({
  title = "Boards in this team",
  hideTemplatesBtn = false,
}: BoardsTableProps) => {
  const [allBoards] = useAtom(boardsAtom);
  const isFiltersDisabled = allBoards.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-card min-w-0 min-h-0 p-6 md:p-8 max-sm:p-3">
      {/* Header with title and action buttons */}
      <BoardsTableHeader title={title} hideTemplatesBtn={hideTemplatesBtn} />

      {/* Filters and view mode toggle */}
      <BoardsTableControls isFiltersDisabled={isFiltersDisabled} />

      {/* Main content (table or gallery view) */}
      <BoardsTableContent />

      {/* Modals */}
      <CreateBoardModal />
      <DeleteBoardDialog />
    </div>
  );
};
