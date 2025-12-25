import { atom } from "jotai";

// ============================================================================
// Filter State Atoms
// ============================================================================

export type FilterByType = "all" | "recent" | "starred" | "archived";
export type OwnedByType = "anyone" | "me" | "others";

export const filterByAtom = atom<FilterByType>("all");
export const ownedByAtom = atom<OwnedByType>("anyone");

// ============================================================================
// Modal State Atoms
// ============================================================================

export const createModalOpenAtom = atom<boolean>(false);
export const deleteDialogAtom = atom<{ id: string; name: string } | null>(null);

// ============================================================================
// Filter Options (Static Data)
// ============================================================================

export const filterOptions = [
  { value: "all", label: "All boards" },
  { value: "recent", label: "Recent" },
  { value: "starred", label: "Starred" },
  { value: "archived", label: "Archived" },
] as const;

export const ownedByOptions = [
  { value: "anyone", label: "Owned by anyone" },
  { value: "me", label: "Owned by me" },
  { value: "others", label: "Owned by others" },
] as const;

export const sortOptions = [
  { value: "last-opened", label: "Last opened" },
  { value: "name", label: "Name" },
  { value: "modified", label: "Last modified" },
  { value: "created", label: "Date created" },
] as const;

// ============================================================================
// Board Icon Mapping
// ============================================================================

import {
  Layout,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Component,
  Box,
  Layers,
  Star,
  Heart,
  Zap,
  Flame,
  Sparkles,
  Target,
  Award,
  Bookmark,
  PenTool,
  User,
  Lightbulb,
  Sprout,
  File,
  MapPin,
  Search,
  Calendar,
  Coffee,
  Mail,
  BarChart,
  Share2,
  Shield,
  Clock,
  Folder,
  Rocket,
  Files,
  CheckCircle,
  Book,
  CreditCard,
  Compass,
  FlaskConical,
  PartyPopper,
  MessageCircle,
  GraduationCap,
  Globe,
  Calculator,
  MousePointer2,
  ClipboardList,
} from "lucide-react";

export const BOARD_ICON_MAP: Record<string, React.ElementType> = {
  // Geometric
  layout: Layout,
  orange: Layout,
  blue: Square,
  pink: Circle,
  purple: Triangle,
  green: Hexagon,
  red: Component,
  cyan: Box,
  yellow: Layers,

  // Status/Action
  indigo: Star,
  teal: Heart,
  lime: Zap,
  rose: Flame,
  violet: Sparkles,
  amber: Target,
  emerald: Award,
  sky: Bookmark,

  // New Icons
  pen: PenTool,
  user: User,
  bulb: Lightbulb,
  plant: Sprout,
  file: File,
  pin: MapPin,
  search: Search,
  calendar: Calendar,
  coffee: Coffee,
  mail: Mail,
  chart: BarChart,
  share: Share2,
  shield: Shield,
  clock: Clock,
  folder: Folder,
  rocket: Rocket,
  files: Files,
  check: CheckCircle,
  book: Book,
  card: CreditCard,
  compass: Compass,
  flask: FlaskConical,
  party: PartyPopper,
  message: MessageCircle,
  grad: GraduationCap,
  globe: Globe,
  calc: Calculator,
  cursor: MousePointer2,
  clip: ClipboardList,
};
