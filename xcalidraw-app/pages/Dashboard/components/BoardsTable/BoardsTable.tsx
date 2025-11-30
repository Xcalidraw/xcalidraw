import React from "react";
import { useAtom } from "jotai";
import {
  Grid,
  List,
  MoreHorizontal,
  Star,
  ChevronDown,
  FileIcon
} from "lucide-react";
import clsx from "clsx";
import {
  currentTeamAtom,
  filteredBoardsAtom,
  viewModeAtom,
  sortByAtom,
  filterBoardsAtom,
  filterOwnerAtom
} from "../../store";
import "./BoardsTable.scss";

export const BoardsTable = () => {
  const [boards] = useAtom(filteredBoardsAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [sortBy] = useAtom(sortByAtom);

  return (
    <div className="boards-table-section">
      <div className="section-header">
        <div className="header-left">
          <h2>Boards in this team</h2>
        </div>
        <div className="header-actions">
          <button className="action-btn primary-action">Explore templates</button>
          <button className="action-btn primary-create">+ Create new</button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-group">
            <span className="filter-label">Filter by</span>
            <div className="filter-select">
              <span>All boards</span>
              <ChevronDown size={14} />
            </div>
          </div>
          
          <div className="filter-group">
            <div className="filter-select">
              <span>Owned by anyone</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Sort by</span>
            <div className="filter-select">
              <span>Last opened</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        <div className="view-toggles">
          <button 
            className={clsx("view-btn", { active: viewMode === "grid" })}
            onClick={() => setViewMode("grid")}
          >
            <Grid size={18} />
          </button>
          <button 
            className={clsx("view-btn", { active: viewMode === "list" })}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="boards-table-container">
          <table className="boards-table">
            <thead>
              <tr>
                <th className="col-name">Name</th>
                <th className="col-users">Online users</th>
                <th className="col-space">Space</th>
                <th className="col-date">Last opened</th>
                <th className="col-owner">Owner</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board) => (
                <tr key={board.id}>
                  <td className="col-name">
                    <div className="board-name-wrapper">
                      <div className={`board-icon icon-${board.icon}`}>
                        <FileIcon size={16} />
                      </div>
                      <div className="board-details">
                        <span className="name-text">{board.name}</span>
                        <span className="sub-text">Modified by {board.modifiedBy}, {board.modifiedDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="col-users">
                    {/* Placeholder for online users */}
                  </td>
                  <td className="col-space">
                    {board.space ? <span className="space-tag">{board.space}</span> : null}
                  </td>
                  <td className="col-date">{board.lastOpened}</td>
                  <td className="col-owner">{board.owner}</td>
                  <td className="col-actions">
                    <div className="action-icons">
                      <Star size={16} className={clsx("star-icon", { active: board.isStarred })} />
                      <MoreHorizontal size={16} className="more-icon" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="boards-grid-container">
          {/* Grid View Implementation */}
          {boards.map((board) => (
            <div key={board.id} className="board-card">
               <div className="board-preview"></div>
               <div className="board-footer">
                 <div className="board-icon"><FileIcon size={16} /></div>
                 <div className="board-info">
                   <span className="board-name">{board.name}</span>
                   <span className="board-date">Opened {board.lastOpened}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

