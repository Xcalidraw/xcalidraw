import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  IconPlus,
  IconSearch,
  IconSelector,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { currentTeamAtom, teamsAtom } from "../../../store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { TeamItem, getTeamColor } from "./TeamItem";
import { useTeamActions } from "./hooks";

export const TeamSelectorDropdown = () => {
  const [currentTeam, setCurrentTeam] = useAtom(currentTeamAtom);
  const [teams] = useAtom(teamsAtom);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { handleSwitchTeam, handleOpenTeamSearch } = useTeamActions();

  // Set default team if not set
  useEffect(() => {
    if (teams.length > 0 && !currentTeam.id) {
      setCurrentTeam(teams[0]);
    }
  }, [teams, currentTeam.id, setCurrentTeam]);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center justify-between gap-2 px-2 py-2 h-auto rounded-lg font-normal",
            "bg-gray-50 hover:bg-gray-100 transition-colors duration-200 shadow-none",
            "focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer",
            isDropdownOpen && "bg-gray-100"
          )}
          aria-expanded={isDropdownOpen}
          aria-label="Select a team"
        >
          <div className="flex items-center gap-3 min-w-0 text-left">
            {/* Avatar */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0 border border-transparent",
                getTeamColor(currentTeam.colorClass)
              )}
            >
              {currentTeam.initials}
            </div>

            {/* Text content */}
            <div className="flex flex-col">
              <span className="truncate text-sm font-semibold text-gray-900 leading-none mb-1">
                {currentTeam.name || "Select Team"}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium leading-none">
                <IconUsers className="text-gray-500 w-3! h-3!" />
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

      <DropdownMenuContent
        className="w-[240px] p-2 rounded-xl shadow-xl border-gray-300"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-2 py-1.5">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider">
            Teams
          </h2>
        </div>

        {/* Team List */}
        <DropdownMenuGroup>
          {teams.map((team: any) => (
            <TeamItem
              key={team.id}
              team={team}
              isSelected={currentTeam.id === team.id}
              onSelect={handleSwitchTeam}
            />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-gray-100" />

        {/* Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={handleOpenTeamSearch}
            className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer focus:bg-gray-100 hover:bg-gray-100 text-gray-700"
          >
            <IconSearch size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Join Team</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer focus:bg-gray-100 hover:bg-gray-100 text-gray-700">
            <IconPlus size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Create Team</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
