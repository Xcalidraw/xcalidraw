import { atom } from "jotai";

// ============================================================================
// Filter State
// ============================================================================

export const selectedRoleAtom = atom<string>("All roles");

// ============================================================================
// Static Data
// ============================================================================

export const roleOptions = [
  "All roles",
  "Engineering",
  "Product management",
  "Project management",
  "Design",
  "Agile Coach",
];

export const templateColors = [
  { bg: "bg-blue-50", accent: "bg-blue-400" },
  { bg: "bg-violet-50", accent: "bg-violet-400" },
  { bg: "bg-amber-50", accent: "bg-amber-400" },
  { bg: "bg-emerald-50", accent: "bg-emerald-400" },
  { bg: "bg-rose-50", accent: "bg-rose-400" },
  { bg: "bg-cyan-50", accent: "bg-cyan-400" },
];
