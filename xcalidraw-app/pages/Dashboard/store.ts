import { atom } from "../../app-jotai";
import { atomWithQuery } from 'jotai-tanstack-query';
import { getClient } from '../../api/api-client';

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
  icon: string;
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

// Teams query atom
export const teamsQueryAtom = atomWithQuery(() => {
  const client = getClient();
  
  return {
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await client.listTeams();
      return response.data;
    },
  };
});

// Derived atom for teams with UI formatting
export const teamsAtom = atom((get) => {
  const queryResult = get(teamsQueryAtom);
  
  if (!queryResult.data?.items) return [];
  
  return queryResult.data.items.map((team: any, index: number) => ({
    id: team.team_id,
    name: team.name,
    initials: team.name.substring(0, 2).toUpperCase(),
    colorClass: ['color-teal', 'color-purple', 'color-orange'][index % 3]
  }));
});

// Workspaces/Spaces query atom
export const workspacesQueryAtom = atomWithQuery(() => {
  const client = getClient();
  
  return {
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await client.listSpaces();
      return response.data;
    },
  };
});

// Derived atom for your spaces
export const yourSpacesAtom = atom((get) => {
  const queryResult = get(workspacesQueryAtom);
  
  if (!queryResult.data?.items) return [];
  
  return queryResult.data.items.map((ws: any) => ({
    id: ws.space_id,
    name: ws.name,
  }));
});

// Context atom to store current teamId or spaceId
export interface BoardsContext {
  teamId?: string;
  spaceId?: string;
  spaceName?: string;
}

export const boardsContextAtom = atom<BoardsContext>({});

// Query atom that automatically fetches boards based on context
export const boardsQueryAtom = atomWithQuery((get) => {
  const context = get(boardsContextAtom);
  const client = getClient();
  
  return {
    queryKey: ['boards', context.spaceId, context.teamId],
    queryFn: async () => {
      if (context.spaceId) {
        const response = await client.listBoardsInSpace(context.spaceId);
        return response.data;
      } else if (context.teamId) {
        const response = await client.listBoardsInTeam(context.teamId);
        return response.data;
      }
      return { items: [] };
    },
    enabled: !!(context.spaceId || context.teamId),
  };
});

// Local modifications atom (for starred state, etc.)
const boardsLocalModificationsAtom = atom<Record<string, Partial<Board>>>({});

// Derived atom to map API data to UI format with local modifications
export const boardsAtom = atom(
  (get) => {
    const queryResult = get(boardsQueryAtom);
    const context = get(boardsContextAtom);
    const localMods = get(boardsLocalModificationsAtom);
    
    if (!queryResult.data?.items) return [];
    
    return queryResult.data.items.map((board: any) => {
      const baseBoard = {
        id: board.board_id,
        name: board.title || "Untitled Board",
        modifiedBy: board.created_by,
        modifiedDate: new Date(board.updated_at).toLocaleDateString(),
        team: "Main Team",
        space: context.spaceName,
        parentType: context.spaceId ? 'SPACE' as const : 'TEAM' as const,
        lastOpened: new Date(board.updated_at).toLocaleDateString(),
        owner: board.created_by,
        icon: (board.thumbnail || "blue") as any,
        isStarred: false,
      };
      
      // Apply local modifications
      return localMods[board.board_id] 
        ? { ...baseBoard, ...localMods[board.board_id] }
        : baseBoard;
    });
  },
  (get, set, update: Board[]) => {
    // Store local modifications
    const mods: Record<string, Partial<Board>> = {};
    update.forEach(board => {
      mods[board.id] = { isStarred: board.isStarred };
    });
    set(boardsLocalModificationsAtom, mods);
  }
);

// Loading state atom
export const boardsLoadingAtom = atom((get) => {
  const queryResult = get(boardsQueryAtom);
  return queryResult.isLoading;
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
