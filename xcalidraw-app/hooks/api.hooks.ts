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

export const useListUserOrgsQuery = (options?: { enabled?: boolean }) => {
  const client = useClient();
  return useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const response = await client.listUserOrgs();
      return response.data;
    },
    enabled: !!client && (options?.enabled ?? true),
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
export const useOnboardingStatusQuery = (options?: { enabled?: boolean }) => {
  const client = useClient();
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      const response = await client.getUserOnboarding();
      return response.data
    },
    enabled: !!client && (options?.enabled ?? true),
    retry: false
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

// New onboarding hooks
export const useCheckOnboardingQuery = () => {
  const client = useClient();
  return useQuery({
    queryKey: ['onboarding-check'],
    queryFn: async () => {
      const response = await client.checkOnboarding();
      return response.data;
    },
    enabled: !!client,
    retry: false,
  });
};

export const useOnboardMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await client.onboardUser();
      return response.data;
    },
    onSuccess: () => {
      // Only invalidate onboarding checks - let the dashboard load orgs/teams naturally
      queryClient.invalidateQueries({ queryKey: ['onboarding-check'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
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
      }, {
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
