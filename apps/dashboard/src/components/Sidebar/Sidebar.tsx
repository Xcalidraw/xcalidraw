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
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { SidebarSpacesSkeleton } from "./SidebarSpacesSkeleton";
import { SidebarTeamTriggerSkeleton } from "./SidebarTeamTriggerSkeleton";
import { TeamSelectorDropdown } from "./TeamSelectorDropdown";

export const Sidebar = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [yourSpaces] = useAtom(yourSpacesAtom);
  const [spaces] = useAtom(spacesAtom);
  const [yourSpacesExpanded, setYourSpacesExpanded] = useAtom(yourSpacesExpandedAtom);
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
  
  const teamsQueryResult = useAtomValue(teamsQueryAtom);
  const workspacesQueryResult = useAtomValue(workspacesQueryAtom);
  const isTeamsLoading = teamsQueryResult.isLoading;
  const isLoading = workspacesQueryResult.isLoading;

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
      toast.error("Failed to create workspace", { description: "Please try again later" });
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

  const NavItem = ({ icon: Icon, label, active = false, badge, onClick }: {
    icon: any; label: string; active?: boolean; badge?: string; onClick?: () => void;
  }) => (
    <button 
      type="button" 
      className={`relative flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${active 
          ? 'bg-primary/10 text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`${active ? 'text-primary' : 'text-muted-foreground'}`} size={18} strokeWidth={1.5} />
        <span>{label}</span>
      </div>
      {badge && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-white/60 text-primary' : 'bg-muted text-muted-foreground'}`}>{badge}</span>}
    </button>
  );

  const SpaceGroup = ({ title, expanded, onToggle, children, onAdd }: {
    title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode; onAdd?: () => void;
  }) => (
    <div>
      <div className="flex items-center justify-between pb-5 group">
        <button className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground tracking-wide hover:text-foreground" onClick={onToggle}>
          <ChevronRight size={12} strokeWidth={3} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <span>{title}</span>
        </button>
        {onAdd && (
          <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" onClick={onAdd}>
            <Plus size={14} strokeWidth={2} />
          </button>
        )}
      </div>
      {expanded && <div className="flex flex-col gap-1">{children}</div>}
    </div>
  );

  const SpaceItem = ({ space, isActive }: { space: { id: string; name: string }; isActive: boolean }) => (
    <div 
      className="relative cursor-pointer group"
      onClick={() => {
        setActiveSpaceId(space.id);
        setActiveNavItem(null as any);
        navigate(`/dashboard/space/${space.id}`);
      }}
    >
      <div className={`flex items-center gap-2 w-full px-3 py-2 h-10 rounded-md text-sm transition-colors
        ${isActive 
          ? 'bg-primary/10 text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/60'}`} />
        <span className="flex-1 min-w-0 truncate">{space.name}</span>
        <div className="flex items-center gap-0 w-0 opacity-0 overflow-hidden group-hover:w-auto group-hover:opacity-100 transition-all h-[30px] -mr-2">
          <button 
            className="flex items-center justify-center h-full aspect-square rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); toast.success('Pinned'); }}
          >
            <Pin size={14} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center justify-center h-full aspect-square rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="min-w-[180px]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success('Link copied'); }}>
                <Link2 size={14} /><span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success('Share dialog'); }}>
                <Share2 size={14} /><span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success('Rename dialog'); }}>
                <Edit2 size={14} /><span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setSpaceToDelete({ id: space.id, name: space.name }); }}>
                <Trash2 size={14} /><span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <aside className={`w-64 h-dvh flex flex-col flex-shrink-0 bg-card border-r border-border text-foreground font-sans select-none p-2.5 pt-2.5 pb-0 gap-3
      max-md:fixed max-md:left-0 max-md:top-0 max-md:z-[1000] max-md:-translate-x-full max-md:transition-transform max-md:duration-300 max-md:shadow-lg
      ${sidebarOpen ? 'max-md:translate-x-0' : ''}`}
    >
      {/* 1. Team Selector */}
      <header>
        {isTeamsLoading ? <SidebarTeamTriggerSkeleton /> : <TeamSelectorDropdown />}
      </header>

      {/* 2. Search Input */}
      <div className="w-full">
        <div className="relative flex items-center w-full">
          <Search size={16} strokeWidth={2} className="absolute left-3 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
            className="pl-9 pr-14 h-[38px] text-sm w-full bg-muted"
          />
          <div className="absolute right-2 flex items-center gap-0.5 text-[10px] px-1 py-0.5 bg-card rounded text-muted-foreground shadow-sm pointer-events-none z-10">
            <Command size={10} />K
          </div>
        </div>
      </div>

      <TooltipProvider>
        {/* 3. Main Navigation */}
        <nav className="flex flex-col gap-0.5">
          <NavItem icon={Home} label="Home" active={activeNavItem === 'home'} onClick={() => { setActiveNavItem('home'); setActiveSpaceId(null); navigate('/dashboard'); }} />
          <NavItem icon={Clock} label="Recent" active={activeNavItem === 'recent'} onClick={() => { setActiveNavItem('recent'); setActiveSpaceId(null); }} />
          <NavItem icon={Star} label="Starred" badge="3" active={activeNavItem === 'starred'} onClick={() => { setActiveNavItem('starred'); setActiveSpaceId(null); }} />
        </nav>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-1" />

        {/* 4. Spaces */}
        <div className="flex-1 flex flex-col relative min-h-0">
          <div className="flex items-center justify-between pb-5 flex-shrink-0">
            <span className="text-xs font-bold uppercase text-foreground tracking-wider">Spaces</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground p-1.5 rounded-md border border-transparent hover:text-primary hover:bg-primary/10 hover:border-primary w-7 h-7 flex items-center justify-center" onClick={() => setIsCreateSpaceDialogOpen(true)}>
                  <Plus size={18} strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Create Space</p></TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-5 -mr-2.5 pr-2.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30">
            <SpaceGroup title="Your Spaces" expanded={yourSpacesExpanded} onToggle={() => setYourSpacesExpanded(!yourSpacesExpanded)}>
              {isLoading ? <SidebarSpacesSkeleton /> : yourSpaces.map((space) => <SpaceItem key={space.id} space={space} isActive={activeSpaceId === space.id} />)}
              <div className="h-2.5" />
            </SpaceGroup>

            <SpaceGroup title="Team Spaces" expanded={spacesExpanded} onToggle={() => setSpacesExpanded(!spacesExpanded)}>
              {isLoading ? <SidebarSpacesSkeleton /> : spaces.map((space) => <SpaceItem key={space.id} space={space} isActive={activeSpaceId === space.id} />)}
              <div className="h-2.5" />
            </SpaceGroup>
          </div>
        </div>
      </TooltipProvider>

      {/* Create Space Dialog */}
      <Dialog open={isCreateSpaceDialogOpen} onOpenChange={setIsCreateSpaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
            <DialogDescription>Organize related boards into a single project area.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="space-name" className="text-sm font-medium">Space Name</label>
              <Input id="space-name" type="text" placeholder="Enter space name..." value={newSpaceName} onChange={(e) => { setNewSpaceName(e.target.value); if (createSpaceError) setCreateSpaceError(""); }} onKeyDown={(e) => { if (e.key === "Enter") handleCreateSpace(); }} autoFocus />
              {createSpaceError && <span className="text-destructive text-xs">{createSpaceError}</span>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCreateSpaceDialogOpen(false)} disabled={isCreatePending}>Cancel</Button>
              <Button onClick={handleCreateSpace} disabled={isCreatePending}>
                {isCreatePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Space Dialog */}
      <Dialog open={!!spaceToDelete} onOpenChange={(open) => !open && setSpaceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Space</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Are you sure you want to delete "{spaceToDelete?.name}"?</p>
              <p className="text-destructive font-medium">⚠️ This will permanently delete all boards within this space.</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setSpaceToDelete(null)} disabled={isDeletePending}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (!spaceToDelete) return;
              try {
                await deleteSpace(spaceToDelete.id);
                await refetchWorkspaces();
                toast.success("Space deleted successfully");
                setSpaceToDelete(null);
                navigate('/dashboard');
              } catch (error: any) {
                toast.error("Failed to delete space");
                setSpaceToDelete(null);
              }
            }} disabled={isDeletePending}>
              {isDeletePending ? "Deleting..." : "Delete Space"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
