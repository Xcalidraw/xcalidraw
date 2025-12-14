import { useState } from "react";
import {
  Layout, Square, Circle, Triangle, Hexagon, Component, Box, Layers,
  Star, Heart, Zap, Flame, Sparkles, Target, Award, Bookmark,
  PenTool, User, Lightbulb, Sprout, File, MapPin, Search, Calendar,
  Coffee, Mail, BarChart, Share2, Shield, Clock, Folder, Rocket,
  Files, CheckCircle, Book, CreditCard, Compass, FlaskConical,
  PartyPopper, MessageCircle, GraduationCap, Globe, Calculator,
  MousePointer2, ClipboardList
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import clsx from "clsx";
import "./CreateBoardModal.scss";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
  isLoading?: boolean;
}

// Keeping original colors for backward compatibility, adding new descriptive IDs
type IconType = 
  | "orange" | "blue" | "pink" | "purple" | "green" | "red" | "cyan" | "yellow" 
  | "indigo" | "teal" | "lime" | "rose" | "violet" | "amber" | "emerald" | "sky"
  | "pen" | "user" | "bulb" | "plant" | "file" | "pin" | "search" | "calendar"
  | "coffee" | "mail" | "chart" | "share" | "shield" | "clock" | "folder" | "rocket"
  | "files" | "check" | "book" | "card" | "compass" | "flask" | "party" | "message"
  | "grad" | "globe" | "calc" | "cursor" | "clip";

const ICONS = [
  // Original Geometric/Basic
  { id: "orange", icon: Layout, label: "Layout" },
  { id: "blue", icon: Square, label: "Square" },
  { id: "pink", icon: Circle, label: "Circle" },
  { id: "purple", icon: Triangle, label: "Triangle" },
  { id: "green", icon: Hexagon, label: "Hexagon" },
  { id: "red", icon: Component, label: "Component" },
  { id: "cyan", icon: Box, label: "Box" },
  { id: "yellow", icon: Layers, label: "Layers" },
  
  // Objects & Tools
  { id: "pen", icon: PenTool, label: "Pen" },
  { id: "bulb", icon: Lightbulb, label: "Idea" },
  { id: "user", icon: User, label: "User" },
  { id: "search", icon: Search, label: "Search" },
  { id: "folder", icon: Folder, label: "Folder" },
  { id: "file", icon: File, label: "File" },
  { id: "files", icon: Files, label: "Files" },
  { id: "clip", icon: ClipboardList, label: "Clipboard" },
  
  // Status & Action
  { id: "indigo", icon: Star, label: "Star" },
  { id: "teal", icon: Heart, label: "Heart" },
  { id: "lime", icon: Zap, label: "Zap" },
  { id: "violet", icon: Sparkles, label: "Sparkles" },
  { id: "rose", icon: Flame, label: "Flame" },
  { id: "amber", icon: Target, label: "Target" },
  { id: "emerald", icon: Award, label: "Award" },
  { id: "sky", icon: Bookmark, label: "Bookmark" },
  { id: "check", icon: CheckCircle, label: "Done" },
  { id: "party", icon: PartyPopper, label: "Party" },
  
  // Business & Productivity
  { id: "chart", icon: BarChart, label: "Chart" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "clock", icon: Clock, label: "Time" },
  { id: "mail", icon: Mail, label: "Mail" },
  { id: "message", icon: MessageCircle, label: "Message" },
  { id: "share", icon: Share2, label: "Share" },
  
  // Education & Science
  { id: "grad", icon: GraduationCap, label: "Learn" },
  { id: "book", icon: Book, label: "Book" },
  { id: "flask", icon: FlaskConical, label: "Lab" },
  { id: "plant", icon: Sprout, label: "Grow" },
  { id: "globe", icon: Globe, label: "Global" },
  
  // Misc
  { id: "rocket", icon: Rocket, label: "Launch" },
  { id: "shield", icon: Shield, label: "Secure" },
  { id: "pin", icon: MapPin, label: "Locate" },
  { id: "card", icon: CreditCard, label: "Finance" },
  { id: "calc", icon: Calculator, label: "Calc" },
  { id: "compass", icon: Compass, label: "Nav" },
  { id: "coffee", icon: Coffee, label: "Break" },
  { id: "cursor", icon: MousePointer2, label: "Select" },
];

export const CreateBoardModal = ({ isOpen, onClose, onCreate, isLoading }: CreateBoardModalProps) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>(ICONS[0].id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await onCreate(name, selectedIcon);
      setName("");
      setSelectedIcon(ICONS[0].id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="create-board-dialog-content">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter board name"
              autoFocus
            />
          </div>
          
          <div className="icon-selection-section">
            <Label>Select Thumbnail</Label>
            <div className="icons-grid-container">
              {ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIcon(item.id)}
                    className={clsx("icon-option", { selected: isSelected })}
                    title={item.label}
                  >
                    <IconComponent 
                      size={24} 
                      className={`icon-text-${item.id}`}
                      style={{ color: getIconColor(item.id) }} 
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="dialog-footer">
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
// ... (getIconColor remains the same)

// Expanded color palette matching the icons
function getIconColor(iconId: string): string {
  const colors: Record<string, string> = {
    // Original colors
    orange: '#ff6b35', blue: '#4a90e2', pink: '#ff6b9d', purple: '#9b59b6',
    green: '#2ecc71', red: '#e74c3c', cyan: '#1abc9c', yellow: '#f39c12',
    indigo: '#6366f1', teal: '#14b8a6', lime: '#84cc16', rose: '#f43f5e',
    violet: '#8b5cf6', amber: '#f59e0b', emerald: '#10b981', sky: '#0ea5e9',
    
    // New icon mappings (assigned harmonizing colors)
    pen: '#f43f5e',      // Rose/Pink
    user: '#8b5cf6',     // Violet/Purple
    bulb: '#f59e0b',     // Amber/Yellow
    plant: '#2ecc71',    // Green
    file: '#0ea5e9',     // Sky/Blue
    pin: '#e74c3c',      // Red
    search: '#f59e0b',   // Amber
    calendar: '#10b981', // Emerald
    coffee: '#795548',   // Brown (custom)
    mail: '#22c55e',     // Green
    chart: '#10b981',    // Emerald
    share: '#f97316',    // Orange
    shield: '#8b5cf6',   // Violet
    clock: '#14b8a6',    // Teal
    folder: '#f59e0b',   // Amber
    rocket: '#0ea5e9',   // Sky
    files: '#64748b',    // Slate
    check: '#22c55e',    // Green
    book: '#0ea5e9',     // Sky
    card: '#22c55e',     // Green
    compass: '#6366f1',  // Indigo
    flask: '#ec4899',    // Pink
    party: '#8b5cf6',    // Violet
    message: '#0ea5e9',  // Sky
    grad: '#10b981',     // Emerald
    globe: '#3b82f6',    // Blue
    calc: '#22c55e',     // Green 
    cursor: '#eab308',   // Yellow
    clip: '#14b8a6',     // Teal
  };
  return colors[iconId] || '#64748b'; // Fallback to Slate
}
