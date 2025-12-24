import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { 
  IconCheck, 
  IconPlus, 
  IconSearch, 
  IconSelector, 
  IconUsers,
  IconLock,
  IconWorld
} from "@tabler/icons-react";
import { toast } from "sonner";

import { currentTeamAtom, teamsAtom } from "../../store";
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";


// Dummy searchable teams
const SEARCHABLE_TEAMS = [
  { id: '4', name: 'Engineering Team', initials: 'ET', colorClass: 'color-teal', members: 12, type: 'public' },
  { id: '5', name: 'Product Design', initials: 'PD', colorClass: 'color-purple', members: 8, type: 'private' },
  { id: '6', name: 'Sales & Marketing', initials: 'SM', colorClass: 'color-orange', members: 15, type: 'public' },
  { id: '7', name: 'Customer Success', initials: 'CS', colorClass: 'color-teal', members: 6, type: 'private' },
];

const getTeamColor = (colorClass: string) => {
  switch (colorClass) {
    case 'color-teal':
      return 'bg-teal-500 text-white';
    case 'color-purple':
      return 'bg-purple-500 text-white';
    case 'color-orange':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-blue-500 text-white';
  }
};

export const TeamSelectorDropdown = () => {
  const [currentTeam, setCurrentTeam] = useAtom(currentTeamAtom);
  const [teams] = useAtom(teamsAtom);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isTeamSearchOpen, setIsTeamSearchOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const teamSearchInputRef = useRef<HTMLInputElement>(null);

  // Focus team search input when dialog opens
  useEffect(() => {
    if (isTeamSearchOpen && teamSearchInputRef.current) {
      setTimeout(() => {
        teamSearchInputRef.current?.focus();
      }, 100);
    }
  }, [isTeamSearchOpen]);

  // Set default team if not set
  useEffect(() => {
    if (teams.length > 0 && !currentTeam.id) {
      setCurrentTeam(teams[0]);
    }
  }, [teams, currentTeam.id, setCurrentTeam]);

  return (
    <>
      <DropdownMenu open={isTeamDropdownOpen} onOpenChange={setIsTeamDropdownOpen}>
        <DropdownMenuTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center justify-between gap-2 px-2 py-2 h-auto rounded-lg font-normal",
              "bg-gray-50 hover:bg-gray-100 transition-colors duration-200 shadow-none",
              "focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer",
              isTeamDropdownOpen && "bg-gray-100"
            )}
            aria-expanded={isTeamDropdownOpen}
            aria-label="Select a team"
          >
            <div className="flex items-center gap-3 min-w-0 text-left">
               {/* Avatar */}
               <div className={cn(
                 "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0 border border-transparent", 
                 getTeamColor(currentTeam.colorClass)
               )}>
                 {currentTeam.initials}
               </div>
              
               {/* Text content */}
               <div className="flex flex-col">
                 <span className="truncate text-sm font-semibold text-gray-900 leading-none mb-1">
                   {currentTeam.name || "Select Team"}
                 </span>
                 <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium leading-none">
                   <IconUsers className="text-gray-500 !w-3 !h-3" />
                   <span>{(currentTeam as any).members || 12} members</span>
                 </div>
               </div>
            </div>

            {/* Selector Icon */}
            <IconSelector 
              className="w-4 h-4 text-gray-400 group-hover:text-gray-500 shrink-0"
              stroke={1.5}
            />
          </Button>
        </DropdownMenuTrigger>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-[240px] p-2 rounded-xl shadow-xl border-gray-300"
          align="start" 
          side="bottom" 
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-2 py-1.5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Teams
            </h2>
          </div>

          {/* Team List */}
          <DropdownMenuGroup>
            {teams.map((team: any) => (
              <DropdownMenuItem
                key={team.id}
                onSelect={() => setCurrentTeam(team)}
                className="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer focus:bg-gray-100 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", getTeamColor(team.colorClass))}>
                      {team.initials}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-sm text-gray-700 truncate max-w-[140px]">
                      {team.name}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <IconUsers className="text-gray-400 !w-3 !h-3" />
                      <span>{(team as any).members || 8} members</span>
                    </div>
                </div>
                </div>
                
                {/* Selected indicator */}
                {currentTeam.id === team.id && (
                    <IconCheck size={16} className="text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          {/* Actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => setIsTeamSearchOpen(true)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer focus:bg-gray-100 hover:bg-gray-100 text-gray-700"
            >
               <IconSearch size={16} className="text-gray-500" />
               <span className="text-sm font-medium">Join Team</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer focus:bg-gray-100 hover:bg-gray-100 text-gray-700"
            >
               <IconPlus size={16} className="text-gray-500" />
               <span className="text-sm font-medium">Create Team</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Team Search Dialog */}
      <Dialog open={isTeamSearchOpen} onOpenChange={setIsTeamSearchOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-white rounded-xl shadow-2xl border-gray-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <IconUsers size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Join a Team</h2>
                <p className="text-sm text-gray-500">Discover and collaborate with existing teams</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input 
                ref={teamSearchInputRef}
                placeholder="Search teams by name..."
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="px-2 pb-2">
            <h3 className="px-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Recommended for you
            </h3>
            
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {SEARCHABLE_TEAMS
                .filter(team => 
                  team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
                )
                .map((team) => (
                  <div 
                    key={team.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", getTeamColor(team.colorClass))}
                      >
                        {team.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {team.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                                <IconUsers size={12} /> {team.members}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                {team.type === 'public' ? <IconWorld size={12} /> : <IconLock size={12} />}
                                {team.type === 'public' ? 'Public' : 'Private'}
                            </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        toast.success(`Joined ${team.name}`);
                        setIsTeamSearchOpen(false);
                      }}
                    >
                      Join
                    </Button>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500 ml-2">Can't find a team?</span>
            <Button 
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
            >
              <IconPlus size={14} className="mr-1.5" />
              Create Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
