import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { Search, ChevronsUpDown, Check, Plus, Users, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
 
import { currentTeamAtom, teamsAtom } from "../../store";
import {
  Dialog,
  DialogContent,
} from "../../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@shadcn/components/ui/dropdown-menu";
import { cn } from "@shadcn/lib/utils";
 
// Dummy searchable teams
const SEARCHABLE_TEAMS = [
  { id: '4', name: 'Engineering Team', initials: 'ET', colorClass: 'color-teal', members: 12, type: 'public' },
  { id: '5', name: 'Product Design', initials: 'PD', colorClass: 'color-purple', members: 8, type: 'private' },
  { id: '6', name: 'Sales & Marketing', initials: 'SM', colorClass: 'color-orange', members: 15, type: 'public' },
  { id: '7', name: 'Customer Success', initials: 'CS', colorClass: 'color-teal', members: 6, type: 'private' },
];
 
const getTeamGradient = (colorClass: string) => {
  switch (colorClass) {
    case 'color-teal':
      return 'linear-gradient(135deg, #0d9488 0%, #0ec7b5 100%)';
    case 'color-purple':
      return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
    case 'color-orange':
      return 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)';
    default:
      return 'linear-gradient(135deg, #52525b 0%, #71717a 100%)';
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
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "flex w-full items-center justify-between px-3 h-[52px] bg-white hover:bg-zinc-50 border border-zinc-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 rounded-lg cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20",
              isTeamDropdownOpen && "bg-zinc-50 border-zinc-300/60 shadow-inner"
            )}
            aria-expanded={isTeamDropdownOpen}
            aria-label="Select a team"
          >
            <div className="flex items-center gap-3.5 text-left min-w-0 flex-1">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0 border border-white/20"
                style={{ background: getTeamGradient(currentTeam.colorClass) }}
              >
                {currentTeam.initials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-[15px] font-bold text-zinc-900 leading-tight">
                  {currentTeam.name}
                </span>
                <span className="truncate text-[11px] text-zinc-500 font-medium mt-0.5">
                  Free Plan
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px] p-2 z-9999 rounded-xl shadow-xl border-zinc-200/80 bg-white" align="start" side="bottom" sideOffset={10}>
          <div className="px-3 py-2.5 mb-1">
            <h2 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">
              Switch Team
            </h2>
          </div>
          
          <DropdownMenuGroup>
            {teams.map((team: any) => (
              <DropdownMenuItem
                key={team.id}
                onSelect={() => setCurrentTeam(team)}
                className={cn(
                  "flex items-center gap-3.5 p-2.5 cursor-pointer rounded-lg focus:bg-zinc-100 hover:bg-zinc-50 transition-all outline-none mb-1 last:mb-0",
                  currentTeam.id === team.id && "bg-zinc-100/50"
                )}
              >
                <div 
                    className="w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 border border-white/10"
                    style={{ background: getTeamGradient(team.colorClass) }}
                >
                  {team.initials}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm text-zinc-900 truncate mb-0.5">{team.name}</span>
                  <span className="text-xs text-zinc-500">
                    {team.members || 1} members
                  </span>
                </div>
                {currentTeam.id === team.id && (
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="my-2 bg-zinc-100" />
          
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem
              onSelect={() => setIsTeamSearchOpen(true)}
              className="flex items-center gap-3.5 p-2.5 cursor-pointer rounded-lg focus:bg-zinc-100 transition-all outline-none text-zinc-600 hover:text-zinc-900"
            >
              <div className="w-9 h-9 rounded-md flex items-center justify-center bg-white border border-zinc-200 shadow-sm shrink-0">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-900">Join Team</span>
                <span className="text-xs text-zinc-500">Find and join other teams</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3.5 p-2.5 cursor-pointer rounded-lg focus:bg-zinc-100 transition-all outline-none text-zinc-600 hover:text-zinc-900">
              <div className="w-9 h-9 rounded-md flex items-center justify-center bg-white border border-zinc-200 shadow-sm shrink-0">
                <Plus className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-zinc-900">Create Team</span>
                 <span className="text-xs text-zinc-500">Start a new workspace</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
 
      {/* Team Search Dialog */}
      <Dialog open={isTeamSearchOpen} onOpenChange={setIsTeamSearchOpen}>
        <DialogContent className="sm:max-w-[540px] gap-0 p-0 overflow-hidden outline-none border-zinc-200 shadow-2xl bg-white rounded-xl">
          <div className="px-6 py-5 border-b border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Join a Team</h2>
            <p className="text-sm text-zinc-500 mt-1">Discover and collaborate with specialized teams.</p>
          </div>
          
          <div className="p-6 bg-white">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                ref={teamSearchInputRef}
                placeholder="Search teams..."
                className="w-full h-12 pl-11 pr-4 rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white text-base shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-[11px] font-extrabold text-zinc-400 mb-3 px-1 uppercase tracking-widest">
                Recommended Teams
              </h3>
              
              {SEARCHABLE_TEAMS
                .filter(team => 
                  team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
                )
                .map((team) => (
                  <div key={team.id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 border border-zinc-100/50 hover:border-zinc-200 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-extrabold text-white shadow-md shrink-0 border border-white/20"
                        style={{ background: getTeamGradient(team.colorClass) }}
                      >
                        {team.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{team.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                            <Users className="h-3.5 w-3.5 opacity-60" /> {team.members}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300" />
                          <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                            {team.type === 'public' ? <Globe className="h-3.5 w-3.5 opacity-60" /> : <Lock className="h-3.5 w-3.5 opacity-60" />}
                            {team.type === 'public' ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="h-10 px-6 text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-all shadow-lg active:scale-95"
                      onClick={() => {
                        toast.success(`Joined ${team.name}`);
                        setIsTeamSearchOpen(false);
                      }}
                    >
                      Join
                    </button>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="p-6 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Need a specific space?</span>
            <button className="h-10 px-5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
              <Plus className="h-4 w-4 mr-2 inline" />
              New Workspace
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
