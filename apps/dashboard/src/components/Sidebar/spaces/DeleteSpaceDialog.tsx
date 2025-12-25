import { useAtom } from "jotai";
import { Trash2 } from "lucide-react";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Alert, AlertDescription } from "../../ui/alert";
import { deleteSpaceDialogAtom } from "../sidebar.store";
import { useSpaceActions } from "./hooks";

export const DeleteSpaceDialog = () => {
  const [spaceToDelete, setSpaceToDelete] = useAtom(deleteSpaceDialogAtom);
  const { handleDeleteSpace, isDeleting } = useSpaceActions();

  const handleClose = () => {
    setSpaceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!spaceToDelete) return;
    await handleDeleteSpace(spaceToDelete.id);
  };

  return (
    <Dialog open={!!spaceToDelete} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex-row gap-4 items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Delete Space</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{spaceToDelete?.name}"
              </span>
              ?
            </DialogDescription>
          </div>
        </DialogHeader>

        <Alert variant="warning" className="mt-2">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will permanently delete all boards within this space. This
            action cannot be undone.
          </AlertDescription>
        </Alert>

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
