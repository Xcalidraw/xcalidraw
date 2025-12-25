import { Board } from "../../../store";
import {
  BoardNameCell,
  OnlineUsersCell,
  SpaceCell,
  LastOpenedCell,
  OwnerCell,
  ActionsCell,
} from "./table-cells";

interface TableRowProps {
  board: Board;
  onNavigate: (boardId: string) => void;
  onToggleStar: (boardId: string) => void;
  onDelete: (board: { id: string; name: string }) => void;
}

export const TableRow = ({
  board,
  onNavigate,
  onToggleStar,
  onDelete,
}: TableRowProps) => {
  return (
    <tr
      onClick={() => onNavigate(board.id)}
      className="cursor-pointer transition-colors hover:bg-muted/50 border-b border-gray-100 last:border-0 group"
    >
      <BoardNameCell board={board} />
      <OnlineUsersCell />
      <SpaceCell space={board.space} />
      <LastOpenedCell lastOpened={board.lastOpened} />
      <OwnerCell owner={board.owner} />
      <ActionsCell
        boardId={board.id}
        boardName={board.name}
        isStarred={board.isStarred}
        onToggleStar={onToggleStar}
        onDelete={onDelete}
      />
    </tr>
  );
};
