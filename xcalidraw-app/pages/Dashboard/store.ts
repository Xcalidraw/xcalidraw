import { atom } from "../../app-jotai";

// Types
export interface Board {
  id: string;
  name: string;
  modifiedBy: string;
  modifiedDate: string;
  space?: string;
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
}

// Atoms
export const currentTeamAtom = atom<Team>({
  id: "1",
  name: "TPS Board",
  initials: "TB",
  colorClass: "color-teal",
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
    space: "CoT Switch Gate",
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
    space: "CoT Switch Gate",
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
    space: undefined,
    lastOpened: "Nov 25",
    owner: "Leo",
    icon: "pink",
    isStarred: false,
  },
  {
    id: "4",
    name: "Discovery Workshop: Integration Experience",
    modifiedBy: "Sascha Jan Born",
    modifiedDate: "Nov 21",
    space: undefined,
    lastOpened: "Nov 21",
    owner: "Sascha Jan Born",
    icon: "blue",
    isStarred: false,
  },
  {
    id: "5",
    name: "trstd login architecture",
    modifiedBy: "Selim",
    modifiedDate: "Nov 24",
    space: "CoT Switch Gate",
    lastOpened: "Nov 18",
    owner: "Selim",
    icon: "pink",
    isStarred: false,
  },
  {
    id: "6",
    name: "Retro trstd login until nxt25",
    modifiedBy: "Cara",
    modifiedDate: "Nov 10",
    space: "TPS TRSTD Login",
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
    space: undefined,
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
