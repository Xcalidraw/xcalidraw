// eslint-disable-next-line no-restricted-imports
import { useAtom } from "jotai";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Clock,
  Star,
  Search,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Command,
  Hash, // Used for spaces
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { useCreateWorkspaceMutation, useWorkspacesQuery } from "../../../../hooks/api.hooks";

import {
  currentTeamAtom,
  yourSpacesAtom,
  spacesAtom,
  yourSpacesExpandedAtom,
  spacesExpandedAtom,
  sidebarOpenAtom,
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

import "./Sidebar.scss";

export const Sidebar = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [yourSpaces, setYourSpaces] = useAtom(yourSpacesAtom);
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const createWorkspace = useCreateWorkspaceMutation();
  const { data: workspacesData, isLoading } = useWorkspacesQuery();

  // Update yourSpaces when workspaces are fetched
  useEffect(() => {
    if (workspacesData?.items) {
      setYourSpaces(workspacesData.items.map((ws: any) => ({
        id: ws.workspace_id,
        name: ws.name,
      })));
    }
  }, [workspacesData, setYourSpaces]);

  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) {
      setCreateSpaceError("Space name cannot be empty");
      return;
    }

    setCreateSpaceError("");
    createWorkspace.mutate(newSpaceName, {
      onSuccess: () => {
        setIsCreateSpaceDialogOpen(false);
        setNewSpaceName("");
      },
      onError: () => {
        setCreateSpaceError("Failed to create space. Please try again.");
      },
    });
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
  }: {
    icon: any;
    label: string;
    active?: boolean;
    badge?: string;
  }) => (
    <button type="button" className={clsx("sidebar-nav-item", { active })}>
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
      {/* 1. Workspace Header */}
      <header className="sidebar-header">
        <button className="workspace-btn">
          <span className="workspace-avatar">{currentTeam.initials}</span>
          <div className="workspace-details">
            <span className="name">{currentTeam.name}</span>
            <span className="role">Free Plan</span>
          </div>
          <MoreHorizontal size={16} className="workspace-options" />
        </button>
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
        <div className="sidebar-scrollable">
          {/* 3. Main Navigation */}
          <nav className="nav-section">
            <NavItem icon={Home} label="Home" active />
            <NavItem icon={Clock} label="Recent" />
            <NavItem icon={Star} label="Starred" badge="3" />
          </nav>

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
            <SpaceGroup
              title="Your Spaces"
              expanded={yourSpacesExpanded}
              onToggle={() => setYourSpacesExpanded(!yourSpacesExpanded)}
            >
              {yourSpaces.map((space) => (
                <button key={space.id} className="space-item">
                  <span className="space-indicator dot" />
                  <span className="space-name">{space.name}</span>
                </button>
              ))}
            </SpaceGroup>

            <SpaceGroup
              title="Team Spaces"
              expanded={spacesExpanded}
              onToggle={() => setSpacesExpanded(!spacesExpanded)}
            >
              {spaces.map((space) => (
                <button key={space.id} className="space-item">
                  <Hash size={14} className="space-indicator hash" />
                  <span className="space-name">{space.name}</span>
                </button>
              ))}
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
                disabled={createWorkspace.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleCreateSpace}
                disabled={createWorkspace.isPending}
              >
                {createWorkspace.isPending ? (
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
    </aside>
  );
};
