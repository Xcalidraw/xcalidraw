import { Filters } from "./filters";
import { ViewModeTabs } from "./ViewModeTabs";

interface BoardsTableControlsProps {
  isFiltersDisabled?: boolean;
}

export const BoardsTableControls = ({
  isFiltersDisabled = false,
}: BoardsTableControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-4 max-md:gap-3 max-sm:mb-3">
      <Filters disabled={isFiltersDisabled} />
      <ViewModeTabs />
    </div>
  );
};
