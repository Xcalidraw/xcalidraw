import { Provider, useAtom } from "../../app-jotai";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { Templates } from "./components/Templates/Templates";
import { BoardsTable } from "./components/BoardsTable/BoardsTable";
import { ForceTeamCreationModal } from "./ForceTeamCreationModal";
import { sidebarOpenAtom } from "./store";
import { useOnboardingStatusQuery } from "../../hooks/api.hooks";

import "./DashboardPage.scss";

const DashboardContent = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const { data: onboardingStatus, isLoading } = useOnboardingStatusQuery();

  const needsTeamSetup = !isLoading && 
    onboardingStatus && 
    !onboardingStatus.has_created_first_team;

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="xcalidraw dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Header />
          <div className="dashboard-content">
            <Templates />
            <BoardsTable />
          </div>
        </div>
      </div>

      {/* Force team creation modal for new users */}
      {needsTeamSetup && onboardingStatus.default_org_id && (
        <ForceTeamCreationModal 
          open={true} 
          orgId={onboardingStatus.default_org_id}
        />
      )}
    </>
  );
};

export const DashboardPage = () => {
  return (
    <Provider>
      <DashboardContent />
    </Provider>
  );
};
