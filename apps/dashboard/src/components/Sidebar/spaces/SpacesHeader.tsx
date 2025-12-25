import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/tooltip";
import { useSpaceActions } from "./hooks";

export const SpacesHeader = () => {
  const { handleOpenCreateDialog } = useSpaceActions();

  return (
    <div className="flex items-center justify-between pb-3 px-2 shrink-0">
      <span className="text-xs font-semibold uppercase text-foreground tracking-wide">
        Spaces
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 shadow-none cursor-pointer"
            onClick={handleOpenCreateDialog}
          >
            <Plus size={16} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Create a Space</TooltipContent>
      </Tooltip>
    </div>
  );
};
