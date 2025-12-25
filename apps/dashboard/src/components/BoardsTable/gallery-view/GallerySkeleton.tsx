import { Skeleton } from "../../ui/skeleton";

interface GallerySkeletonProps {
  count?: number;
}

export const GallerySkeleton = ({ count = 8 }: GallerySkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-grid-${i}`}
          className="bg-card border border-border rounded-xl overflow-hidden flex flex-col relative"
        >
          <div className="h-[180px] bg-muted border-b border-border flex items-center justify-center">
            <Skeleton className="h-20 w-20 rounded-xl" />
          </div>
          <div className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
};
