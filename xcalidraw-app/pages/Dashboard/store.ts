import { atom } from "../../app-jotai";

// Types
export interface Board {
  id: string;
  name: string;
  modifiedBy: string;
  modifiedDate: string;
  team: string;              // NEW: Always know the parent team
  space?: string;            // UPDATED: Now optional
  parentType: 'TEAM' | 'SPACE'; // NEW: Track where board lives
  lastOpened: string;
  owner: string;
  icon: "orange" | "blue" | "pink" | "purple" | "green";
  isStarred: boolean;
}

export interface Space {
  id: string;
  name: string;
  isArchived?: boolean;
}

export interface Team {
  id: string;
  name: string;
  initials: string;
  colorClass: string;
  isDefault?: boolean;       // NEW: For solo user's default team
  canDelete?: boolean;       // NEW: Solo users can't delete default team
}

// Atoms
export const currentTeamAtom = atom<Team>({
  id: "",
  name: "",
  initials: "",
  colorClass: "",
});

export const searchQueryAtom = atom<string>("");

export const filterBoardsAtom = atom<"all" | "starred">("all");
export const filterOwnerAtom = atom<"anyone" | "me">("anyone");
export const sortByAtom = atom<"lastOpened" | "name" | "created">("lastOpened");
export const viewModeAtom = atom<"grid" | "list">("list");

export const yourSpacesExpandedAtom = atom<boolean>(true);
export const spacesExpandedAtom = atom<boolean>(true);
export const createWorkspaceModalOpenAtom = atom<boolean>(false);
export const sidebarOpenAtom = atom<boolean>(false);

export const yourSpacesAtom = atom<Space[]>([]);

export const spacesAtom = atom<Space[]>([
  { id: "2", name: "[archiv] Consumer Domain", isArchived: true },
  { id: "3", name: "[archived] eTrusted Domain", isArchived: true },
  { id: "4", name: "[archived] TPS Advertising & ...", isArchived: true },
  { id: "5", name: "Admin Chapter Platform Ops" },
  { id: "6", name: "Agile Toolbox" },
  { id: "7", name: "Architecture Group" },
  { id: "8", name: "Architecture Team" },
  { id: "9", name: "Booking and Billing" },
  { id: "10", name: "Business Domain" },
]);

export const boardsAtom = atom<Board[]>([
  {
    id: "1",
    name: "trstd login User Flow",
    modifiedBy: "Oliver Wehrens",
    modifiedDate: "Jul 21",
    team: "design-team",
    space: "CoT Switch Gate",
    parentType: 'SPACE',
    lastOpened: "Today",
    owner: "Oliver Wehrens",
    icon: "orange",
    isStarred: false,
  },
  {
    id: "2",
    name: "Architecture Redefined",
    modifiedBy: "nadeem.ahmad",
    modifiedDate: "Today",
    team: "engineering-team",
    space: "CoT Switch Gate",
    parentType: 'SPACE',
    lastOpened: "Today",
    owner: "nadeem.ahmad",
    icon: "blue",
    isStarred: false,
  },
  {
    id: "3",
    name: "Tech Radar - Board Meeting",
    modifiedBy: "Leo",
    modifiedDate: "Nov 17",
    team: "engineering-team",
    space: undefined,
    parentType: 'TEAM',
    lastOpened: "Nov 25",
    owner: "Leo",
    icon: "pink",
    isStarred: false,
  },
  {
    id: "4",
    name: "xDRG - Delivery Review",
    modifiedBy: "Justyna Stanowska",
    modifiedDate: "Jan 19",
    team: "leadership-team",
    space: "CoT Switch Gate",
    parentType: 'SPACE',
    lastOpened: "Jan 20",
    owner: "Justyna Stanowska",
    icon: "purple",
    isStarred: false,
  },
  {
    id: "5",
    name: "New Board",
    modifiedBy: "Niklas Hanft",
    modifiedDate: "Dec 5",
    team: "design-team",
    space: undefined,
    parentType: 'TEAM',
    lastOpened: "Dec 5",
    owner: "Niklas Hanft",
    icon: "green",
    isStarred: true,
  },
  {
    id: "6",
    name: "Retro trstd login until nxt25",
    modifiedBy: "Cara",
    modifiedDate: "Nov 10",
    team: "engineering-team",
    space: "TPS TRSTD Login",
    parentType: 'SPACE',
    lastOpened: "Nov 10",
    owner: "Marieke Schaefer",
    icon: "orange",
    isStarred: false,
  },
  {
    id: "7",
    name: "Secret hiding brainstorming",
    modifiedBy: "Selim",
    modifiedDate: "Nov 11",
    team: "design-team",
    space: undefined,
    parentType: 'TEAM',
    lastOpened: "Nov 8",
    owner: "Selim",
    icon: "purple",
    isStarred: false,
  },
]);

export const templatesAtom = atom([
  { id: "blank", name: "Blank board", image: null },
  { id: "scrum", name: "Scrum Workspace", image: "scrum" },
  { id: "ai", name: "AI Initiative Planning", image: "ai" },
  { id: "technical", name: "Technical Solution Desi...", image: "technical" },
  { id: "flowchart", name: "Flowchart", image: "flowchart" },
  { id: "mindmap", name: "Mind Map", image: "mindmap" },
  { id: "kanban", name: "Kanban Framework", image: "kanban" },
  { id: "miroverse", name: "From Miroverse →", image: "miroverse" },
]);

// Derived atoms
export const filteredBoardsAtom = atom((get) => {
  const boards = get(boardsAtom);
  const searchQuery = get(searchQueryAtom).toLowerCase();
  const filterBoards = get(filterBoardsAtom);

  return boards.filter((board) => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery);
    const matchesFilter =
      filterBoards === "all" || (filterBoards === "starred" && board.isStarred);
    return matchesSearch && matchesFilter;
  });
});

export const toggleStarAtom = atom(null, (get, set, boardId: string) => {
  const boards = get(boardsAtom);
  const updatedBoards = boards.map((board) =>
    board.id === boardId ? { ...board, isStarred: !board.isStarred } : board
  );
  set(boardsAtom, updatedBoards);
});
