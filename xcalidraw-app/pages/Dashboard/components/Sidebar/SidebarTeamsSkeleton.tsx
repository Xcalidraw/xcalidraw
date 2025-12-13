import "./Sidebar.scss";
import "../Skeleton/Skeleton.scss";

export const SidebarTeamsSkeleton = () => {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none" style={{ gap: '8px' }}>
            {/* Avatar skeleton */}
            <div className="workspace-avatar-small skeleton-pulse" style={{ background: "var(--color-gray-20)", boxShadow: 'none' }} />
            {/* Name skeleton */}
            <span className="skeleton-pulse skeleton-block" style={{ width: '100px', height: '14px' }} />
        </div>
      ))}
    </>
  );
};
