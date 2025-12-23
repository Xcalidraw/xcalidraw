export const SidebarSpacesSkeleton = () => {
  return (
    <>
      {/* Simulate a few items */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-item-wrapper" style={{ cursor: 'default' }}>
          <div className="space-item">
            {/* Indicator skeleton */}
            <div className="space-indicator dot skeleton-pulse" style={{ background: "var(--color-gray-30)" }} />
            {/* Name skeleton */}
            <span className="space-name skeleton-pulse skeleton-block" style={{ width: '60%', height: '14px' }} />
          </div>
        </div>
      ))}
    </>
  );
};
