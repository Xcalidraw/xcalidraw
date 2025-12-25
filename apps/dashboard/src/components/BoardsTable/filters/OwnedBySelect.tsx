import { useAtom } from "jotai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { ownedByAtom, ownedByOptions, OwnedByType } from "../boards-table.store";
import { useFilterActions } from "./hooks";

interface OwnedBySelectProps {
  disabled?: boolean;
}

export const OwnedBySelect = ({ disabled }: OwnedBySelectProps) => {
  const [ownedBy] = useAtom(ownedByAtom);
  const { handleOwnerChange } = useFilterActions();

  return (
    <div className="flex items-center gap-2 text-[13px]">
      <Select
        value={ownedBy}
        onValueChange={(val) => handleOwnerChange(val as OwnedByType)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[160px] h-8 text-[13px] cursor-pointer">
          <SelectValue placeholder="Owned by anyone" />
        </SelectTrigger>
        <SelectContent>
          {ownedByOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
