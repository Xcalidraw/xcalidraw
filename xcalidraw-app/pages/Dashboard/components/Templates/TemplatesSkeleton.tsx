import clsx from "clsx";
import "../Templates/Templates.scss";
import "../Skeleton/Skeleton.scss";

export const TemplatesSkeleton = () => {
    return (
        <section className="dashboard-templates">
            <div className="section-header">
                <div className="header-title">
                    <div className="header-icon skeleton-pulse" style={{ width: '16px', height: '16px' }} />
                    <div className="skeleton-pulse" style={{ width: '120px', height: '20px' }} />
                </div>
                <div className="view-all-btn">
                     <div className="skeleton-pulse" style={{ width: '100px', height: '16px' }} />
                </div>
            </div>

            <div className="templates-track">
                {/* 1. New Board Card Placeholder */}
                <div className="template-card create-new" style={{ cursor: 'default' }}>
                    <div className="card-preview">
                        <div className="plus-icon-wrapper skeleton-pulse" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                         <span className="cta-text skeleton-pulse skeleton-block" style={{ width: '60px', height: '12px' }} />
                    </div>
                     <div className="card-footer">
                        <span className="template-name skeleton-pulse skeleton-block" style={{ width: '80px', height: '14px' }} />
                    </div>
                </div>

                <div className="divider-vertical" />

                {/* 2. Placeholder Templates */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="template-card" style={{ cursor: 'default' }}>
                        <div className={clsx("card-preview skeleton-pulse")} style={{ background: "var(--color-gray-10, #f8f9fa)", position: 'relative' }}>
                           {/* Decorative skeleton UI elements inside the preview */}
                           <div className="fake-ui-nav" style={{ opacity: 0.5 }} />
                           <div className="fake-ui-sidebar" style={{ opacity: 0.5 }} />
                        </div>
                        <div className="card-footer">
                             <span className="template-name skeleton-pulse skeleton-block" style={{ width: '100px', height: '14px' }} />
                             <span className="template-tag skeleton-pulse skeleton-block" style={{ width: '30px', height: '14px', background: 'var(--color-gray-20)' }} />
                        </div>
                    </div>
                ))}

                 {/* 3. Ghost Card Placeholder */}
                 <div className="template-card ghost-card" style={{ cursor: 'default' }}>
                    <div className="card-preview">
                         <div className="skeleton-pulse" style={{ width: '24px', height: '24px' }} />
                         <span className="skeleton-pulse skeleton-block" style={{ width: '30px', height: '10px' }} />
                    </div>
                 </div>
            </div>
        </section>
    );
};
