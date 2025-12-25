import { StarButton } from "../../shared/StarButton";
import { BoardActionsDropdown } from "../../shared/BoardActionsDropdown";

interface ActionsCellProps {
  boardId: string;
  boardName: string;
  isStarred: boolean;
  onToggleStar: (boardId: string) => void;
  onDelete: (board: { id: string; name: string }) => void;
}

export const ActionsCell = ({
  boardId,
  boardName,
  isStarred,
  onToggleStar,
  onDelete,
}: ActionsCellProps) => {
  return (
    <td className="p-4 w-20 max-lg:w-[60px] text-right pr-2">
      <div
        className="flex gap-1 justify-end items-center opacity-0 transition-opacity group-hover:opacity-100 shrink-0 has-[[data-state=open]]:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <StarButton
          isStarred={isStarred}
          onClick={() => onToggleStar(boardId)}
          variant="table"
        />
        <BoardActionsDropdown
          boardId={boardId}
          boardName={boardName}
          onDelete={onDelete}
          variant="table"
        />
      </div>
    </td>
  );
};
