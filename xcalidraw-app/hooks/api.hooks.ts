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

export const useSpaceQuery = (spaceId: string) => {
  const client = useClient();
  return useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const response = await client.getSpace(spaceId);
      return response.data;
    },
    enabled: !!client && !!spaceId,
  });
};

export const useListBoardsQuery = (params?: { spaceId?: string; teamId?: string }) => {
  const client = useClient();
  const spaceId = params?.spaceId;
  const teamId = params?.teamId;
  
  return useQuery({
    queryKey: ['boards', spaceId, teamId],
    queryFn: async () => {
      if (spaceId) {
        // List boards in a specific space
        const response = await client.listBoardsInSpace(spaceId);
        return response.data;
      } else if (teamId) {
        // List boards in a team (team-level boards)
        const response = await client.listBoardsInTeam(teamId);
        return response.data;
      } else {
        // Fallback to listing all boards
        const response = await client.listBoards();
        return response.data;
      }
    },
    enabled: !!client && (!!spaceId || !!teamId),
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

export const useCreateBoardMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      teamId,
      spaceId,
      thumbnail
    }: {
      title: string;
      teamId: string;
      spaceId?: string;
      thumbnail?: string;
    }) => {
      const response = await client.createBoard(null, {
        title,
        team_id: teamId,
        space_id: spaceId,
        thumbnail
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

export const useBoardQuery = (boardId?: string) => {
  const client = useClient();
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      if (!boardId) return null;
      const response = await client.getBoard(boardId);
      return response.data;
    },
    enabled: !!client && !!boardId,
  });
};

export const useUpdateBoardMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      elements,
      appState,
      thumbnail
    }: {
      boardId: string;
      elements?: any[];
      appState?: any;
      thumbnail?: string;
    }) => {
      // Note: Backend currently might only support elements. passing appState just in case or for future support.
      // We map appState name to title if present.
      const payload: any = {
          elements,
          thumbnail
      };
      if (appState?.name) {
          payload.title = appState.name;
      }
      
      const response = await client.updateBoard(boardId, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
       // Update the specific board's cache with the new data to prevent stale cache
       // We use setQueryData instead of invalidateQueries to avoid refetching while editing
       queryClient.setQueryData(['board', variables.boardId], (oldData: any) => {
         if (!oldData) return data;
         
         return {
           ...oldData,
           elements: variables.elements ?? oldData.elements,
           title: variables.appState?.name ?? oldData.title,
         };
       });
       // Also invalidate the boards list to update thumbnails, titles, etc.
       queryClient.invalidateQueries({ queryKey: ['boards'] });
     },
  });
};

// Delete board mutation
export const useDeleteBoardMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: string) => {
      await client.deleteBoard({ boardId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Delete space mutation (cascade deletes all boards in the space)
export const useDeleteSpaceMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spaceId: string) => {
      await client.deleteSpace({ spaceId });
    },
    onSuccess: () => {
      // Invalidate both boards and workspaces since cascade delete affects both
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

// ============================================================================
// COMMENTS HOOKS
// ============================================================================

export interface Comment {
  comment_id: string;
  board_id: string;
  thread_id: string;
  parent_id: string | null;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  x: number;
  y: number;
  resolved: boolean;
  label_color?: 'green' | 'orange' | 'red' | 'gray';  // Color label (green is default)
  created_at: string;
  updated_at: string;
}

export interface CommentThread {
  root: Comment;
  replies: Comment[];
}

export const useCommentsQuery = (boardId?: string) => {
  const client = useClient();
  return useQuery({
    queryKey: ['comments', boardId],
    queryFn: async () => {
      if (!boardId) return { threads: [] };
      const response = await client.listComments({ boardId });
      return response.data as { threads: CommentThread[] };
    },
    enabled: !!client && !!boardId,
    // Cache for 30 seconds to prevent refetch during panning (when component remounts)
    staleTime: 30000,
  });
};

export const useCreateCommentMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      content,
      x,
      y,
      parentId,
    }: {
      boardId: string;
      content: string;
      x?: number;
      y?: number;
      parentId?: string;
    }) => {
      const response = await client.createComment(
        { boardId },
        {
          content,
          x,
          y,
          parent_id: parentId,
        }
      );
      return response.data as Comment;
    },
    // Optimistic update for replies
    onMutate: async (variables) => {
      // Only optimistically update for replies (when parentId exists)
      if (!variables.parentId) return;
      
      await queryClient.cancelQueries({ queryKey: ['comments', variables.boardId] });
      const previousData = queryClient.getQueryData(['comments', variables.boardId]);
      
      // Create optimistic comment
      const optimisticReply: Comment = {
        comment_id: `temp-${Date.now()}`,
        board_id: variables.boardId,
        thread_id: variables.parentId,
        content: variables.content,
        parent_id: variables.parentId,
        author_id: 'current-user',
        author_name: 'You',
        author_avatar: '',
        x: 0,
        y: 0,
        resolved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['comments', variables.boardId], (old: { threads: CommentThread[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          threads: old.threads.map(thread =>
            thread.root.comment_id === variables.parentId
              ? { ...thread, replies: [...thread.replies, optimisticReply] }
              : thread
          ),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', variables.boardId], context.previousData);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.boardId] });
    },
  });
};

export const useUpdateCommentMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      commentId,
      content,
    }: {
      boardId: string;
      commentId: string;
      content: string;
    }) => {
      const response = await client.updateComment(
        { boardId, commentId },
        { content }
      );
      return response.data as Comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.boardId] });
    },
  });
};

export const useDeleteCommentMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      commentId,
    }: {
      boardId: string;
      commentId: string;
    }) => {
      await client.deleteComment({ boardId, commentId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.boardId] });
    },
  });
};

export const useResolveCommentMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      commentId,
      resolved,
    }: {
      boardId: string;
      commentId: string;
      resolved: boolean;
    }) => {
      const response = await client.resolveComment(
        { boardId, commentId },
        { resolved }
      );
      return response.data as Comment;
    },
    // Optimistic update - update UI immediately
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', variables.boardId] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['comments', variables.boardId]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['comments', variables.boardId], (old: { threads: CommentThread[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          threads: old.threads.map(thread =>
            thread.root.comment_id === variables.commentId
              ? { ...thread, root: { ...thread.root, resolved: variables.resolved } }
              : thread
          ),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['comments', variables.boardId], context.previousData);
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ['comments', variables.boardId] });
    },
  });
};

export const useLabelCommentMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      commentId,
      labelColor,
    }: {
      boardId: string;
      commentId: string;
      labelColor: Comment['label_color'];
    }) => {
      const response = await client.labelComment(
        { boardId, commentId },
        { label_color: labelColor }
      );
      return response.data as Comment;
    },
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['comments', variables.boardId] });
      const previousData = queryClient.getQueryData(['comments', variables.boardId]);
      
      queryClient.setQueryData(['comments', variables.boardId], (old: { threads: CommentThread[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          threads: old.threads.map(thread =>
            thread.root.comment_id === variables.commentId
              ? { ...thread, root: { ...thread.root, label_color: variables.labelColor } }
              : thread
          ),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', variables.boardId], context.previousData);
      }
    },
  });
};

export const useMoveCommentMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      commentId,
      x,
      y,
    }: {
      boardId: string;
      commentId: string;
      x: number;
      y: number;
    }) => {
      // Use existing updateComment API
      const response = await client.updateComment(
        { boardId, commentId },
        { x, y }
      );
      return response.data as Comment;
    },
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['comments', variables.boardId] });
      const previousData = queryClient.getQueryData(['comments', variables.boardId]);
      
      queryClient.setQueryData(['comments', variables.boardId], (old: { threads: CommentThread[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          threads: old.threads.map(thread =>
            thread.root.comment_id === variables.commentId
              ? { 
                  ...thread, 
                  root: { ...thread.root, x: variables.x, y: variables.y },
                  // Also update all replies with same position
                  replies: thread.replies.map(r => ({ ...r, x: variables.x, y: variables.y }))
                }
              : thread
          ),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', variables.boardId], context.previousData);
      }
    },
  });
};
// ============================================================================
// FILES HOOKS
// ============================================================================

export const useUploadFileMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      fileId,
      contentType,
    }: {
      boardId: string;
      fileId: string;
      contentType: string;
    }) => {
      const response = await client.getUploadUrl(
        { boardId },
        { fileId, contentType }
      );
      return response.data;
    },
  });
};

export const useGetFileUrlQuery = (boardId: string, fileId: string | null) => {
  const client = useClient();
  return useQuery({
    queryKey: ['file', boardId, fileId],
    queryFn: async () => {
      if (!fileId) return null;
      const response = await client.getFileUrl({ boardId, fileId });
      return response.data;
    },
    enabled: !!client && !!boardId && !!fileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBatchGetFileUrlsMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      fileIds,
    }: {
      boardId: string;
      fileIds: string[];
    }) => {
      const response = await client.getBatchFileUrls(
        { boardId },
        { fileIds }
      );
      return response.data;
    },
  });
};

// ============================================================================
// BOARD SHARE HOOKS
// ============================================================================

export const useShareBoardMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      boardId,
      email,
    }: {
      boardId: string;
      email: string;
    }) => {
      // client.shareBoard will be available after regeneration
      const response = await client.shareBoard(
        { boardId },
        { email }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-members', variables.boardId] });
    },
  });
};

export const useBoardMembersQuery = (boardId?: string) => {
  const client = useClient();
  return useQuery({
    queryKey: ['board-members', boardId],
    queryFn: async () => {
        if (!boardId) return [];
      const response = await client.listBoardMembers({ boardId });
      return response.data.items;
    },
    enabled: !!client && !!boardId,
  });
};
