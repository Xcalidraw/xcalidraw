import { useAtom } from "jotai";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { viewModeAtom } from "../../store";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

export const ViewModeTabs = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  return (
    <Tabs
      value={viewMode}
      onValueChange={(val) => setViewMode(val as "grid" | "list")}
      className="shrink-0"
    >
      <TabsList className="h-9 p-0.5">
        <TabsTrigger
          value="grid"
          className="px-2 h-8 data-[state=active]:shadow-sm cursor-pointer"
        >
          <IconLayoutGrid size={18} />
        </TabsTrigger>
        <TabsTrigger
          value="list"
          className="px-2 h-8 data-[state=active]:shadow-sm cursor-pointer"
        >
          <IconList size={18} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
