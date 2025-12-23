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
  PenTool, User, Lightbulb, Sprout, File, MapPin, Search, Calendar,
  Coffee, Mail, BarChart, Shield, Clock, Folder, Rocket,
  Files, CheckCircle, Book, CreditCard, Compass, FlaskConical,
  PartyPopper, MessageCircle, GraduationCap, Globe, Calculator,
  MousePointer2, ClipboardList
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const BOARD_ICON_MAP: Record<string, React.ElementType> = {
  // Geometric
  layout: Layout, orange: Layout,
  blue: Square, pink: Circle, purple: Triangle, green: Hexagon,
  red: Component, cyan: Box, yellow: Layers,
  
  // Status/Action
  indigo: Star, 
  teal: Heart, 
  lime: Zap, 
  rose: Flame, 
  violet: Sparkles, 
  amber: Target, 
  emerald: Award, 
  sky: Bookmark,
  
  // New Icons
  pen: PenTool,
  user: User,
  bulb: Lightbulb,
  plant: Sprout,
  file: File,
  pin: MapPin,
  search: Search,
  calendar: Calendar,
  coffee: Coffee,
  mail: Mail,
  chart: BarChart,
  share: Share2,
  shield: Shield,
  clock: Clock,
  folder: Folder,
  rocket: Rocket,
  files: Files,
  check: CheckCircle,
  book: Book,
  card: CreditCard,
  compass: Compass,
  flask: FlaskConical,
  party: PartyPopper,
  message: MessageCircle,
  grad: GraduationCap,
  globe: Globe,
  calc: Calculator,
  cursor: MousePointer2,
  clip: ClipboardList
};

import { filteredBoardsAtom, viewModeAtom, toggleStarAtom, boardsAtom, sortByAtom, boardsPaginationAtom, boardsTotalAtom, Board, boardsLoadingAtom, boardsQueryAtom, deleteBoardMutationAtom } from "../../store";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import "./boards-table.css";
import { CreateBoardModal } from "../CreateBoardModal/CreateBoardModal";
import { useCreateBoardMutation, useSpaceQuery, useListTeamsQuery } from "../../hooks/api.hooks";
import { EmptyState } from "../EmptyState/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";

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
  const [pagination, setPagination] = useAtom(boardsPaginationAtom);
  const [total] = useAtom(boardsTotalAtom);
  const [isLoading] = useAtom(boardsLoadingAtom);
  const [{ fetchNextPage, hasNextPage }] = useAtom(boardsQueryAtom) as any;
  const hasMore = hasNextPage;
  const [sortBy, setSortBy] = useAtom(sortByAtom); // Connected to store
  const [, toggleStar] = useAtom(toggleStarAtom);
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();

  // Get space data if we're in a space context
  const { data: space } = useSpaceQuery(spaceId || "");
  
  // Get user's teams as fallback when not in a space context
  const { data: teamsData } = useListTeamsQuery();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createBoardMutation = useCreateBoardMutation();
  const [{ mutateAsync: deleteBoard, isPending: isDeleting }] = useAtom(deleteBoardMutationAtom);
  const [{ refetch: refetchBoards }] = useAtom(boardsQueryAtom) as any;
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; name: string } | null>(null);

  const [filterBy, setFilterBy] = useState("all");
  const [ownedBy, setOwnedBy] = useState("anyone");
  // sortBy removed from local state

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
    <div className="flex-1 flex flex-col bg-card min-w-0 min-h-0 p-6 md:p-8 max-sm:p-3">
      <CreateBoardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateBoard}
        isLoading={createBoardMutation.isPending}
      />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-md:mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground m-0 max-md:text-lg max-sm:text-base">{title}</h2>
        </div>
        <div className="flex gap-3 flex-wrap max-sm:w-full max-sm:gap-2">
          {!hideTemplatesBtn && (
            <Button variant="secondary" size="default" className="max-sm:hidden">
              Explore templates
            </Button>
          )}
          <Button variant="outline" size="default" onClick={() => setIsCreateModalOpen(true)} className="max-sm:flex-1">
            + Create new
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-4 max-md:gap-3 max-sm:mb-3">
        <div className="flex items-center gap-6 flex-wrap flex-1 max-md:gap-4 max-sm:gap-2 max-sm:min-w-0">
          <div className="flex items-center gap-2 text-[13px] max-sm:flex-1">
            <span className="text-muted-foreground whitespace-nowrap max-sm:hidden">Filter by</span>
            <Select
              value={filterBy}
              onValueChange={setFilterBy}
              disabled={isFiltersDisabled}
            >
              <SelectTrigger className="w-[140px] max-sm:w-full h-8 text-[13px]">
                <SelectValue placeholder="All boards" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-[13px] max-sm:flex-1">
            <Select
              value={ownedBy}
              onValueChange={setOwnedBy}
              disabled={isFiltersDisabled}
            >
              <SelectTrigger className="w-[160px] max-sm:w-full h-8 text-[13px]">
                <SelectValue placeholder="Owned by anyone" />
              </SelectTrigger>
              <SelectContent>
                {ownedByOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-[13px] max-sm:flex-1">
            <span className="text-muted-foreground whitespace-nowrap max-sm:hidden">Sort by</span>
            <Select 
              value={sortBy} 
              onValueChange={(val) => setSortBy(val as any)} 
              disabled={isFiltersDisabled}
            >
              <SelectTrigger className="w-[140px] max-sm:w-full h-8 text-[13px]">
                <SelectValue placeholder="Last opened" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex bg-muted p-0.5 rounded-md shrink-0">
          <button
            className={clsx("flex items-center justify-center min-w-[36px] h-8 rounded px-2 bg-transparent text-muted-foreground transition-all hover:bg-background/50", { "bg-background text-foreground shadow-sm": viewMode === "grid" })}
            onClick={() => setViewMode("grid")}
          >
            <Grid size={18} />
          </button>
          <button
            className={clsx("flex items-center justify-center min-w-[36px] h-8 rounded px-2 bg-transparent text-muted-foreground transition-all hover:bg-background/50", { "bg-background text-foreground shadow-sm": viewMode === "list" })}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {!isLoading && boards.length === 0 ? (
         <EmptyState 
            title="No boards found"
            description={spaceId ? "This space doesn't have any boards yet. Create one to get started." : "You don't have any boards yet. Create one to get started."}
            actionLabel="Create board"
            onAction={() => setIsCreateModalOpen(true)}
          />
      ) : viewMode === "list" ? (
        <div className="rounded-md overflow-x-auto overflow-y-visible bg-card relative shrink-0 -mx-8 px-4 md:-mx-6 md:px-3 text-sm scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <table className="w-full min-w-[1100px] border-collapse max-lg:min-w-0">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:px-2.5">Name</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[200px] max-w-[300px]">Online users</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[150px] max-w-[300px]">Space</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[140px] max-w-[300px]">Last opened</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 bg-transparent max-lg:hidden w-[140px] max-w-[300px]">Owner</th>
                <th className="w-20 max-lg:w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && boards.length === 0 ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-border">
                    <td className="p-4 max-lg:p-2.5"><Skeleton className="h-6 w-48" /></td>
                    <td className="p-4 max-lg:hidden"><Skeleton className="h-6 w-8" /></td>
                    <td className="p-4 max-lg:hidden"><Skeleton className="h-6 w-24" /></td>
                    <td className="p-4 max-lg:hidden"><Skeleton className="h-6 w-32" /></td>
                    <td className="p-4 max-lg:hidden"><Skeleton className="h-6 w-24" /></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : (
                boards.map((board: Board) => {
                  const IconComponent = BOARD_ICON_MAP[board.icon] || Layout;

                  return (
                    <tr
                      key={board.id}
                      onClick={() => navigate(`/board/${board.id}`)}
                      className="cursor-pointer transition-colors hover:bg-muted/50 border-b border-border last:border-0 group"
                    >
                      <td className="p-4 max-lg:p-2.5 min-w-[300px] max-lg:min-w-0">
                        <div className="flex items-center gap-3 w-full">
                          <div className={`board-icon w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 icon-${board.icon}`}>
                            <IconComponent size={16} />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="font-medium text-sm text-foreground truncate">{board.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-lg:hidden">
                              Modified by {board.modifiedBy}, {board.modifiedDate}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden max-lg:block">
                              {board.modifiedBy} &bull; {board.space ? <>{board.space} &bull; </> : null} {board.lastOpened}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-lg:hidden text-muted-foreground text-[13px] truncate max-w-[300px]">
                        {/* Placeholder for online users */}
                      </td>
                      <td className="p-4 max-lg:hidden truncate max-w-[300px]">
                        {board.space ? (
                          <span className="inline-block px-2.5 py-1 bg-muted rounded-xl text-xs text-muted-foreground font-medium">{board.space}</span>
                        ) : null}
                      </td>
                      <td className="p-4 max-lg:hidden text-muted-foreground text-[13px] truncate max-w-[300px]">{board.lastOpened}</td>
                      <td className="p-4 max-lg:hidden text-muted-foreground text-[13px] truncate max-w-[300px]">{board.owner}</td>
                      <td className="p-4 w-20 max-lg:w-[60px] text-right pr-2">
                        <div
                          className="flex gap-1 justify-end items-center opacity-0 transition-opacity group-hover:opacity-100 shrink-0 has-[[data-state=open]]:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Star
                            size={18}
                            className={clsx("cursor-pointer text-muted-foreground transition-colors p-1 box-content rounded hover:text-foreground hover:bg-muted", {
                              "text-yellow-400 fill-yellow-400 opacity-100": board.isStarred,
                            })}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(board.id);
                            }}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="cursor-pointer text-muted-foreground transition-colors p-1 box-content rounded hover:text-foreground hover:bg-muted data-[state=open]:text-foreground data-[state=open]:bg-muted" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal size={18} />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[200px]">
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBoardToDelete({ id: board.id, name: board.name });
                                }}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 pt-4 max-md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] max-md:gap-4 max-sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-sm:gap-3">
          {isLoading && boards.length === 0 ? (
             Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-grid-${i}`} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col relative">
                   <div className="h-[180px] bg-muted border-b border-border flex items-center justify-center">
                      <Skeleton className="h-20 w-20 rounded-xl" />
                   </div>
                   <div className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                   </div>
                </div>
             ))
          ) : (
          /* Grid View Implementation */
           boards.map((board: Board) => {
              const IconComponent = BOARD_ICON_MAP[board.icon] || Layout;
             
             return (
            <div
              key={board.id}
              className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col relative group hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div className="h-[180px] bg-muted border-b border-border flex items-center justify-center relative overflow-hidden">
                {/* Visual placeholder matching the icon color/theme */}
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className={`preview-placeholder w-20 h-20 rounded-2xl flex items-center justify-center text-white z-10 shadow-md transition-transform duration-300 bg-${board.icon} group-hover:scale-105`}>
                  <IconComponent size={32} />
                </div>
                
                <div
                  className="absolute top-3 right-3 flex gap-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 has-[[data-state=open]]:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Star
                    size={14}
                    className={clsx("cursor-pointer text-muted-foreground p-1.5 box-content rounded-md bg-white shadow-sm hover:text-foreground hover:bg-muted", {
                      "text-yellow-400 fill-yellow-400 opacity-100": board.isStarred,
                    })}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(board.id);
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer text-muted-foreground p-1.5 box-content rounded-md bg-white shadow-sm hover:text-foreground hover:bg-muted data-[state=open]:text-foreground data-[state=open]:bg-muted" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={14} />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[200px]">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setBoardToDelete({ id: board.id, name: board.name });
                        }}
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
              <div className="p-4 pt-3 flex flex-col gap-1 flex-1 bg-card">
                <span className="font-medium text-sm text-foreground truncate">{board.name}</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap overflow-hidden">
                  <span className="truncate">
                    Opened {board.lastOpened}
                  </span>
                  {board.space && (
                    <span className="truncate flex-shrink-0">• {board.space}</span>
                  )}
                </div>
              </div>
            </div>
            );
          })
          )}
        </div>
      )}
      {/* Infinite Scroll Sentinel */}
      <div 
        className="infinite-scroll-sentinel"
        ref={(node) => {
          if (!node || isLoading || !hasMore) return;
          
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting && hasMore && !isLoading) {
                fetchNextPage();
              }
            },
            { threshold: 0.5, rootMargin: '100px' }
          );
          
          observer.observe(node);
          return () => observer.disconnect();
        }}
        style={{ height: '20px', width: '100%' }}
      />
      
      {/* Loading More Indicator */}
      {(isLoading && boards.length > 0) && (
        <div className="flex justify-center p-4 w-full">
           {viewMode === "list" ? (
             <div className="w-full space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
           ) : (
             <div className="flex gap-4">
                <Skeleton className="h-32 w-48 rounded-xl" />
                <Skeleton className="h-32 w-48 rounded-xl" />
             </div>
           )}
        </div>
      )}
      <div className="text-center text-xs text-muted-foreground py-2">
        {boards.length} of {total} boards
      </div>
      <div style={{ height: "50px", flexShrink: 0 }} />
      
      {/* Delete Board Confirmation Dialog */}
      <Dialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{boardToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setBoardToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!boardToDelete) return;
                try {
                  await deleteBoard(boardToDelete.id);
                  await refetchBoards();
                  toast.success("Board deleted successfully");
                  setBoardToDelete(null);
                } catch (error: any) {
                  if (error?.response?.status === 403) {
                    toast.error("You don't have permission to delete this board", {
                      description: "Only the board owner can delete it."
                    });
                  } else {
                    toast.error("Failed to delete board");
                  }
                  setBoardToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
