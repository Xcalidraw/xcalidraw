import { useState } from "react";
import { useAtom } from "jotai";
import { Hash, Pin, MoreVertical, Link2, Share2, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/tooltip";
import { activeSpaceIdAtom } from "../sidebar.store";
import { useSpaceActions } from "./hooks";

interface SpaceItemProps {
  space: { id: string; name: string };
  isActive: boolean;
}

export const SpaceItem = ({ space, isActive }: SpaceItemProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { handleNavigateToSpace, handleOpenDeleteDialog } = useSpaceActions();

  return (
    <div
      className="relative cursor-pointer group"
      onClick={() => handleNavigateToSpace(space.id)}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 w-full px-3 pr-2 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : dropdownOpen
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Hash
          size={16}
          strokeWidth={isActive ? 2 : 1.5}
          className={cn(
            "shrink-0",
            isActive
              ? "text-primary"
              : dropdownOpen
              ? "text-foreground"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        <span className="flex-1 min-w-0 truncate">{space.name}</span>
        <div
          className={cn(
            "flex items-center gap-0.5 shrink-0 overflow-hidden transition-all duration-150",
            dropdownOpen
              ? "w-auto opacity-100"
              : "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100"
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-muted-foreground hover:text-primary! hover:bg-primary/10! cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toast.success("Pinned");
                }}
              >
                <Pin size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Pin to top</TooltipContent>
          </Tooltip>
          <DropdownMenu
            modal={false}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn(
                      "h-7 w-7 cursor-pointer",
                      dropdownOpen
                        ? "bg-primary/10 text-primary hover:bg-primary/20!"
                        : "text-muted-foreground hover:text-primary! hover:bg-primary/10!"
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">More options</TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              side="right"
              align="start"
              className="w-[180px] p-1.5 rounded-xl shadow-lg border-gray-300"
            >
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success("Link copied");
                }}
              >
                <Link2 size={15} className="text-muted-foreground" />
                <span className="text-sm">Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success("Share dialog");
                }}
              >
                <Share2 size={15} className="text-muted-foreground" />
                <span className="text-sm">Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success("Rename dialog");
                }}
              >
                <Edit2 size={15} className="text-muted-foreground" />
                <span className="text-sm">Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteDialog({ id: space.id, name: space.name });
                }}
              >
                <Trash2 size={15} />
                <span className="text-sm">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
