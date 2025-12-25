import { useRef, useEffect } from "react";
import { Search, Command } from "lucide-react";
import { Input } from "../../ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        <Search
          size={16}
          strokeWidth={2}
          className="absolute left-3 text-muted-foreground pointer-events-none z-10"
        />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className="pl-9 pr-14 h-[38px] text-sm w-full bg-muted border-transparent!"
        />
        <div className="absolute right-2 flex items-center gap-0.5 text-[10px] px-1 py-0.5 bg-card rounded text-muted-foreground shadow-sm pointer-events-none z-10">
          <Command size={10} />K
        </div>
      </div>
    </div>
  );
};
