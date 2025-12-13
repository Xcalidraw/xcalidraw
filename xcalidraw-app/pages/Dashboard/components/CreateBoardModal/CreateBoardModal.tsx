import { useState } from "react";
import { Layout, Square, Circle, Triangle, Hexagon, Component, Box, Layers, Grid } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
  isLoading?: boolean;
}

const ICONS = [
  { id: "orange", icon: Layout, label: "Orange Layout" },
  { id: "blue", icon: Square, label: "Blue Square" },
  { id: "pink", icon: Circle, label: "Pink Circle" },
  { id: "purple", icon: Triangle, label: "Purple Triangle" },
  { id: "green", icon: Hexagon, label: "Green Hexagon" },
  // Additional icons if needed
  { id: "red", icon: Component, label: "Red Component" },
  { id: "cyan", icon: Box, label: "Cyan Box" },
  { id: "yellow", icon: Layers, label: "Yellow Layers" },
];

export const CreateBoardModal = ({ isOpen, onClose, onCreate, isLoading }: CreateBoardModalProps) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name, selectedIcon);
      setName("");
      setSelectedIcon(ICONS[0].id);
    }
  };

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
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {ICONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item.id)}
                      className={`flex aspect-square items-center justify-center rounded-md border-2 transition-all hover:bg-muted ${
                        selectedIcon === item.id
                          ? "border-primary bg-accent"
                          : "border-transparent bg-muted/50"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`h-6 w-6 text-${item.id}-500`} />
                    </button>
                  );
                })}
              </div>
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
