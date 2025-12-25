import { IconCheck, IconUsers } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "../../ui/dropdown-menu";

interface TeamItemProps {
  team: {
    id: string;
    name: string;
    initials: string;
    colorClass: string;
    members?: number;
  };
  isSelected: boolean;
  onSelect: (team: any) => void;
}

const getTeamColor = (colorClass: string) => {
  switch (colorClass) {
    case "color-teal":
      return "bg-teal-500 text-white";
    case "color-purple":
      return "bg-purple-500 text-white";
    case "color-orange":
      return "bg-orange-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
};

export const TeamItem = ({ team, isSelected, onSelect }: TeamItemProps) => {
  return (
    <DropdownMenuItem
      onSelect={() => onSelect(team)}
      className="flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer focus:bg-gray-100 hover:bg-gray-100"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            getTeamColor(team.colorClass)
          )}
        >
          {team.initials}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-sm text-gray-700 truncate max-w-[140px]">
            {team.name}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <IconUsers className="text-gray-400 w-3! h-3!" />
            <span>{team.members || 8} members</span>
          </div>
        </div>
      </div>

      {isSelected && <IconCheck size={16} className="text-primary shrink-0" />}
    </DropdownMenuItem>
  );
};

export { getTeamColor };
