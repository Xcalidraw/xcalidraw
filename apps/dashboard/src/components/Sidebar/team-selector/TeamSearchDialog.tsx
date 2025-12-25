import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { IconSearch, IconUsers, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { teamSearchDialogOpenAtom } from "../sidebar.store";
import { TeamSearchItem } from "./TeamSearchItem";

// Dummy searchable teams
const SEARCHABLE_TEAMS = [
  {
    id: "4",
    name: "Engineering Team",
    initials: "ET",
    colorClass: "color-teal",
    members: 12,
    type: "public" as const,
  },
  {
    id: "5",
    name: "Product Design",
    initials: "PD",
    colorClass: "color-purple",
    members: 8,
    type: "private" as const,
  },
  {
    id: "6",
    name: "Sales & Marketing",
    initials: "SM",
    colorClass: "color-orange",
    members: 15,
    type: "public" as const,
  },
  {
    id: "7",
    name: "Customer Success",
    initials: "CS",
    colorClass: "color-teal",
    members: 6,
    type: "private" as const,
  },
];

export const TeamSearchDialog = () => {
  const [isOpen, setIsOpen] = useAtom(teamSearchDialogOpenAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleJoinTeam = (teamName: string) => {
    toast.success(`Joined ${teamName}`);
    setIsOpen(false);
  };

  const filteredTeams = SEARCHABLE_TEAMS.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-white rounded-xl shadow-2xl border-gray-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <IconUsers size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Join a Team
              </h2>
              <p className="text-sm text-gray-500">
                Discover and collaborate with existing teams
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder="Search teams by name..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-2 pb-2">
          <h3 className="px-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Recommended for you
          </h3>

          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredTeams.map((team) => (
              <TeamSearchItem key={team.id} team={team} onJoin={handleJoinTeam} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500 ml-2">
            Can't find a team?
          </span>
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
  );
};
