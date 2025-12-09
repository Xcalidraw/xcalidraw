import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../api/api-client';

export const useWorkspacesQuery = () => {
  const client = useClient();
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await client.listSpaces()
      
      return response.data;
    },
    enabled: !!client,
  });
};

export const useCreateWorkspaceMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
      const response = await client.createSpace(teamId, {
        name,
      } as any);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useSyncUserMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgName }: { orgName?: string }) => {
      const response = await client.syncUser(null, { orgName });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['USER'] });
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
    },
  });
};

export const useListUserOrgsQuery = () => {
  const client = useClient();
  return useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const response = await client.listUserOrgs();
      return response.data;
    },
    enabled: !!client,
  });
};

export const useListTeamsQuery = () => {
  const client = useClient();
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await client.listTeams();
      return response.data;
    },
    enabled: !!client,
  });
};
