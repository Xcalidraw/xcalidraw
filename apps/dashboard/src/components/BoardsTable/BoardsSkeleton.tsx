export const BoardsSkeleton = ({ title = "Boards" }: { title?: string }) => {
    return (
        <div className="boards-table-section">
            <div className="section-header">
                <div className="header-left">
                    <div className="skeleton-pulse" style={{ width: '150px', height: '24px' }} />
                </div>
                <div className="header-actions">
                     <div className="skeleton-pulse" style={{ width: '120px', height: '36px', borderRadius: '6px' }} />
                     <div className="skeleton-pulse" style={{ width: '100px', height: '36px', borderRadius: '6px' }} />
                </div>
            </div>

            <div className="filters-bar">
                <div className="filters-left">
                    {/* Filter Group 1 */}
                    <div className="filter-group">
                        <span className="filter-label" style={{ opacity: 0.5 }}>Filter by</span>
                        <div className="skeleton-pulse" style={{ width: '100px', height: '32px', borderRadius: '6px', background: 'var(--color-gray-10)' }} />
                    </div>

                    {/* Filter Group 2 */}
                    <div className="filter-group">
                        <div className="skeleton-pulse" style={{ width: '120px', height: '32px', borderRadius: '6px', background: 'var(--color-gray-10)' }} />
                    </div>

                    {/* Filter Group 3 */}
                    <div className="filter-group">
                        <span className="filter-label" style={{ opacity: 0.5 }}>Sort by</span>
                        <div className="skeleton-pulse" style={{ width: '100px', height: '32px', borderRadius: '6px', background: 'var(--color-gray-10)' }} />
                    </div>
                </div>

                 <div className="view-toggles">
                    <div className="view-btn active" style={{ cursor: 'default' }}>
                         <div className="skeleton-pulse" style={{ width: '16px', height: '16px', borderRadius: '2px' }} />
                    </div>
                    <div className="view-btn" style={{ cursor: 'default' }}>
                         <div className="skeleton-pulse" style={{ width: '16px', height: '16px', borderRadius: '2px' }} />
                    </div>
                 </div>
            </div>

            <div className="boards-table-container">
                <table className="boards-table">
                    <thead>
                        <tr>
                            <th className="col-name">
                                <div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '2px' }} />
                            </th>
                            <th className="col-users">
                                 <div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '2px' }} />
                            </th>
                            <th className="col-space">
                                 <div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '2px' }} />
                            </th>
                            <th className="col-date">
                                 <div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '2px' }} />
                            </th>
                            <th className="col-owner">
                                 <div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '2px' }} />
                            </th>
                            <th className="col-actions"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="board-row" style={{ cursor: 'default' }}>
                                <td className="col-name">
                                    <div className="board-name-wrapper">
                                        <div className="board-icon skeleton-pulse" style={{ background: 'var(--color-gray-10)' }} />
                                        <div className="board-details">
                                            <span className="name-text skeleton-pulse skeleton-block" style={{ width: '140px', height: '14px', marginBottom: '4px' }} />
                                            <span className="sub-text desktop-only skeleton-pulse skeleton-block" style={{ width: '100px', height: '12px', background: 'var(--color-gray-10)' }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="col-users">
                                    <div className="skeleton-pulse" style={{ width: '60px', height: '14px' }} />
                                </td>
                                <td className="col-space">
                                    <span className="space-tag skeleton-pulse skeleton-inline" style={{ width: '80px', height: '22px', borderRadius: '12px', border: 'none', background: 'var(--color-gray-10)' }} />
                                </td>
                                <td className="col-date">
                                     <div className="skeleton-pulse" style={{ width: '90px', height: '14px' }} />
                                </td>
                                <td className="col-owner">
                                     <div className="skeleton-pulse" style={{ width: '80px', height: '14px' }} />
                                </td>
                                <td className="col-actions">
                                    {/* Action icons hidden/pulse */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
