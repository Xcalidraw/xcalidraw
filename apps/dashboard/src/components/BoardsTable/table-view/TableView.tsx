import { Board } from "../../../store";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { TableSkeleton } from "./TableSkeleton";

interface TableViewProps {
  boards: Board[];
  isLoading: boolean;
  onNavigate: (boardId: string) => void;
  onToggleStar: (boardId: string) => void;
  onDelete: (board: { id: string; name: string }) => void;
}

export const TableView = ({
  boards,
  isLoading,
  onNavigate,
  onToggleStar,
  onDelete,
}: TableViewProps) => {
  return (
    <div className="rounded-md overflow-x-auto overflow-y-visible bg-card relative shrink-0 -mx-8 px-4 md:-mx-6 md:px-3 text-sm scrollbar-hover">
      <table className="w-full min-w-[1100px] border-collapse max-lg:min-w-0">
        <TableHeader />
        <tbody>
          {isLoading && boards.length === 0 ? (
            <TableSkeleton />
          ) : (
            boards.map((board) => (
              <TableRow
                key={board.id}
                board={board}
                onNavigate={onNavigate}
                onToggleStar={onToggleStar}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
