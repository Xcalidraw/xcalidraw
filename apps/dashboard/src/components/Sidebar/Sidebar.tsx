import { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useLocation, matchPath } from "react-router-dom";
import { TooltipProvider } from "../ui/tooltip";
import { sidebarOpenAtom, teamsQueryAtom } from "../../store";
import { activeNavItemAtom, activeSpaceIdAtom } from "./sidebar.store";
import { Navigation } from "./navigation";
import { SearchInput } from "./search";
import { SpacesHeader, SpacesList, CreateSpaceDialog, DeleteSpaceDialog } from "./spaces";
import { TeamSelectorDropdown, TeamSearchDialog } from "./team-selector";
import { SidebarTeamTriggerSkeleton } from "./SidebarTeamTriggerSkeleton";

export const Sidebar = () => {
  const [sidebarOpen] = useAtom(sidebarOpenAtom);
  const [, setActiveNavItem] = useAtom(activeNavItemAtom);
  const [, setActiveSpaceId] = useAtom(activeSpaceIdAtom);
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();

  const teamsQueryResult = useAtomValue(teamsQueryAtom);
  const isTeamsLoading = teamsQueryResult.isLoading;

  // Sync active state with URL
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      setActiveNavItem("home");
      setActiveSpaceId(null);
    } else {
      const spaceMatch = matchPath("/dashboard/space/:spaceId", pathname);
      if (spaceMatch && spaceMatch.params.spaceId) {
        setActiveSpaceId(spaceMatch.params.spaceId);
        setActiveNavItem(null);
      }
    }
  }, [location.pathname, setActiveNavItem, setActiveSpaceId]);

  return (
    <aside
      className={`w-68 h-dvh flex flex-col flex-shrink-0 bg-card border-r border-border text-foreground font-sans select-none p-2.5 pt-2.5 pb-0 gap-3
      max-md:fixed max-md:left-0 max-md:top-0 max-md:z-[1000] max-md:-translate-x-full max-md:transition-transform max-md:duration-300 max-md:shadow-lg
      ${sidebarOpen ? "max-md:translate-x-0" : ""}`}
    >
      {/* 1. Team Selector */}
      <header>
        {isTeamsLoading ? <SidebarTeamTriggerSkeleton /> : <TeamSelectorDropdown />}
      </header>

      {/* 2. Search Input */}
      <SearchInput value={searchValue} onChange={setSearchValue} />

      <TooltipProvider>
        {/* 3. Main Navigation */}
        <Navigation />

        <div className="w-full h-px bg-border/50 my-3" />

        {/* 4. Spaces */}
        <div className="flex-1 flex flex-col relative min-h-0">
          <SpacesHeader />
          <SpacesList />
        </div>
      </TooltipProvider>

      {/* Dialogs */}
      <CreateSpaceDialog />
      <DeleteSpaceDialog />
      <TeamSearchDialog />
    </aside>
  );
};
