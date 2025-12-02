// eslint-disable-next-line no-restricted-imports
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { Grid, List, MoreHorizontal, Star, FileIcon } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

import { filteredBoardsAtom, viewModeAtom } from "../../store";
import { Button } from "../../../../components/ui/button";
import { Select } from "../../../../components/ui/select";

import "./BoardsTable.scss";

export const BoardsTable = () => {
  const [boards] = useAtom(filteredBoardsAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const navigate = useNavigate();

  const [filterBy, setFilterBy] = useState("all");
  const [ownedBy, setOwnedBy] = useState("anyone");
  const [sortBy, setSortBy] = useState("last-opened");

  const handleNewBoard = () => {
    // Generate a unique ID for the new board
    const boardId = `board-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    navigate(`/board/${boardId}`);
  };

  const filterOptions = [
    { value: "all", label: "All boards" },
    { value: "recent", label: "Recent" },
    { value: "starred", label: "Starred" },
    { value: "archived", label: "Archived" },
  ];

  const ownedByOptions = [
    { value: "anyone", label: "Owned by anyone" },
    { value: "me", label: "Owned by me" },
    { value: "others", label: "Owned by others" },
  ];

  const sortOptions = [
    { value: "last-opened", label: "Last opened" },
    { value: "name", label: "Name" },
    { value: "modified", label: "Last modified" },
    { value: "created", label: "Date created" },
  ];

  return (
    <div className="boards-table-section">
      <div className="section-header">
        <div className="header-left">
          <h2>Boards in this team</h2>
        </div>
        <div className="header-actions">
          <Button variant="secondary" size="default">
            Explore templates
          </Button>
          <Button variant="outline" size="default" onClick={handleNewBoard}>
            + Create new
          </Button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-left">
          <div className="filter-group">
            <span className="filter-label">Filter by</span>
            <Select
              options={filterOptions}
              value={filterBy}
              onChange={setFilterBy}
            />
          </div>

          <div className="filter-group">
            <Select
              options={ownedByOptions}
              value={ownedBy}
              onChange={setOwnedBy}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Sort by</span>
            <Select options={sortOptions} value={sortBy} onChange={setSortBy} />
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
                <tr
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="board-row"
                >
                  <td className="col-name">
                    <div className="board-name-wrapper">
                      <div className={`board-icon icon-${board.icon}`}>
                        <FileIcon size={16} />
                      </div>
                      <div className="board-details">
                        <span className="name-text">{board.name}</span>
                        <span className="sub-text desktop-only">
                          Modified by {board.modifiedBy}, {board.modifiedDate}
                        </span>
                        <span className="sub-text mobile-only">
                          {board.modifiedBy} &bull; {board.space ? <>{board.space} &bull; </> : null} {board.lastOpened}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="col-users">
                    {/* Placeholder for online users */}
                  </td>
                  <td className="col-space">
                    {board.space ? (
                      <span className="space-tag">{board.space}</span>
                    ) : null}
                  </td>
                  <td className="col-date">{board.lastOpened}</td>
                  <td className="col-owner">{board.owner}</td>
                  <td className="col-actions">
                    <div
                      className="action-icons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Star
                        size={16}
                        className={clsx("star-icon", {
                          active: board.isStarred,
                        })}
                      />
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
            <div
              key={board.id}
              className="board-card"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div className="board-preview">
                {/* Visual placeholder matching the icon color/theme */}
                <div className={`preview-placeholder bg-${board.icon}`}>
                  <FileIcon size={32} />
                </div>
              </div>
              <div className="board-footer">
                <div className={`board-icon icon-${board.icon}`}>
                  <FileIcon size={16} />
                </div>
                <div className="board-info">
                  <span className="board-name">{board.name}</span>
                  <div className="board-meta">
                    <span className="board-date">
                      Opened {board.lastOpened}
                    </span>
                    {board.space && (
                      <span className="board-space-dot">• {board.space}</span>
                    )}
                  </div>
                </div>
                <div
                  className="card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Star
                    size={14}
                    className={clsx("star-icon", {
                      active: board.isStarred,
                    })}
                  />
                  <MoreHorizontal size={14} className="more-icon" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
