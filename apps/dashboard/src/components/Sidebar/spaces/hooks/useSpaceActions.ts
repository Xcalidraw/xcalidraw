import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createSpaceDialogAtom,
  deleteSpaceDialogAtom,
  activeSpaceIdAtom,
  activeNavItemAtom,
} from "../../sidebar.store";
import {
  currentTeamAtom,
  deleteSpaceMutationAtom,
  createSpaceMutationAtom,
  workspacesQueryAtom,
} from "../../../../store";

export const useSpaceActions = () => {
  const navigate = useNavigate();
  const [currentTeam] = useAtom(currentTeamAtom);
  const [, setCreateDialogOpen] = useAtom(createSpaceDialogAtom);
  const [, setDeleteDialog] = useAtom(deleteSpaceDialogAtom);
  const [, setActiveSpaceId] = useAtom(activeSpaceIdAtom);
  const [, setActiveNavItem] = useAtom(activeNavItemAtom);
  const [{ mutateAsync: createSpace, isPending: isCreating }] = useAtom(createSpaceMutationAtom);
  const [{ mutateAsync: deleteSpace, isPending: isDeleting }] = useAtom(deleteSpaceMutationAtom);
  const [{ refetch: refetchWorkspaces }] = useAtom(workspacesQueryAtom) as any;

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateSpace = async (name: string) => {
    if (!name.trim()) {
      throw new Error("Space name cannot be empty");
    }
    try {
      await createSpace({ teamId: currentTeam.id, name });
      await refetchWorkspaces();
      setCreateDialogOpen(false);
      toast.success("Workspace created successfully");
    } catch (error) {
      toast.error("Failed to create workspace", {
        description: "Please try again later",
      });
      throw error;
    }
  };

  const handleOpenDeleteDialog = (space: { id: string; name: string }) => {
    setDeleteDialog(space);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(null);
  };

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      await deleteSpace(spaceId);
      await refetchWorkspaces();
      toast.success("Space deleted successfully");
      setDeleteDialog(null);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete space");
      setDeleteDialog(null);
      throw error;
    }
  };

  const handleNavigateToSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setActiveNavItem(null);
    navigate(`/dashboard/space/${spaceId}`);
  };

  return {
    // Create
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateSpace,
    isCreating,
    
    // Delete
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteSpace,
    isDeleting,
    
    // Navigation
    handleNavigateToSpace,
  };
};
