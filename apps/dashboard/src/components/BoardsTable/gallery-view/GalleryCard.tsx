import { Board } from "../../../store";
import { getBoardIconComponent } from "../shared/BoardIcon";
import { GalleryCardActions } from "./GalleryCardActions";

interface GalleryCardProps {
  board: Board;
  onNavigate: (boardId: string) => void;
  onToggleStar: (boardId: string) => void;
  onDelete: (board: { id: string; name: string }) => void;
}

export const GalleryCard = ({
  board,
  onNavigate,
  onToggleStar,
  onDelete,
}: GalleryCardProps) => {
  const IconComponent = getBoardIconComponent(board.icon);

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col relative group hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
      onClick={() => onNavigate(board.id)}
    >
      <div className="h-[180px] bg-muted border-b border-border flex items-center justify-center relative overflow-hidden">
        {/* Visual placeholder matching the icon color/theme */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div
          className={`preview-placeholder w-20 h-20 rounded-2xl flex items-center justify-center text-white z-10 shadow-md transition-transform duration-300 bg-${board.icon} group-hover:scale-105`}
        >
          <IconComponent size={32} />
        </div>

        <GalleryCardActions
          boardId={board.id}
          boardName={board.name}
          isStarred={board.isStarred}
          onToggleStar={onToggleStar}
          onDelete={onDelete}
        />
      </div>
      <div className="p-4 pt-3 flex flex-col gap-1 flex-1 bg-card">
        <span className="font-medium text-sm text-foreground truncate">
          {board.name}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap overflow-hidden">
          <span className="truncate">Opened {board.lastOpened}</span>
          {board.space && (
            <span className="truncate flex-shrink-0">• {board.space}</span>
          )}
        </div>
      </div>
    </div>
  );
};
