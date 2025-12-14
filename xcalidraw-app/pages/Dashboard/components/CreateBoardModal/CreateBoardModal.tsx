import { useState } from "react";
import {
  Layout, Square, Circle, Triangle, Hexagon, Component, Box, Layers,
  Star, Heart, Zap, Flame, Sparkles, Target, Award, Bookmark,
  ChevronDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
  isLoading?: boolean;
}

type IconColor = "orange" | "blue" | "pink" | "purple" | "green" | "red" | "cyan" | "yellow" | "indigo" | "teal" | "lime" | "rose" | "violet" | "amber" | "emerald" | "sky";

const ICONS = [
  { id: "orange" as IconColor, icon: Layout, label: "Orange Layout" },
  { id: "blue" as IconColor, icon: Square, label: "Blue Square" },
  { id: "pink" as IconColor, icon: Circle, label: "Pink Circle" },
  { id: "purple" as IconColor, icon: Triangle, label: "Purple Triangle" },
  { id: "green" as IconColor, icon: Hexagon, label: "Green Hexagon" },
  { id: "red" as IconColor, icon: Component, label: "Red Component" },
  { id: "cyan" as IconColor, icon: Box, label: "Cyan Box" },
  { id: "yellow" as IconColor, icon: Layers, label: "Yellow Layers" },
  { id: "indigo" as IconColor, icon: Star, label: "Indigo Star" },
  { id: "teal" as IconColor, icon: Heart, label: "Teal Heart" },
  { id: "lime" as IconColor, icon: Zap, label: "Lime Zap" },
  { id: "rose" as IconColor, icon: Flame, label: "Rose Flame" },
  { id: "violet" as IconColor, icon: Sparkles, label: "Violet Sparkles" },
  { id: "amber" as IconColor, icon: Target, label: "Amber Target" },
  { id: "emerald" as IconColor, icon: Award, label: "Emerald Award" },
  { id: "sky" as IconColor, icon: Bookmark, label: "Sky Bookmark" },
];

export const CreateBoardModal = ({ isOpen, onClose, onCreate, isLoading }: CreateBoardModalProps) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconColor>(ICONS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name, selectedIcon);
      setName("");
      setSelectedIcon(ICONS[0].id);
    }
  };

  const selectedIconData = ICONS.find(i => i.id === selectedIcon) || ICONS[0];
  const SelectedIconComponent = selectedIconData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Board Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter board name"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Icon & Color</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SelectedIconComponent size={20} style={{ color: getIconColor(selectedIcon) }} />
                    <span>{selectedIconData.label}</span>
                    <ChevronDown size={16} className="ml-2 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {ICONS.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => setSelectedIcon(item.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                          <IconComponent size={20} style={{ color: getIconColor(item.id) }} />
                          <span>{item.label}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function getIconColor(iconId: IconColor): string {
  const colors: Record<IconColor, string> = {
    orange: '#ff6b35',
    blue: '#4a90e2',
    pink: '#ff6b9d',
    purple: '#9b59b6',
    green: '#2ecc71',
    red: '#e74c3c',
    cyan: '#1abc9c',
    yellow: '#f39c12',
    indigo: '#6366f1',
    teal: '#14b8a6',
    lime: '#84cc16',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    emerald: '#10b981',
    sky: '#0ea5e9',
  };
  return colors[iconId];
}
