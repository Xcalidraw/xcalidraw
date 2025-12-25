import { useAtom } from "jotai";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { deleteDialogAtom } from "../boards-table.store";
import { useBoardActions } from "../hooks";

export const DeleteBoardDialog = () => {
  const [boardToDelete, setBoardToDelete] = useAtom(deleteDialogAtom);
  const { handleDeleteBoard, isDeleting } = useBoardActions();

  const handleClose = () => {
    setBoardToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!boardToDelete) return;
    await handleDeleteBoard(boardToDelete.id);
  };

  return (
    <Dialog open={!!boardToDelete} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="flex-row gap-4 items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{boardToDelete?.name}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="gap-1.5"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
