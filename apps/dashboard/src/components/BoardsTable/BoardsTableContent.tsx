import { useAtom } from "jotai";
import { Skeleton } from "../ui/skeleton";
import {
  filteredBoardsAtom,
  viewModeAtom,
  boardsLoadingAtom,
  boardsQueryAtom,
  boardsTotalAtom,
} from "../../store";
import { deleteDialogAtom } from "./boards-table.store";
import { useBoardActions } from "./create-new-action/hooks";
import { TableView } from "./table-view";
import { GalleryView } from "./gallery-view";
import { BoardsEmptyState } from "./BoardsEmptyState";

export const BoardsTableContent = () => {
  const [boards] = useAtom(filteredBoardsAtom);
  const [viewMode] = useAtom(viewModeAtom);
  const [isLoading] = useAtom(boardsLoadingAtom);
  const [total] = useAtom(boardsTotalAtom);
  const [{ fetchNextPage, hasNextPage }] = useAtom(boardsQueryAtom) as any;
  const [, setDeleteDialog] = useAtom(deleteDialogAtom);
  const { handleToggleStar, handleNavigateToBoard } = useBoardActions();

  const hasMore = hasNextPage;

  const handleDelete = (board: { id: string; name: string }) => {
    setDeleteDialog(board);
  };

  // Empty state
  if (!isLoading && boards.length === 0) {
    return <BoardsEmptyState />;
  }

  return (
    <>
      {/* Main content */}
      {viewMode === "list" ? (
        <TableView
          boards={boards}
          isLoading={isLoading}
          onNavigate={handleNavigateToBoard}
          onToggleStar={handleToggleStar}
          onDelete={handleDelete}
        />
      ) : (
        <GalleryView
          boards={boards}
          isLoading={isLoading}
          onNavigate={handleNavigateToBoard}
          onToggleStar={handleToggleStar}
          onDelete={handleDelete}
        />
      )}

      {/* Infinite Scroll Sentinel */}
      <div
        className="infinite-scroll-sentinel"
        ref={(node) => {
          if (!node || isLoading || !hasMore) return;

          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting && hasMore && !isLoading) {
                fetchNextPage();
              }
            },
            { threshold: 0.5, rootMargin: "100px" }
          );

          observer.observe(node);
          return () => observer.disconnect();
        }}
        style={{ height: "20px", width: "100%" }}
      />

      {/* Loading More Indicator */}
      {isLoading && boards.length > 0 && (
        <div className="flex justify-center p-4 w-full">
          {viewMode === "list" ? (
            <div className="w-full space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="flex gap-4">
              <Skeleton className="h-32 w-48 rounded-xl" />
              <Skeleton className="h-32 w-48 rounded-xl" />
            </div>
          )}
        </div>
      )}

      {/* Board count */}
      <div className="text-center text-xs text-muted-foreground py-2">
        {boards.length} of {total} boards
      </div>

      {/* Bottom spacer */}
      <div style={{ height: "50px", flexShrink: 0 }} />
    </>
  );
};
