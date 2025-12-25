import { CreateNewAction } from "./create-new-action";
import { ExploreTemplates } from "./explore-templates";

interface BoardsTableHeaderProps {
  title: string;
  hideTemplatesBtn?: boolean;
}

export const BoardsTableHeader = ({
  title,
  hideTemplatesBtn = false,
}: BoardsTableHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3 max-md:mb-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-foreground m-0 max-md:text-lg max-sm:text-base">
          {title}
        </h2>
      </div>
      <div className="flex gap-3 flex-wrap max-sm:w-full max-sm:gap-2">
        <ExploreTemplates hidden={hideTemplatesBtn} />
        <CreateNewAction />
      </div>
    </div>
  );
};
