import { TemplatesSkeleton } from "../Templates/TemplatesSkeleton";
import { BoardsSkeleton } from "../BoardsTable/BoardsSkeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            <TemplatesSkeleton />
            <BoardsSkeleton />
        </div>
    );
};
