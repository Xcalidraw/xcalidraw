import { Provider, useAtom } from "../../app-jotai";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { Templates } from "./components/Templates/Templates";
import { BoardsTable } from "./components/BoardsTable/BoardsTable";
import { sidebarOpenAtom } from "./store";

import "./DashboardPage.scss";

const DashboardContent = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

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
