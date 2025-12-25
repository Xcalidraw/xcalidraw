import { IconBuildingCommunity, IconCheck } from "@tabler/icons-react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";

interface OrgItemProps {
  org: {
    org_id: string;
    name: string;
  };
  isSelected: boolean;
  onSelect: (orgId: string) => void;
}

export const OrgItem = ({ org, isSelected, onSelect }: OrgItemProps) => {
  return (
    <DropdownMenuItem
      onClick={() => onSelect(org.org_id)}
      className="group"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors shrink-0">
        <IconBuildingCommunity className="w-6! h-6!" />
      </div>

      <div className="flex-1 truncate flex flex-col items-start">
        <span className="text-sm text-foreground">{org.name}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Plan Free
        </span>
      </div>

      {isSelected && (
        <IconCheck size={18} className="text-primary shrink-0" />
      )}
    </DropdownMenuItem>
  );
};
