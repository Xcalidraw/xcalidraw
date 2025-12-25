import { Board } from "../../../../store";
import { getBoardIconComponent } from "../../shared/BoardIcon";

interface BoardNameCellProps {
  board: Board;
}

export const BoardNameCell = ({ board }: BoardNameCellProps) => {
  const IconComponent = getBoardIconComponent(board.icon);

  return (
    <td className="p-4 max-lg:p-2.5 min-w-[300px] max-lg:min-w-0">
      <div className="flex items-center gap-3 w-full">
        <div
          className={`board-icon w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 icon-${board.icon}`}
        >
          <IconComponent size={16} />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="font-medium text-sm text-foreground truncate">
            {board.name}
          </span>
          <span className="text-xs text-muted-foreground truncate max-lg:hidden">
            Modified by {board.modifiedBy}, {board.modifiedDate}
          </span>
          <span className="text-xs text-muted-foreground truncate hidden max-lg:block">
            {board.modifiedBy} &bull;{" "}
            {board.space ? <>{board.space} &bull; </> : null} {board.lastOpened}
          </span>
        </div>
      </div>
    </td>
  );
};
