import { Button } from "../../ui/button";
import { IconTemplate } from "@tabler/icons-react";

interface ExploreTemplatesProps {
  hidden?: boolean;
}

export const ExploreTemplates = ({ hidden }: ExploreTemplatesProps) => {
  if (hidden) return null;

  return (
    <Button
      variant="secondary"
      size="default"
      className="max-sm:hidden cursor-pointer"
    >
      <IconTemplate className="!w-3 !h-3" />
      <span>Explore templates</span>
    </Button>
  );
};
