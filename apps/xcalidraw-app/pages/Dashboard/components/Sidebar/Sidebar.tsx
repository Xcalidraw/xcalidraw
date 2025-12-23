// eslint-disable-next-line no-restricted-imports
import { useAtom, useAtomValue } from "jotai";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Clock,
  Star,
  Search,
  Plus,
  ChevronRight,
  Command,
  Hash,
  Loader2,
  Pin,
  MoreVertical,
  Link2,
  Share2,
  Edit2,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { useNavigate, useLocation, matchPath } from "react-router-dom";

import {
  currentTeamAtom,
  yourSpacesAtom,
  spacesAtom,
  yourSpacesExpandedAtom,
  spacesExpandedAtom,
  sidebarOpenAtom,
  teamsQueryAtom,
  workspacesQueryAtom,
  deleteSpaceMutationAtom,
  createSpaceMutationAtom,
} from "../../store";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shadcn/components/ui/dropdown-menu";

import "./Sidebar.scss";
import "./TeamSearchDialog.scss";
import "./SpaceActions.scss";
import { SidebarSpacesSkeleton } from "./SidebarSpacesSkeleton";
import { SidebarTeamTriggerSkeleton } from "./SidebarTeamTriggerSkeleton";
import { TeamSelectorDropdown } from "./TeamSelectorDropdown";

export const Sidebar = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [yourSpaces] = useAtom(yourSpacesAtom);
  const [spaces] = useAtom(spacesAtom);
  const [yourSpacesExpanded, setYourSpacesExpanded] = useAtom(
    yourSpacesExpandedAtom,
  );
  const [spacesExpanded, setSpacesExpanded] = useAtom(spacesExpandedAtom);
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [searchValue, setSearchValue] = useState("");
  const [isCreateSpaceDialogOpen, setIsCreateSpaceDialogOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [createSpaceError, setCreateSpaceError] = useState("");
  const [activeNavItem, setActiveNavItem] = useState<'home' | 'recent' | 'starred'>('home');
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [{ mutateAsync: createWorkspace, isPending: isCreatePending }] = useAtom(createSpaceMutationAtom);
  const [{ mutateAsync: deleteSpace, isPending: isDeletePending }] = useAtom(deleteSpaceMutationAtom);
  const [{ refetch: refetchWorkspaces }] = useAtom(workspacesQueryAtom) as any;
  const [spaceToDelete, setSpaceToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Get loading states from query atoms
  const teamsQueryResult = useAtomValue(teamsQueryAtom);
  const workspacesQueryResult = useAtomValue(workspacesQueryAtom);
  const isTeamsLoading = teamsQueryResult.isLoading;
  const isLoading = workspacesQueryResult.isLoading;

  // Sync active state with URL
  useEffect(() => {
    const pathname = location.pathname;
    
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
        setActiveNavItem('home');
        setActiveSpaceId(null);
    } else {
        const spaceMatch = matchPath('/dashboard/space/:spaceId', pathname);
        if (spaceMatch && spaceMatch.params.spaceId) {
            setActiveSpaceId(spaceMatch.params.spaceId);
            setActiveNavItem(null as any);
        }
    }
  }, [location.pathname]);

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      setCreateSpaceError("Space name cannot be empty");
      return;
    }

    setCreateSpaceError("");
    try {
      await createWorkspace({ teamId: currentTeam.id, name: newSpaceName });
      await refetchWorkspaces();
      setIsCreateSpaceDialogOpen(false);
      setNewSpaceName("");
      toast.success("Workspace created successfully");
    } catch (error) {
      setCreateSpaceError("Failed to create space. Please try again.");
      toast.error("Failed to create workspace", {
        description: "Please try again later",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const NavItem = ({
    icon: Icon,
    label,
    active = false,
    badge,
    onClick,
  }: {
    icon: any;
    label: string;
    active?: boolean;
    badge?: string;
    onClick?: () => void;
  }) => (
    <button 
      type="button" 
      className={clsx("sidebar-nav-item", { active })}
      onClick={onClick}
    >
      <div className="nav-content">
        <Icon className="nav-icon" size={18} strokeWidth={1.5} />
        <span className="nav-label">{label}</span>
      </div>
      {badge && <span className="nav-badge">{badge}</span>}
    </button>
  );

  const SpaceGroup = ({
    title,
    expanded,
    onToggle,
    children,
    onAdd,
  }: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    onAdd?: () => void;
  }) => (
    <div className="sidebar-group">
      <div className="group-header">
        <button className="header-toggle" onClick={onToggle}>
          <ChevronRight
            size={12}
            strokeWidth={3}
            className={clsx("arrow", { expanded })}
          />
          <span>{title}</span>
        </button>
        {onAdd && (
          <button className="header-action" onClick={onAdd}>
            <Plus size={14} strokeWidth={2} />
          </button>
        )}
      </div>
      {expanded && <div className="group-items">{children}</div>}
    </div>
  );

  return (
    <aside className={clsx("dashboard-sidebar", { open: sidebarOpen })}>
      {/* 1. Team Selector */}
      <header className="sidebar-header">
        {isTeamsLoading ? (
            <SidebarTeamTriggerSkeleton />
        ) : (
          <TeamSelectorDropdown />
        )}
      </header>

      {/* 2. Search Input */}
      <div className="sidebar-search-container">
        <div className="search-input-wrapper">
          <Search size={16} strokeWidth={2} className="search-icon" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchValue(e.target.value)
            }
            className="search-input"
          />
          <div className="shortcut">
            <Command size={10} />K
          </div>
        </div>
      </div>

      <TooltipProvider>
        {/* 3. Main Navigation */}
        <nav className="nav-section">
            <NavItem 
              icon={Home} 
              label="Home" 
              active={activeNavItem === 'home'}
              onClick={() => {
                setActiveNavItem('home');
                setActiveSpaceId(null); // Deselect spaces
                navigate('/dashboard');
              }}
            />
            <NavItem 
              icon={Clock} 
              label="Recent" 
              active={activeNavItem === 'recent'}
              onClick={() => {
                setActiveNavItem('recent');
                setActiveSpaceId(null); // Deselect spaces
              }}
            />
            <NavItem 
              icon={Star} 
              label="Starred" 
              badge="3"
              active={activeNavItem === 'starred'}
              onClick={() => {
                setActiveNavItem('starred');
                setActiveSpaceId(null); // Deselect spaces
              }}
            />
          </nav>

          <div className="sidebar-spacer" />

          {/* 4. Spaces */}
          <div className="spaces-section">
            <div className="spaces-section-header">
              <span className="spaces-section-title">Spaces</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="spaces-add-btn"
                    onClick={() => setIsCreateSpaceDialogOpen(true)}
                  >
                    <Plus size={18} strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Create Space</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="spaces-groups-container">
              <SpaceGroup
                title="Your Spaces"
                expanded={yourSpacesExpanded}
                onToggle={() => setYourSpacesExpanded(!yourSpacesExpanded)}
              >
                {isLoading ? (
                  <SidebarSpacesSkeleton />
                ) : (
                  yourSpaces.map((space) => (
                  <div 
                    key={space.id} 
                    className="space-item-wrapper"
                    onClick={() => {
                      setActiveSpaceId(space.id);
                      setActiveNavItem(null as any);
                      navigate(`/dashboard/space/${space.id}`);
                    }}
                  >
                    <div className={clsx("space-item", { active: activeSpaceId === space.id })}>
                      <span className="space-indicator dot" />
                      <span className="space-name">{space.name}</span>
                      <div className="space-actions">
                        <button 
                          className="space-action-btn pin-btn" 
                          title="Pin"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Pinned');
                          }}
                        >
                          <Pin size={14} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="space-action-btn more-btn" 
                              title="More options"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="space-menu">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Link copied');
                            }}>
                              <Link2 size={14} />
                              <span>Copy link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Share dialog');
                            }}>
                              <Share2 size={14} />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Rename dialog');
                            }}>
                              <Edit2 size={14} />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="danger" onClick={(e) => {
                              e.stopPropagation();
                              setSpaceToDelete({ id: space.id, name: space.name });
                            }}>
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )))}
                <div className="extra-space-item" />
              </SpaceGroup>

              <SpaceGroup
                title="Team Spaces"
                expanded={spacesExpanded}
                onToggle={() => setSpacesExpanded(!spacesExpanded)}
              >
                {isLoading ? (
                  <SidebarSpacesSkeleton />
                ) : (
                  spaces.map((space) => (
                  <div 
                    key={space.id} 
                    className="space-item-wrapper"
                    onClick={() => {
                      setActiveSpaceId(space.id);
                      setActiveNavItem(null as any);
                      navigate(`/dashboard/space/${space.id}`);
                    }}
                  >
                    <div className={clsx("space-item", { active: activeSpaceId === space.id })}>
                      <Hash size={14} className="space-indicator hash" />
                      <span className="space-name">{space.name}</span>
                      <div className="space-actions">
                        <button 
                          className="space-action-btn pin-btn" 
                          title="Pin"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Pinned');
                          }}
                        >
                          <Pin size={14} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="space-action-btn more-btn" 
                              title="More options"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="space-menu">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Link copied');
                            }}>
                              <Link2 size={14} />
                              <span>Copy link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Share dialog');
                            }}>
                              <Share2 size={14} />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Rename dialog');
                            }}>
                              <Edit2 size={14} />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="danger" onClick={(e) => {
                              e.stopPropagation();
                              setSpaceToDelete({ id: space.id, name: space.name });
                            }}>
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )))}
                <div className="extra-space-item" />
              </SpaceGroup>
            </div>
          </div>
        </TooltipProvider>

      {/* Create Space Dialog */}
      <Dialog
        open={isCreateSpaceDialogOpen}
        onOpenChange={setIsCreateSpaceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
            <DialogDescription>
              Organize related boards into a single project area, so you can find, share and collaborate easily.
            </DialogDescription>
          </DialogHeader>
          <div className="dialog-body">
            <div className="form-group">
              <label htmlFor="space-name">Space Name</label>
              <Input
                id="space-name"
                type="text"
                placeholder="Enter space name..."
                value={newSpaceName}
                onChange={(e) => {
                  setNewSpaceName(e.target.value);
                  if (createSpaceError) setCreateSpaceError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateSpace();
                }}
                autoFocus
              />
              {createSpaceError && (
                <span className="text-red-500 text-xs mt-1">{createSpaceError}</span>
              )}
            </div>
            <div className="dialog-actions">
              <Button
                variant="secondary"
                onClick={() => setIsCreateSpaceDialogOpen(false)}
                disabled={isCreatePending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleCreateSpace}
                disabled={isCreatePending}
              >
                {isCreatePending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Space Confirmation Dialog */}
      <Dialog open={!!spaceToDelete} onOpenChange={(open) => !open && setSpaceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Space</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Are you sure you want to delete "{spaceToDelete?.name}"?</p>
              <p className="text-red-600 font-medium">
                ⚠️ This will permanently delete all boards within this space. This action cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setSpaceToDelete(null)}
              disabled={isDeletePending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!spaceToDelete) return;
                try {
                  await deleteSpace(spaceToDelete.id);
                  await refetchWorkspaces();
                  toast.success("Space and all its boards deleted successfully");
                  setSpaceToDelete(null);
                  navigate('/dashboard');
                } catch (error: any) {
                  if (error?.response?.status === 403) {
                    toast.error("You don't have permission to delete this space", {
                      description: "Only the space owner can delete it."
                    });
                  } else {
                    toast.error("Failed to delete space");
                  }
                  setSpaceToDelete(null);
                }
              }}
              disabled={isDeletePending}
            >
              {isDeletePending ? "Deleting..." : "Delete Space"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
