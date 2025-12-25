import {
  MoreHorizontal,
  Share2,
  Link,
  Pencil,
  Copy,
  Image as ImageIcon,
  Info,
  ArrowRightLeft,
  Users,
  Trash2,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

interface BoardActionsDropdownProps {
  boardId: string;
  boardName: string;
  onDelete: (board: { id: string; name: string }) => void;
  variant?: "table" | "gallery";
}

export const BoardActionsDropdown = ({
  boardId,
  boardName,
  onDelete,
  variant = "table",
}: BoardActionsDropdownProps) => {
  const triggerClasses = {
    table:
      "cursor-pointer text-muted-foreground transition-colors p-1 box-content rounded hover:text-foreground hover:bg-muted data-[state=open]:text-foreground data-[state=open]:bg-muted",
    gallery:
      "cursor-pointer text-muted-foreground p-1.5 box-content rounded-md bg-white shadow-sm hover:text-foreground hover:bg-muted data-[state=open]:text-foreground data-[state=open]:bg-muted",
  };

  const iconSize = variant === "gallery" ? 14 : 18;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={triggerClasses[variant]}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={iconSize} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Share2 size={14} />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Link size={14} />
          Copy board link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Pencil size={14} />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Copy size={14} />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <ImageIcon size={14} />
          Change thumbnail
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Info size={14} />
          Board Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <ArrowRightLeft size={14} />
          Move to Space
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Users size={14} />
          Move to Team
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete({ id: boardId, name: boardName });
          }}
        >
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="warning"
          onClick={(e) => e.stopPropagation()}
        >
          <LogOut size={14} />
          Leave
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
