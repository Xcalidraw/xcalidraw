import { TemplatesSkeleton } from "../Templates/TemplatesSkeleton";
import { BoardsSkeleton } from "../BoardsTable/BoardsSkeleton";
import "../../DashboardPage.scss";

export const DashboardSkeleton = () => {
    return (
        <div className="dashboard-content-inner">
            <TemplatesSkeleton />
            <BoardsSkeleton />
        </div>
    );
};
