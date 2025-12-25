import { useAtom } from "jotai";
import { Button } from "../../ui/button";
import { IconPlus } from "@tabler/icons-react";
import { createModalOpenAtom } from "../boards-table.store";

export const CreateNewAction = () => {
  const [, setIsOpen] = useAtom(createModalOpenAtom);

  return (
    <Button
      variant="default"
      size="default"
      onClick={() => setIsOpen(true)}
      className="max-sm:flex-1 cursor-pointer"
    >
      <IconPlus className="!w-3 !h-3" />
      <span>Create new</span>
    </Button>
  );
};
