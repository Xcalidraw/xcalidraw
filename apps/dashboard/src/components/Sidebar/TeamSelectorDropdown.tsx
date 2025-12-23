import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { Search, ChevronDown, Check, Plus, Users, Globe, Lock, Sparkles, Crown } from "lucide-react";
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
      return 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)';
    case 'color-purple':
      return 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)';
    case 'color-orange':
      return 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
    default:
      return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
  }
};

const getPlanBadge = (plan: string = 'free') => {
  switch (plan) {
    case 'pro':
      return { label: 'Pro', className: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' };
    case 'enterprise':
      return { label: 'Enterprise', className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' };
    default:
      return { label: 'Free', className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' };
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

  const planBadge = getPlanBadge();

  return (
    <>
      <DropdownMenu open={isTeamDropdownOpen} onOpenChange={setIsTeamDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "group relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl",
              "bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800",
              "border border-zinc-200/80 dark:border-zinc-700/80",
              "shadow-sm hover:shadow-md",
              "transition-all duration-300 ease-out",
              "outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2",
              isTeamDropdownOpen && "shadow-lg ring-2 ring-violet-500/20"
            )}
            aria-expanded={isTeamDropdownOpen}
            aria-label="Select a team"
          >
            {/* Avatar with glow effect */}
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  background: getTeamGradient(currentTeam.colorClass),
                  boxShadow: `0 4px 14px -2px ${currentTeam.colorClass === 'color-teal' ? 'rgba(16, 185, 129, 0.4)' : currentTeam.colorClass === 'color-purple' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`
                }}
              >
                {currentTeam.initials}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-800 shadow-sm" />
            </div>
            
            {/* Text content */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight max-w-[140px]">
                {currentTeam.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                  planBadge.className
                )}>
                  {planBadge.label === 'Pro' && <Crown className="w-2.5 h-2.5" />}
                  {planBadge.label}
                </span>
              </div>
            </div>
            
            {/* Chevron */}
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-zinc-400 transition-transform duration-300",
                isTeamDropdownOpen && "rotate-180"
              )} 
            />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className={cn(
            "w-[300px] p-2 z-9999 rounded-2xl",
            "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl",
            "border border-zinc-200/60 dark:border-zinc-700/60",
            "shadow-2xl shadow-zinc-900/10"
          )} 
          align="start" 
          side="bottom" 
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-3 py-2 mb-1">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Your Workspaces
            </h2>
          </div>

          {/* Team List */}
          <DropdownMenuGroup>
            {teams.map((team: any) => (
              <DropdownMenuItem
                key={team.id}
                onSelect={() => setCurrentTeam(team)}
                className={cn(
                  "group flex items-center gap-3 p-2.5 cursor-pointer rounded-xl mb-1",
                  "transition-all duration-200 outline-none",
                  "hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50",
                  "dark:hover:from-violet-950/50 dark:hover:to-purple-950/50",
                  currentTeam.id === team.id && "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50"
                )}
              >
                {/* Team Avatar */}
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: getTeamGradient(team.colorClass) }}
                >
                  {team.initials}
                </div>
                
                {/* Team Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {team.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {team.members || 1} members
                  </span>
                </div>
                
                {/* Selected indicator */}
                {currentTeam.id === team.id && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2 bg-zinc-100 dark:bg-zinc-800" />

          {/* Actions */}
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem
              onSelect={() => setIsTeamSearchOpen(true)}
              className="group flex items-center gap-3 p-2.5 cursor-pointer rounded-xl transition-all duration-200 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Join Team</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Discover workspaces</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="group flex items-center gap-3 p-2.5 cursor-pointer rounded-xl transition-all duration-200 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Plus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create Team</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Start a new workspace</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Team Search Dialog */}
      <Dialog open={isTeamSearchOpen} onOpenChange={setIsTeamSearchOpen}>
        <DialogContent 
          className={cn(
            "sm:max-w-[560px] gap-0 p-0 overflow-hidden outline-none rounded-2xl",
            "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl",
            "border border-zinc-200/60 dark:border-zinc-700/60",
            "shadow-2xl"
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Join a Team</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Discover and collaborate with teams</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
              <input
                ref={teamSearchInputRef}
                placeholder="Search teams by name..."
                className={cn(
                  "w-full h-12 pl-12 pr-4 rounded-xl",
                  "bg-zinc-50 dark:bg-zinc-800",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-base text-zinc-900 dark:text-zinc-100",
                  "placeholder:text-zinc-400",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                )}
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="px-6 pb-6">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Recommended for you
            </h3>
            
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {SEARCHABLE_TEAMS
                .filter(team => 
                  team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
                )
                .map((team) => (
                  <div 
                    key={team.id} 
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-xl",
                      "bg-zinc-50/50 dark:bg-zinc-800/50",
                      "border border-zinc-100 dark:border-zinc-700/50",
                      "hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50",
                      "dark:hover:from-violet-950/30 dark:hover:to-purple-950/30",
                      "hover:border-violet-200 dark:hover:border-violet-800",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ 
                          background: getTeamGradient(team.colorClass),
                          boxShadow: `0 8px 20px -4px ${team.colorClass === 'color-teal' ? 'rgba(16, 185, 129, 0.3)' : team.colorClass === 'color-purple' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}
                      >
                        {team.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {team.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <Users className="w-3 h-3" /> {team.members}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          <span className={cn(
                            "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md",
                            team.type === 'public' 
                              ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50"
                              : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50"
                          )}>
                            {team.type === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {team.type === 'public' ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={cn(
                        "h-9 px-5 rounded-lg text-sm font-semibold",
                        "bg-gradient-to-r from-violet-600 to-purple-600",
                        "hover:from-violet-500 hover:to-purple-500",
                        "text-white shadow-lg shadow-violet-500/25",
                        "transition-all duration-200",
                        "active:scale-95"
                      )}
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Can't find what you're looking for?</span>
            <button 
              className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold",
                "text-violet-600 dark:text-violet-400",
                "hover:bg-violet-50 dark:hover:bg-violet-950/50",
                "transition-all duration-200"
              )}
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
