import { useAtom } from "jotai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { filterByAtom, filterOptions, FilterByType } from "../boards-table.store";
import { useFilterActions } from "../hooks";

interface FilterBySelectProps {
  disabled?: boolean;
}

export const FilterBySelect = ({ disabled }: FilterBySelectProps) => {
  const [filterBy] = useAtom(filterByAtom);
  const { handleFilterChange } = useFilterActions();

  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-muted-foreground whitespace-nowrap max-sm:hidden">Filter by</span>
      <Select
        value={filterBy}
        onValueChange={(val) => handleFilterChange(val as FilterByType)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] h-8 text-[13px] cursor-pointer">
          <SelectValue placeholder="All boards" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
