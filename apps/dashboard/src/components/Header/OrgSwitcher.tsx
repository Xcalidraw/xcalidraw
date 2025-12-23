import React from "react";
import { IconCheck, IconSelector, IconBuildingCommunity, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useListUserOrgsQuery } from "../../hooks/api.hooks";
import { currentTeamAtom } from "../../store";

export const OrgSwitcher = () => {
  const { data: orgsData } = useListUserOrgsQuery();
  const queryClient = useQueryClient();
  const setCurrentTeam = useSetAtom(currentTeamAtom);
  const currentOrgId = localStorage.getItem("currentOrgId");

  const orgs = orgsData?.items || [];
  const currentOrg = orgs.find((org: any) => org.org_id === currentOrgId) || orgs[0];

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === currentOrgId) return;
    
    localStorage.setItem("currentOrgId", orgId);
    
    // Reset current team so Sidebar picks up the new default
    setCurrentTeam({
      id: "",
      name: "",
      initials: "",
      colorClass: ""
    });

    // Invalidate queries to refresh data
    await queryClient.invalidateQueries();
    await queryClient.resetQueries();
  };

  if (!currentOrg) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size='default' 
          className="bg-gray-50 hover:bg-gray-100 gap-2 px-1 font-normal transition-colors shadow-none cursor-pointer"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary">
            <IconBuildingCommunity size={16} />
          </div>
          <span className="text-sm max-w-[120px] truncate">
            {currentOrg.name}
          </span>
          <IconSelector size={16} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] p-2 rounded-2xl shadow-xl border-gray-300">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-2 uppercase tracking-wider">
          Organizations
        </DropdownMenuLabel>
        
        <div className="flex flex-col gap-1">
          {orgs.map((org: any) => (
            <DropdownMenuItem
              key={org.org_id}
              onClick={() => handleSwitchOrg(org.org_id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                 <IconBuildingCommunity className="!w-6 !h-6" />
              </div>
              
              <div className="flex-1 truncate flex flex-col items-start">
                  <span className="text-sm text-foreground">{org.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Plan Free</span>
              </div>

              {currentOrg.org_id === org.org_id && (
                <IconCheck size={18} className="text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2 bg-gray-200" />
        
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-gray-100 hover:bg-gray-100 cursor-pointer group text-muted-foreground hover:text-foreground">
          <div className="flex items-center justify-center w-8 h-8 rounded-md border border-dashed border-gray-300 group-hover:border-gray-400 transition-colors shrink-0">
            <IconPlus size={16} />
          </div>
          <span className="font-medium text-sm">Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
