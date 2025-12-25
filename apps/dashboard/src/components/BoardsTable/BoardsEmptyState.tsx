import { useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { EmptyState } from "../EmptyState/EmptyState";
import { createModalOpenAtom } from "./boards-table.store";

export const BoardsEmptyState = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [, setIsCreateModalOpen] = useAtom(createModalOpenAtom);

  return (
    <EmptyState
      title="No boards found"
      description={
        spaceId
          ? "This space doesn't have any boards yet. Create one to get started."
          : "You don't have any boards yet. Create one to get started."
      }
      actionLabel="Create board"
      onAction={() => setIsCreateModalOpen(true)}
    />
  );
};
