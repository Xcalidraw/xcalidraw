import { IconUsers, IconWorld, IconLock } from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { getTeamColor } from "./TeamItem";

interface TeamSearchItemProps {
  team: {
    id: string;
    name: string;
    initials: string;
    colorClass: string;
    members: number;
    type: "public" | "private";
  };
  onJoin: (teamName: string) => void;
}

export const TeamSearchItem = ({ team, onJoin }: TeamSearchItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            getTeamColor(team.colorClass)
          )}
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
              {team.type === "public" ? (
                <IconWorld size={12} />
              ) : (
                <IconLock size={12} />
              )}
              {team.type === "public" ? "Public" : "Private"}
            </span>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onJoin(team.name)}
      >
        Join
      </Button>
    </div>
  );
};
