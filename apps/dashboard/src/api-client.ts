// API Client stub - will be connected to actual backend
// For now, returns mock data for development

interface ApiClient {
  listTeams: () => Promise<{ data: { items: any[] } }>;
  listSpaces: () => Promise<{ data: { items: any[] } }>;
  listBoardsInSpace: (params: any) => Promise<{ data: { items: any[]; total: number } }>;
  listBoardsInTeam: (params: any) => Promise<{ data: { items: any[]; total: number } }>;
  deleteBoard: (params: { boardId: string }) => Promise<void>;
  deleteSpace: (params: { spaceId: string }) => Promise<void>;
  createSpace: (teamId: string, data: { name: string }) => Promise<{ data: any }>;
}

const mockClient: ApiClient = {
  listTeams: async () => ({
    data: {
      items: [
        { team_id: "1", name: "Main Team" },
        { team_id: "2", name: "Development" },
      ]
    }
  }),
  
  listSpaces: async () => ({
    data: {
      items: [
        { space_id: "1", name: "Design Space" },
        { space_id: "2", name: "Engineering" },
      ]
    }
  }),
  
  listBoardsInSpace: async () => ({
    data: {
      items: [
        {
          board_id: "1",
          title: "Project Overview",
          created_by: "John Doe",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          thumbnail: "blue",
        },
      ],
      total: 1
    }
  }),
  
  listBoardsInTeam: async () => ({
    data: {
      items: [
        {
          board_id: "1",
          title: "Team Whiteboard",
          created_by: "Jane Smith",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          thumbnail: "green",
        },
        {
          board_id: "2",
          title: "Sprint Planning",
          created_by: "John Doe",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          thumbnail: "purple",
        },
      ],
      total: 2
    }
  }),
  
  deleteBoard: async () => {},
  deleteSpace: async () => {},
  createSpace: async (_teamId, data) => ({ data: { space_id: "new", name: data.name } }),
};

export const getClient = (): ApiClient => mockClient;
