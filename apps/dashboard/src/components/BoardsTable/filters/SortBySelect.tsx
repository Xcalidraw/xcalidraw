import { useAtom } from "jotai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { sortOptions } from "../boards-table.store";
import { sortByAtom } from "../../../store";
import { useFilterActions } from "./hooks";

interface SortBySelectProps {
  disabled?: boolean;
}

export const SortBySelect = ({ disabled }: SortBySelectProps) => {
  const [sortBy] = useAtom(sortByAtom);
  const { handleSortChange } = useFilterActions();

  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-muted-foreground whitespace-nowrap max-sm:hidden">Sort by</span>
      <Select
        value={sortBy}
        onValueChange={(val) => handleSortChange(val as any)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] h-8 text-[13px] cursor-pointer">
          <SelectValue placeholder="Last opened" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
