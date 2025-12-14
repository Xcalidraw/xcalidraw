// eslint-disable-next-line no-restricted-imports
import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import {
  Grid,
  List,
  MoreHorizontal,
  Star,
  Layout,
  Share2,
  Link,
  Pencil,
  Copy,
  Image as ImageIcon,
  Info,
  ArrowRightLeft,
  Users,
  Trash2,
  LogOut,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Component,
  Box,
  Layers,
  Heart,
  Zap,
  Flame,
  Sparkles,
  Target,
  Award,
  Bookmark,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const BOARD_ICON_MAP: Record<string, React.ElementType> = {
  layout: Layout,
  orange: Layout,
  blue: Square,
  pink: Circle,
  purple: Triangle,
  green: Hexagon,
  red: Component,
  cyan: Box,
  yellow: Layers,
  indigo: Star,
  teal: Heart,
  lime: Zap,
  rose: Flame,
  violet: Sparkles,
  amber: Target,
  emerald: Award,
  sky: Bookmark,
};

import { filteredBoardsAtom, viewModeAtom, toggleStarAtom, boardsAtom } from "../../store";
import { Button } from "../../../../components/ui/button";
import { Select } from "../../../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

import "./BoardsTable.scss";
import { CreateBoardModal } from "../CreateBoardModal/CreateBoardModal";
import { useCreateBoardMutation, useSpaceQuery, useListTeamsQuery } from "../../../../hooks/api.hooks";
import { EmptyState } from "../EmptyState/EmptyState";

interface BoardsTableProps {
  title?: string;
  hideTemplatesBtn?: boolean;
}

export const BoardsTable = ({ 
  title = "Boards in this team", 
  hideTemplatesBtn = false 
}: BoardsTableProps) => {
  const [boards] = useAtom(filteredBoardsAtom);
  const [allBoards] = useAtom(boardsAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [, toggleStar] = useAtom(toggleStarAtom);
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();

  // Get space data if we're in a space context
  const { data: space } = useSpaceQuery(spaceId || "");
  
  // Get user's teams as fallback when not in a space context
  const { data: teamsData } = useListTeamsQuery();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createBoardMutation = useCreateBoardMutation();

  const [filterBy, setFilterBy] = useState("all");
  const [ownedBy, setOwnedBy] = useState("anyone");
  const [sortBy, setSortBy] = useState("last-opened");

  const handleCreateBoard = async (name: string, icon: string) => {
    try {
        // Priority 1: Use space's team_id if we're in a space context
        let teamId = space?.team_id;
        
        // Priority 2: If no space (Dashboard), use user's first team
        if (!teamId && teamsData?.items && teamsData.items.length > 0) {
            teamId = teamsData.items[0].team_id;
        }
        
        // If still no teamId, we can't create a board
        if (!teamId) {
            console.error("No team context found for board creation");
            return;
        }

        const newBoard = await createBoardMutation.mutateAsync({
            title: name,
            teamId: teamId,
            spaceId: spaceId,
            thumbnail: icon
        });
        
        setIsCreateModalOpen(false);
        navigate(`/board/${newBoard.board_id}`);
    } catch (error) {
        console.error("Failed to create board:", error);
    }
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
  
  const isFiltersDisabled = allBoards.length === 0;

  return (
    <div className="boards-table-section">
      <CreateBoardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateBoard}
        isLoading={createBoardMutation.isPending}
      />
      <div className="section-header">
        <div className="header-left">
          <h2>{title}</h2>
        </div>
        <div className="header-actions">
          {!hideTemplatesBtn && (
            <Button variant="secondary" size="default">
              Explore templates
            </Button>
          )}
          <Button variant="outline" size="default" onClick={() => setIsCreateModalOpen(true)}>
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
              disabled={isFiltersDisabled}
            />
          </div>

          <div className="filter-group">
            <Select
              options={ownedByOptions}
              value={ownedBy}
              onChange={setOwnedBy}
              disabled={isFiltersDisabled}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Sort by</span>
            <Select 
              options={sortOptions} 
              value={sortBy} 
              onChange={setSortBy} 
              disabled={isFiltersDisabled}
            />
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

      {boards.length === 0 ? (
         <EmptyState 
            title="No boards found"
            description={spaceId ? "This space doesn't have any boards yet. Create one to get started." : "You don't have any boards yet. Create one to get started."}
            actionLabel="Create board"
            onAction={() => setIsCreateModalOpen(true)}
          />
      ) : viewMode === "list" ? (
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
              {boards.map((board) => {
                const IconComponent = BOARD_ICON_MAP[board.icon] || Layout;

                return (
                <tr
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="board-row"
                >
                  <td className="col-name">
                    <div className="board-name-wrapper">
                      <div className={`board-icon icon-${board.icon}`}>
                        <IconComponent size={16} />
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
                        size={18}
                        className={clsx("star-icon", {
                          active: board.isStarred,
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(board.id);
                        }}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="more-icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal size={18} />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dropdown-menu-width">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Share2 size={14} />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Link size={14} />
                            Copy board link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Pencil size={14} />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Copy size={14} />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <ImageIcon size={14} />
                            Change thumbnail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Info size={14} />
                            Board Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <ArrowRightLeft size={14} />
                            Move to Space
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Users size={14} />
                            Move to Team
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="danger"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 size={14} />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="warning"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LogOut size={14} />
                            Leave
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="boards-grid-container">
          {/* Grid View Implementation */}
          {boards.map((board) => {
             const IconComponent = BOARD_ICON_MAP[board.icon] || Layout;
             
             return (
            <div
              key={board.id}
              className="board-card"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div className="board-preview">
                {/* Visual placeholder matching the icon color/theme */}
                <div className={`preview-placeholder bg-${board.icon}`}>
                  <IconComponent size={32} />
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(board.id);
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="more-icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={14} />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dropdown-menu-width">
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Share2 size={14} />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Link size={14} />
                        Copy board link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Pencil size={14} />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Copy size={14} />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <ImageIcon size={14} />
                        Change thumbnail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Info size={14} />
                        Board Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <ArrowRightLeft size={14} />
                        Move to Space
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Users size={14} />
                        Move to Team
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="danger"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 size={14} />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="warning"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LogOut size={14} />
                        Leave
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="board-footer">
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
              </div>
            </div>
          )})}
        </div>
      )}
      <div style={{ height: "50px", flexShrink: 0 }} />
    </div>
  );
};
