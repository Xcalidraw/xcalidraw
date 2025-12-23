// API hooks stubs - will be connected to actual backend
import { useMutation, useQuery } from "@tanstack/react-query";

export const useListUserOrgsQuery = () => {
  return useQuery({
    queryKey: ["userOrgs"],
    queryFn: async () => ({
      items: [
        { org_id: "1", name: "My Organization" },
      ],
    }),
  });
};

export const useCreateBoardMutation = () => {
  return useMutation({
    mutationFn: async (_data: { title: string; teamId: string; spaceId?: string; thumbnail?: string }) => {
      // TODO: Implement actual board creation
      return { board_id: "new-board-" + Date.now() };
    },
  });
};

export const useSpaceQuery = (spaceId: string | undefined) => {
  return useQuery({
    queryKey: ["space", spaceId],
    queryFn: async () => ({
      space_id: spaceId,
      name: "Space " + spaceId,
      team_id: "1", // Mock team_id
    }),
    enabled: !!spaceId,
  });
};

export const useListTeamsQuery = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => ({
      items: [
        { team_id: "1", name: "Main Team" },
        { team_id: "2", name: "Development" },
      ],
    }),
  });
};

export const useOnboardingStatusQuery = () => {
  return useQuery({
    queryKey: ["onboardingStatus"],
    queryFn: async () => ({
      completed: true,
    }),
  });
};

export const useListUserOrgsQueryOptions = () => ({
  queryKey: ["userOrgs"],
  queryFn: async () => ({ items: [] }),
});
