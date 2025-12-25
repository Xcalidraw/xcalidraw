import { atom } from "jotai";

// ============================================================================
// Navigation State
// ============================================================================

export type NavItemType = "home" | "recent" | "starred" | null;

export const activeNavItemAtom = atom<NavItemType>("home");
export const activeSpaceIdAtom = atom<string | null>(null);

// ============================================================================
// Dialog State
// ============================================================================

export const createSpaceDialogAtom = atom<boolean>(false);
export const deleteSpaceDialogAtom = atom<{ id: string; name: string } | null>(null);

// ============================================================================
// Team Selector State
// ============================================================================

export const teamDropdownOpenAtom = atom<boolean>(false);
export const teamSearchDialogOpenAtom = atom<boolean>(false);
