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

// Onboarding hooks
export const useOnboardingStatusQuery = () => {
  const client = useClient();
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const response = await client.getUserOnboarding();
      return response.data
    },
    enabled: !!client,
    retry: false,  // Don't retry on failure
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
  });
};

export const useCompleteTeamSetupMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamName }: { teamName: string }) => {
      const response = await client.completeTeamSetup(undefined, {
        team_name: teamName,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Board movement hook
export const useMoveBoardMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orgId,
      boardId,
      targetType,
      targetId,
      teamId,
    }: {
      orgId: string;
      boardId: string;
      targetType: 'TEAM' | 'SPACE';
      targetId: string;
      teamId: string;
    }) => {
      const response = await client.moveBoard({
          boardId,
      },{
        target_id: targetId,
        target_type: targetType,
        team_id: teamId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Org upgrade hook
export const useUpgradeOrgMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId }: { orgId: string }) => {
      const response = await client.upgradeOrg(orgId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['USER'] });
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
};

// Team members hooks
export const useTeamMembersQuery = (orgId: string, teamId: string) => {
  const client = useClient();
  return useQuery({
    queryKey: ['team-members', orgId, teamId],
    queryFn: async () => {
      const response = await client.getTeam(orgId, teamId);
      return response.data;
    },
    enabled: !!client && !!orgId && !!teamId,
  });
};

export const useAddTeamMemberMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orgId,
      teamId,
      userId,
      role,
    }: {
      orgId: string;
      teamId: string;
      userId: string;
      role?: 'owner' | 'member';
    }) => {
      const response = await client.addTeamMember({
        teamId
      }, {
        user_id: userId,
        role,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.orgId, variables.teamId] });
    },
  });
};
