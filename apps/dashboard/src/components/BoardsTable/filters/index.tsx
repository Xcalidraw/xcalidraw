import { FilterBySelect } from "./FilterBySelect";
import { OwnedBySelect } from "./OwnedBySelect";
import { SortBySelect } from "./SortBySelect";

interface FiltersProps {
  disabled?: boolean;
}

export const Filters = ({ disabled }: FiltersProps) => {
  return (
    <div className="flex items-center gap-6 flex-wrap flex-1 max-md:gap-4 max-sm:gap-2 max-sm:min-w-0">
      <FilterBySelect disabled={disabled} />
      <OwnedBySelect disabled={disabled} />
      <SortBySelect disabled={disabled} />
    </div>
  );
};

export { FilterBySelect } from "./FilterBySelect";
export { OwnedBySelect } from "./OwnedBySelect";
export { SortBySelect } from "./SortBySelect";
