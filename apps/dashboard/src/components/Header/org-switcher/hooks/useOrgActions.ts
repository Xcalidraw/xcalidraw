import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { currentTeamAtom } from "../../../../store";

export const useOrgActions = () => {
  const queryClient = useQueryClient();
  const setCurrentTeam = useSetAtom(currentTeamAtom);
  const currentOrgId = localStorage.getItem("currentOrgId");

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === currentOrgId) return;

    localStorage.setItem("currentOrgId", orgId);

    // Reset current team so Sidebar picks up the new default
    setCurrentTeam({
      id: "",
      name: "",
      initials: "",
      colorClass: "",
    });

    // Invalidate queries to refresh data
    await queryClient.invalidateQueries();
    await queryClient.resetQueries();
  };

  const handleCreateOrg = () => {
    // TODO: Open create org modal
    console.log("Create organization");
  };

  return {
    handleSwitchOrg,
    handleCreateOrg,
    currentOrgId,
  };
};
