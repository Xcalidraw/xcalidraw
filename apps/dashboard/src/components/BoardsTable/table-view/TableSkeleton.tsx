import { Skeleton } from "../../ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton = ({ rows = 5 }: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="border-b border-border">
          <td className="p-4 max-lg:p-2.5">
            <Skeleton className="h-6 w-48" />
          </td>
          <td className="p-4 max-lg:hidden">
            <Skeleton className="h-6 w-8" />
          </td>
          <td className="p-4 max-lg:hidden">
            <Skeleton className="h-6 w-24" />
          </td>
          <td className="p-4 max-lg:hidden">
            <Skeleton className="h-6 w-32" />
          </td>
          <td className="p-4 max-lg:hidden">
            <Skeleton className="h-6 w-24" />
          </td>
          <td className="p-4"></td>
        </tr>
      ))}
    </>
  );
};
