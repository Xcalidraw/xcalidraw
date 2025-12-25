import { useState } from "react";
import { useAtom } from "jotai";
import {
  IconLayout,
  IconSquare,
  IconCircle,
  IconTriangle,
  IconHexagon,
  IconComponents,
  IconBox,
  IconStack2,
  IconStar,
  IconHeart,
  IconBolt,
  IconFlame,
  IconSparkles,
  IconTarget,
  IconAward,
  IconBookmark,
  IconPencil,
  IconUser,
  IconBulb,
  IconPlant,
  IconFile,
  IconSearch,
  IconCalendar,
  IconMail,
  IconChartBar,
  IconShare,
  IconShield,
  IconClock,
  IconFolder,
  IconRocket,
  IconFiles,
  IconCircleCheck,
  IconBook,
  IconCompass,
  IconFlask,
  IconConfetti,
  IconMessage,
  IconSchool,
  IconWorld,
  IconClipboardList,
  IconPlus,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { cn } from "@/lib/utils";
import { createModalOpenAtom } from "../boards-table.store";
import { useBoardActions } from "./hooks";

// Icon categories with tabler icons
const ICON_CATEGORIES = [
  {
    name: "Shapes",
    icons: [
      { id: "orange", icon: IconLayout, label: "Layout", color: "#ff6b35" },
      { id: "blue", icon: IconSquare, label: "Square", color: "#4a90e2" },
      { id: "pink", icon: IconCircle, label: "Circle", color: "#ff6b9d" },
      { id: "purple", icon: IconTriangle, label: "Triangle", color: "#9b59b6" },
      { id: "green", icon: IconHexagon, label: "Hexagon", color: "#2ecc71" },
      { id: "red", icon: IconComponents, label: "Component", color: "#e74c3c" },
      { id: "cyan", icon: IconBox, label: "Box", color: "#1abc9c" },
      { id: "yellow", icon: IconStack2, label: "Layers", color: "#f39c12" },
    ],
  },
  {
    name: "Status",
    icons: [
      { id: "indigo", icon: IconStar, label: "Star", color: "#6366f1" },
      { id: "teal", icon: IconHeart, label: "Heart", color: "#14b8a6" },
      { id: "lime", icon: IconBolt, label: "Zap", color: "#84cc16" },
      { id: "violet", icon: IconSparkles, label: "Sparkles", color: "#8b5cf6" },
      { id: "rose", icon: IconFlame, label: "Flame", color: "#f43f5e" },
      { id: "amber", icon: IconTarget, label: "Target", color: "#f59e0b" },
      { id: "emerald", icon: IconAward, label: "Award", color: "#10b981" },
      { id: "sky", icon: IconBookmark, label: "Bookmark", color: "#0ea5e9" },
    ],
  },
  {
    name: "Tools",
    icons: [
      { id: "pen", icon: IconPencil, label: "Pen", color: "#f43f5e" },
      { id: "bulb", icon: IconBulb, label: "Idea", color: "#f59e0b" },
      { id: "user", icon: IconUser, label: "User", color: "#8b5cf6" },
      { id: "search", icon: IconSearch, label: "Search", color: "#f59e0b" },
      { id: "folder", icon: IconFolder, label: "Folder", color: "#f59e0b" },
      { id: "file", icon: IconFile, label: "File", color: "#0ea5e9" },
      { id: "files", icon: IconFiles, label: "Files", color: "#64748b" },
      {
        id: "clip",
        icon: IconClipboardList,
        label: "Clipboard",
        color: "#14b8a6",
      },
    ],
  },
  {
    name: "Work",
    icons: [
      { id: "chart", icon: IconChartBar, label: "Chart", color: "#10b981" },
      {
        id: "calendar",
        icon: IconCalendar,
        label: "Calendar",
        color: "#10b981",
      },
      { id: "clock", icon: IconClock, label: "Time", color: "#14b8a6" },
      { id: "mail", icon: IconMail, label: "Mail", color: "#22c55e" },
      { id: "message", icon: IconMessage, label: "Message", color: "#0ea5e9" },
      { id: "share", icon: IconShare, label: "Share", color: "#f97316" },
      { id: "check", icon: IconCircleCheck, label: "Done", color: "#22c55e" },
      { id: "party", icon: IconConfetti, label: "Party", color: "#8b5cf6" },
    ],
  },
  {
    name: "Learn",
    icons: [
      { id: "grad", icon: IconSchool, label: "Learn", color: "#10b981" },
      { id: "book", icon: IconBook, label: "Book", color: "#0ea5e9" },
      { id: "flask", icon: IconFlask, label: "Lab", color: "#ec4899" },
      { id: "plant", icon: IconPlant, label: "Grow", color: "#2ecc71" },
      { id: "globe", icon: IconWorld, label: "Global", color: "#3b82f6" },
      { id: "rocket", icon: IconRocket, label: "Launch", color: "#0ea5e9" },
      { id: "shield", icon: IconShield, label: "Secure", color: "#8b5cf6" },
      { id: "compass", icon: IconCompass, label: "Nav", color: "#6366f1" },
    ],
  },
];

// Flattened icons for easy lookup
const ALL_ICONS = ICON_CATEGORIES.flatMap((cat) => cat.icons);

export const CreateBoardModal = () => {
  const [isOpen, setIsOpen] = useAtom(createModalOpenAtom);
  const { handleCreateBoard, isCreating } = useBoardActions();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>(ALL_ICONS[0].id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await handleCreateBoard(name, selectedIcon);
      setName("");
      setSelectedIcon(ALL_ICONS[0].id);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedIcon(ALL_ICONS[0].id);
    setIsOpen(false);
  };

  const selectedIconData = ALL_ICONS.find((i) => i.id === selectedIcon);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="flex-row gap-4 items-start">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${selectedIconData?.color}15` }}
          >
            {selectedIconData && (
              <selectedIconData.icon
                size={24}
                style={{ color: selectedIconData.color }}
              />
            )}
          </div>
          <div className="space-y-1 mt-1.5">
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Give your board a name and choose an icon to get started.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Board Name Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-muted-foreground">
              Board Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome board..."
              className="h-11"
              autoFocus
            />
          </div>

          {/* Icon Selection */}
          <div className="flex flex-col gap-3">
            <Label className="text-muted-foreground">Choose Icon</Label>
            <div className="grid grid-cols-8 gap-1.5 p-3 bg-muted/30 rounded-xl max-h-[200px] overflow-y-auto max-sm:grid-cols-6 scrollbar-hover">
              {ALL_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedIcon(item.id)}
                    className={cn(
                      "aspect-square rounded-lg cursor-pointer ",
                      isSelected &&
                        "bg-background shadow-sm ring-2 ring-primary ring-offset-1"
                    )}
                    title={item.label}
                  >
                    <IconComponent
                      className="!w-5 !h-5"
                      style={{ color: item.color }}
                    />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              <IconPlus size={16} />
              {isCreating ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper to get icon color for backward compatibility
export function getIconColor(iconId: string): string {
  const icon = ALL_ICONS.find((i) => i.id === iconId);
  return icon?.color || "#64748b";
}
