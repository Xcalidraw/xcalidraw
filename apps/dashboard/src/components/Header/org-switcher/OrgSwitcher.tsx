import { IconBuildingCommunity, IconSelector } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { useListUserOrgsQuery } from "../../../hooks/api.hooks";
import { OrgItem } from "./OrgItem";
import { CreateOrgAction } from "./CreateOrgAction";
import { useOrgActions } from "./hooks";

export const OrgSwitcher = () => {
  const { data: orgsData } = useListUserOrgsQuery();
  const { handleSwitchOrg, handleCreateOrg, currentOrgId } = useOrgActions();

  const orgs = orgsData?.items || [];
  const currentOrg =
    orgs.find((org: any) => org.org_id === currentOrgId) || orgs[0];

  if (!currentOrg) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="default"
          className="bg-gray-50 hover:bg-gray-100 gap-2 px-2! font-normal transition-colors shadow-none cursor-pointer"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary">
            <IconBuildingCommunity size={16} />
          </div>
          <span className="text-sm max-w-[120px] truncate">{currentOrg.name}</span>
          <IconSelector size={16} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-2 uppercase tracking-wider">
          Organizations
        </DropdownMenuLabel>

        <div className="flex flex-col gap-1">
          {orgs.map((org: any) => (
            <OrgItem
              key={org.org_id}
              org={org}
              isSelected={currentOrg.org_id === org.org_id}
              onSelect={handleSwitchOrg}
            />
          ))}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <CreateOrgAction onClick={handleCreateOrg} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
