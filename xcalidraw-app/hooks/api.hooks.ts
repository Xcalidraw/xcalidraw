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
