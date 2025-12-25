import { StarButton } from "../shared/StarButton";
import { BoardActionsDropdown } from "../shared/BoardActionsDropdown";

interface GalleryCardActionsProps {
  boardId: string;
  boardName: string;
  isStarred: boolean;
  onToggleStar: (boardId: string) => void;
  onDelete: (board: { id: string; name: string }) => void;
}

export const GalleryCardActions = ({
  boardId,
  boardName,
  isStarred,
  onToggleStar,
  onDelete,
}: GalleryCardActionsProps) => {
  return (
    <div
      className="absolute top-3 right-3 flex gap-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 has-[[data-state=open]]:opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <StarButton
        isStarred={isStarred}
        onClick={() => onToggleStar(boardId)}
        variant="gallery"
      />
      <BoardActionsDropdown
        boardId={boardId}
        boardName={boardName}
        onDelete={onDelete}
        variant="gallery"
      />
    </div>
  );
};
