import { IconPlus } from "@tabler/icons-react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";

interface CreateOrgActionProps {
  onClick: () => void;
}

export const CreateOrgAction = ({ onClick }: CreateOrgActionProps) => {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="group text-muted-foreground hover:text-foreground"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md border border-dashed border-gray-300 group-hover:border-gray-400 transition-colors shrink-0">
        <IconPlus size={16} />
      </div>
      <span className="font-medium text-sm">Create Organization</span>
    </DropdownMenuItem>
  );
};
