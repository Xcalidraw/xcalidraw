export const SidebarTeamTriggerSkeleton = () => {
  return (
    <div className="sidebar-header">
        <div className="workspace-btn" style={{ pointerEvents: 'none', cursor: 'default' }}>
            <div className="workspace-avatar skeleton-pulse" style={{ background: "var(--color-gray-20)", boxShadow: 'none' }} />
            
            <div className="workspace-details">
                <span className="name skeleton-pulse skeleton-block" style={{ width: '120px', height: '16px' }} />
            </div>
            
            <div className="skeleton-pulse" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
        </div>
    </div>
  );
};
