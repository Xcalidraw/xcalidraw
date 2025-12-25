import { useAtom } from "jotai";
import { currentTeamAtom, teamsAtom } from "../../../../store";
import { teamSearchDialogOpenAtom } from "../../sidebar.store";

export const useTeamActions = () => {
  const [, setCurrentTeam] = useAtom(currentTeamAtom);
  const [, setTeamSearchOpen] = useAtom(teamSearchDialogOpenAtom);

  const handleSwitchTeam = (team: any) => {
    setCurrentTeam(team);
  };

  const handleOpenTeamSearch = () => {
    setTeamSearchOpen(true);
  };

  const handleCloseTeamSearch = () => {
    setTeamSearchOpen(false);
  };

  return {
    handleSwitchTeam,
    handleOpenTeamSearch,
    handleCloseTeamSearch,
  };
};
