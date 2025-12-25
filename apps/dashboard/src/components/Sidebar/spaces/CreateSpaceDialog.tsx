import { useState } from "react";
import { useAtom } from "jotai";
import { Hash, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Field, FieldLabel, FieldError } from "../../ui/field";
import { createSpaceDialogAtom } from "../sidebar.store";
import { useSpaceActions } from "./hooks";

export const CreateSpaceDialog = () => {
  const [isOpen, setIsOpen] = useAtom(createSpaceDialogAtom);
  const { handleCreateSpace, isCreating } = useSpaceActions();
  const [newSpaceName, setNewSpaceName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!newSpaceName.trim()) {
      setError("Space name cannot be empty");
      return;
    }
    setError("");
    try {
      await handleCreateSpace(newSpaceName);
      setNewSpaceName("");
    } catch {
      setError("Failed to create space. Please try again.");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setNewSpaceName("");
      setError("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Hash size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Create Space
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Organize related boards into a single project area.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-5">
          <Field>
            <FieldLabel htmlFor="space-name">Space Name</FieldLabel>
            <Input
              id="space-name"
              type="text"
              placeholder="e.g., Marketing Campaign, Product Roadmap..."
              value={newSpaceName}
              onChange={(e) => {
                setNewSpaceName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="h-11 px-4 border-gray-200 focus:border-primary focus:ring-primary/20"
              autoFocus
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isCreating}
              className="px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || !newSpaceName.trim()}
              className="px-5 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Space"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
