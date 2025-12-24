import { atom } from "../../app-jotai";
import { atomWithQuery, atomWithInfiniteQuery, atomWithMutation } from 'jotai-tanstack-query';
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
  createdAt: string; // NEW: For sorting
  updatedAt: string; // NEW: For sorting
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

// Pagination atom
export const boardsPaginationAtom = atom<{ limit: number; offset: number; total: number }>({
  limit: 50,
  offset: 0,
  total: 0,
});

// Infinite Query atom
export const boardsQueryAtom = atomWithInfiniteQuery((get) => {
  const context = get(boardsContextAtom);
  const client = getClient();
  const sortBy = get(sortByAtom);
  const search = get(searchQueryAtom);
  const pagination = get(boardsPaginationAtom);
  
  return {
    queryKey: ['boards', context.spaceId, context.teamId, sortBy, search, pagination.limit] as const,
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam as number) ?? 0;
      const params = {
        limit: pagination.limit,
        offset,
        sortBy,
        search
      };

      if (context.spaceId) {
        const response = await client.listBoardsInSpace({
          spaceId: context.spaceId,
          ...params
        });
        return response.data;
      } else if (context.teamId) {
        const response = await client.listBoardsInTeam({
          teamId: context.teamId,
          ...params
        });
        return response.data;
      }
      return { items: [], total: 0 };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      // Calculate next offset
      const nextOffset = allPages.length * pagination.limit;
      // If we've fetched all items, return undefined to stop
      if (nextOffset >= lastPage.total) return undefined;
      return nextOffset;
    },
    enabled: !!(context.spaceId || context.teamId),
    staleTime: 5000,
  };
});

// Local modifications atom (for starred state, etc.)
const boardsLocalModificationsAtom = atom<Record<string, Partial<Board>>>({});

// Helper for date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const dayStr = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '.');
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return `${dayStr} at ${timeStr}`;
};

// derived atom to map API data to UI format with local modifications
export const boardsAtom = atom(
  (get) => {
    const queryResult = get(boardsQueryAtom) as any;
    const context = get(boardsContextAtom);
    const localMods = get(boardsLocalModificationsAtom);
    
    // Check if we have pages
    if (!queryResult.data?.pages) return [];
    
    // Flatten pages into a single array
    const allItems = queryResult.data.pages.flatMap((page: any) => page.items || []);
    
    return allItems.map((board: any) => {
      const baseBoard = {
        id: board.board_id,
        name: board.title || "Untitled Board",
        modifiedBy: board.last_modified_by_name || board.created_by,
        modifiedDate: formatDate(board.updated_at),
        team: "Main Team",
        space: context.spaceName,
        parentType: context.spaceId ? 'SPACE' as const : 'TEAM' as const,
        lastOpened: formatDate(board.updated_at),
        owner: board.owner_name || board.created_by,
        icon: (board.thumbnail || "blue") as any,
        isStarred: false,
        createdAt: board.created_at,
        updatedAt: board.updated_at,
      };
      
      // Apply local modifications
      return localMods[board.board_id] 
        ? { ...baseBoard, ...localMods[board.board_id] }
        : baseBoard;
    });
  },
  (_get, set, update: Board[]) => {
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
  const queryResult = get(boardsQueryAtom) as any;
  return queryResult.isLoading || queryResult.isFetchingNextPage;
});

export const searchQueryAtom = atom<string>("");

export const filterBoardsAtom = atom<"all" | "starred">("all");
export const filterOwnerAtom = atom<"anyone" | "me">("anyone");
export const sortByAtom = atom<"last-opened" | "name" | "modified" | "created">("last-opened");
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
  // Search and Sort are now backend driven
  
  const filterBoards = get(filterBoardsAtom);
  
  // Only apply client-side filters for Starred
  const filtered = boards.filter((board: Board) => {
    const matchesFilter =
      filterBoards === "all" || (filterBoards === "starred" && board.isStarred);
    return matchesFilter;
  });

  return filtered;
});

export const toggleStarAtom = atom(null, (get, set, boardId: string) => {
  const boards = get(boardsAtom);
  const updatedBoards = boards.map((board: Board) =>
    board.id === boardId ? { ...board, isStarred: !board.isStarred } : board
  );
  set(boardsAtom, updatedBoards);
});

export const boardsTotalAtom = atom((get) => {
  const queryResult = get(boardsQueryAtom) as any;
  // Get total from the first page (it's consistent across pages)
  return queryResult.data?.pages?.[0]?.total || 0;
});

// Delete board mutation atom
export const deleteBoardMutationAtom = atomWithMutation(() => {
  const client = getClient();
  return {
    mutationKey: ['deleteBoard'],
    mutationFn: async (boardId: string) => {
      await client.deleteBoard({ boardId });
      return boardId;
    },
  };
});

// Delete space mutation atom  
export const deleteSpaceMutationAtom = atomWithMutation(() => {
  const client = getClient();
  return {
    mutationKey: ['deleteSpace'],
    mutationFn: async (spaceId: string) => {
      await client.deleteSpace({ spaceId });
      return spaceId;
    },
  };
});

// Create space mutation atom
export const createSpaceMutationAtom = atomWithMutation(() => {
  const client = getClient();
  return {
    mutationKey: ['createSpace'],
    mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
      const response = await client.createSpace(teamId, { name } as any);
      return response.data;
    },
  };
});
