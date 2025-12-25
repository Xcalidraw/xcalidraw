import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  createModalOpenAtom,
  deleteDialogAtom,
} from "../../boards-table.store";
import {
  toggleStarAtom,
  boardsQueryAtom,
  deleteBoardMutationAtom,
} from "../../../../store";
import { useCreateBoardMutation, useSpaceQuery, useListTeamsQuery } from "../../../../hooks/api.hooks";

export const useBoardActions = () => {
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();
  
  const [, setCreateModalOpen] = useAtom(createModalOpenAtom);
  const [, setDeleteDialog] = useAtom(deleteDialogAtom);
  const [, toggleStar] = useAtom(toggleStarAtom);
  const [{ mutateAsync: deleteBoard, isPending: isDeleting }] = useAtom(deleteBoardMutationAtom);
  const [{ refetch: refetchBoards }] = useAtom(boardsQueryAtom) as any;
  
  const createBoardMutation = useCreateBoardMutation();
  const { data: space } = useSpaceQuery(spaceId || "");
  const { data: teamsData } = useListTeamsQuery();

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreateBoard = async (name: string, icon: string) => {
    try {
      // Priority 1: Use space's team_id if we're in a space context
      let teamId = space?.team_id;

      // Priority 2: If no space (Dashboard), use user's first team
      if (!teamId && teamsData?.items && teamsData.items.length > 0) {
        teamId = teamsData.items[0].team_id;
      }

      // If still no teamId, we can't create a board
      if (!teamId) {
        console.error("No team context found for board creation");
        return;
      }

      const newBoard = await createBoardMutation.mutateAsync({
        title: name,
        teamId: teamId,
        spaceId: spaceId,
        thumbnail: icon,
      });

      setCreateModalOpen(false);
      navigate(`/board/${newBoard.board_id}`);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const handleOpenDeleteDialog = (board: { id: string; name: string }) => {
    setDeleteDialog(board);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(null);
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await deleteBoard(boardId);
      await refetchBoards();
      toast.success("Board deleted successfully");
      setDeleteDialog(null);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("You don't have permission to delete this board", {
          description: "Only the board owner can delete it.",
        });
      } else {
        toast.error("Failed to delete board");
      }
      setDeleteDialog(null);
    }
  };

  const handleToggleStar = (boardId: string) => {
    toggleStar(boardId);
  };

  const handleNavigateToBoard = (boardId: string) => {
    navigate(`/board/${boardId}`);
  };

  return {
    // Create
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateBoard,
    isCreating: createBoardMutation.isPending,
    
    // Delete
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteBoard,
    isDeleting,
    
    // Star
    handleToggleStar,
    
    // Navigation
    handleNavigateToBoard,
  };
};
