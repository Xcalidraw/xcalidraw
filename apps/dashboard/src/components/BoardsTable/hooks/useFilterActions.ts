import { useAtom } from "jotai";
import {
  filterByAtom,
  ownedByAtom,
  FilterByType,
  OwnedByType,
} from "../boards-table.store";
import { sortByAtom } from "../../../store";

export const useFilterActions = () => {
  const [, setFilterBy] = useAtom(filterByAtom);
  const [, setOwnedBy] = useAtom(ownedByAtom);
  const [, setSortBy] = useAtom(sortByAtom);

  const handleFilterChange = (value: FilterByType) => {
    setFilterBy(value);
  };

  const handleOwnerChange = (value: OwnedByType) => {
    setOwnedBy(value);
  };

  const handleSortChange = (value: "last-opened" | "name" | "modified" | "created") => {
    setSortBy(value);
  };

  const resetFilters = () => {
    setFilterBy("all");
    setOwnedBy("anyone");
    setSortBy("last-opened");
  };

  return {
    handleFilterChange,
    handleOwnerChange,
    handleSortChange,
    resetFilters,
  };
};
