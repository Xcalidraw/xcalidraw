import { Board } from "../../../store";
import { GalleryCard } from "./GalleryCard";
import { GallerySkeleton } from "./GallerySkeleton";

interface GalleryViewProps {
  boards: Board[];
  isLoading: boolean;
  onNavigate: (boardId: string) => void;
  onToggleStar: (boardId: string) => void;
  onDelete: (board: { id: string; name: string }) => void;
}

export const GalleryView = ({
  boards,
  isLoading,
  onNavigate,
  onToggleStar,
  onDelete,
}: GalleryViewProps) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 pt-4 max-md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] max-md:gap-4 max-sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-sm:gap-3">
      {isLoading && boards.length === 0 ? (
        <GallerySkeleton />
      ) : (
        boards.map((board) => (
          <GalleryCard
            key={board.id}
            board={board}
            onNavigate={onNavigate}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};
