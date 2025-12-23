import React from "react";
import { Check, ChevronDown, Building2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shadcn/components/ui/dropdown-menu";
import { Button } from "@shadcn/components/ui/button";
import { useListUserOrgsQuery } from "../../../../hooks/api.hooks";
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
          size="sm" 
          className="org-switcher-trigger gap-2 px-2 font-normal hover:bg-[var(--color-surface-high)] hover:text-[var(--color-on-surface)]"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary">
            <Building2 size={12} />
          </div>
          <span className="text-sm font-medium max-w-[120px] truncate">
            {currentOrg.name}
          </span>
          <ChevronDown size={14} className="text-muted-foreground opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          Organizations
        </DropdownMenuLabel>
        {orgs.map((org: any) => (
          <DropdownMenuItem
            key={org.org_id}
            onClick={() => handleSwitchOrg(org.org_id)}
            className="flex items-center cursor-pointer px-3 py-2 gap-3"
          >
            <div className="flex items-center justify-center">
              {currentOrg.org_id === org.org_id && (
                <Check size={14} className="text-primary" />
              )}
            </div>
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer whitespace-nowrap px-3 py-2 gap-3">
          <Plus size={14} />
          Add another account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
