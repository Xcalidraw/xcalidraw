import { BoardsSkeleton } from "../Dashboard/components/BoardsTable/BoardsSkeleton";
import "../Dashboard/DashboardPage.scss";

export const SpaceSkeleton = () => {
    return (
        <div className="dashboard-content-inner">
            <BoardsSkeleton title="Loading space..." />
        </div>
    );
};
