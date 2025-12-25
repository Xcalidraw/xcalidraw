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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Alert, AlertDescription } from "../ui/alert";
import { IconAlertTriangle } from "@tabler/icons-react";

export const Sidebar = () => {
  const [currentTeam] = useAtom(currentTeamAtom);
  const [yourSpaces] = useAtom(yourSpacesAtom);
  const [spaces] = useAtom(spacesAtom);
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
      className={`relative flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
        ${active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={active ? 'text-primary' : 'text-muted-foreground'} size={18} strokeWidth={active ? 2 : 1.5} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center
          ${active ? 'bg-primary text-white' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
          {badge}
        </span>
      )}
    </button>
  );



  const SpaceItem = ({ space, isActive }: { space: { id: string; name: string }; isActive: boolean }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    return (
      <div 
        className="relative cursor-pointer group"
        onClick={() => {
          setActiveSpaceId(space.id);
          setActiveNavItem(null as any);
          navigate(`/dashboard/space/${space.id}`);
        }}
      >
        <div className={`flex items-center gap-2.5 w-full px-3 pr-2 py-2 rounded-lg text-sm transition-colors
          ${isActive 
            ? 'bg-primary/10 text-primary font-medium' 
            : dropdownOpen 
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Hash size={16} strokeWidth={isActive ? 2 : 1.5} className={`shrink-0 ${isActive ? 'text-primary' : dropdownOpen ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
          <span className="flex-1 min-w-0 truncate">{space.name}</span>
          <div 
            className={`flex items-center gap-0.5 shrink-0 overflow-hidden transition-all duration-150 ${dropdownOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 group-hover:w-auto group-hover:opacity-100'}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-muted-foreground hover:!text-primary hover:!bg-primary/10 cursor-pointer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    toast.success('Pinned'); 
                  }}
                >
                  <Pin size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Pin to top</TooltipContent>
            </Tooltip>
            <DropdownMenu modal={false} open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="icon-sm"
                      className={`h-7 w-7 cursor-pointer ${dropdownOpen ? 'bg-primary/10 text-primary hover:!bg-primary/20' : 'text-muted-foreground hover:!text-primary hover:!bg-primary/10'}`}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">More options</TooltipContent>
              </Tooltip>
              <DropdownMenuContent 
                side="right" 
                align="start"
                className="w-[180px] p-1.5 rounded-xl shadow-lg border-gray-300"
              >
                <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer" onClick={(e) => { e.stopPropagation(); toast.success('Link copied'); }}>
                  <Link2 size={15} className="text-muted-foreground" /><span className="text-sm">Copy link</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer" onClick={(e) => { e.stopPropagation(); toast.success('Share dialog'); }}>
                  <Share2 size={15} className="text-muted-foreground" /><span className="text-sm">Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer" onClick={(e) => { e.stopPropagation(); toast.success('Rename dialog'); }}>
                  <Edit2 size={15} className="text-muted-foreground" /><span className="text-sm">Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem variant="destructive" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer" onClick={(e) => { e.stopPropagation(); setSpaceToDelete({ id: space.id, name: space.name }); }}>
                  <Trash2 size={15} /><span className="text-sm">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className={`w-68 h-dvh flex flex-col flex-shrink-0 bg-card border-r border-border text-foreground font-sans select-none p-2.5 pt-2.5 pb-0 gap-3
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
            className="pl-9 pr-14 h-[38px] text-sm w-full bg-muted !border-transparent"
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

        <div className="w-full h-px bg-border/50 my-3" />

        {/* 4. Spaces */}
        <div className="flex-1 flex flex-col relative min-h-0">
          <div className="flex items-center justify-between pb-3 px-2 shrink-0">
            <span className="text-xs font-semibold uppercase text-foreground tracking-wide">Spaces</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-7 w-7 shadow-none cursor-pointer"
                  onClick={() => setIsCreateSpaceDialogOpen(true)}
                >
                  <Plus size={16} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create a Space</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 -mr-2.5 pr-2.5 scrollbar-hover">
            <Accordion type="multiple" defaultValue={["your-spaces", "team-spaces"]} className="w-full">
              <AccordionItem value="your-spaces" className="border-none">
                <AccordionTrigger className="py-2 px-2 text-[11px] font-medium uppercase tracking-wider hover:text-foreground cursor-pointer hover:underline hover:text-primary">
                  Your Spaces
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex flex-col gap-0.5">
                    {isLoading ? <SidebarSpacesSkeleton /> : yourSpaces.map((space) => <SpaceItem key={space.id} space={space} isActive={activeSpaceId === space.id} />)}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="team-spaces" className="border-none">
                <AccordionTrigger className="py-2 px-2 text-[11px] font-medium uppercase tracking-wider hover:text-foreground cursor-pointer hover:underline hover:text-primary">
                  Team Spaces
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex flex-col gap-0.5">
                    {isLoading ? <SidebarSpacesSkeleton /> : spaces.map((space) => <SpaceItem key={space.id} space={space} isActive={activeSpaceId === space.id} />)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </TooltipProvider>

      {/* Create Space Dialog */}
      <Dialog open={isCreateSpaceDialogOpen} onOpenChange={setIsCreateSpaceDialogOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Hash size={20} className="text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Create Space</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">Organize related boards into a single project area.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-5">
            <Field>
              <FieldLabel htmlFor="space-name">Space Name</FieldLabel>
              <Input 
                id="space-name" 
                type="text" 
                placeholder="e.g., Marketing Campaign, Product Roadmap..." 
                value={newSpaceName} 
                onChange={(e) => { setNewSpaceName(e.target.value); if (createSpaceError) setCreateSpaceError(""); }} 
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateSpace(); }} 
                className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary/20"
                autoFocus 
              />
              {createSpaceError && <FieldError>{createSpaceError}</FieldError>}
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateSpaceDialogOpen(false)} disabled={isCreatePending} className="px-4 cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleCreateSpace} disabled={isCreatePending || !newSpaceName.trim()} className="px-5 cursor-pointer">
                {isCreatePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Space"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Space Dialog */}
      <Dialog open={!!spaceToDelete} onOpenChange={(open) => !open && setSpaceToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex-row gap-4 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Delete Space</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-medium text-foreground">"{spaceToDelete?.name}"</span>?
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <Alert variant="warning" className="mt-2">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will permanently delete all boards within this space. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSpaceToDelete(null)} disabled={isDeletePending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="gap-1.5"
              onClick={async () => {
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
              }} 
              disabled={isDeletePending}
            >
              {isDeletePending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
