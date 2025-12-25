import { atom } from "jotai";

// ============================================================================
// Notifications State
// ============================================================================

export type NotificationTabType = "All" | "Unread";

export const notificationsOpenAtom = atom<boolean>(false);
export const activeNotificationTabAtom = atom<NotificationTabType>("All");

// ============================================================================
// Org Switcher State
// ============================================================================

export const orgSwitcherOpenAtom = atom<boolean>(false);

// ============================================================================
// User Dropdown State
// ============================================================================

export const userDropdownOpenAtom = atom<boolean>(false);

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: number;
  user: string;
  initials: string;
  bg: string;
  text: string;
  action: string;
  target: string;
  content: string;
  time: string;
  unread: boolean;
  type: "comment" | "generation" | "invite" | "like";
  iconColor: string;
  iconBg: string;
  Icon: React.ElementType;
}
