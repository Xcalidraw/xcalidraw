import "./Sidebar.scss";
import "../Skeleton/Skeleton.scss";

export const SidebarTeamTriggerSkeleton = () => {
  return (
    <div className="sidebar-header">
        <div className="workspace-btn" style={{ pointerEvents: 'none', cursor: 'default' }}>
            {/* Avatar skeleton */}
            <div className="workspace-avatar skeleton-pulse" style={{ background: "var(--color-gray-20)", boxShadow: 'none' }} />
            
            {/* Name skeleton */}
            <div className="workspace-details">
                <span className="name skeleton-pulse skeleton-block" style={{ width: '120px', height: '16px' }} />
            </div>
            
            {/* Chevron placeholder (optional, just keeping space or hiding it) */}
             <div className="skeleton-pulse" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
        </div>
    </div>
  );
};
