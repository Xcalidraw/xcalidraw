import { Outlet } from "react-router-dom";
import { Provider, useAtom } from "../../app-jotai";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { sidebarOpenAtom } from "./store";
import "./DashboardPage.scss";

const DashboardLayoutContent = () => {
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
      <div id="dashboard-root" className="xcalidraw dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Header />
          <div className="dashboard-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export const DashboardLayout = () => {
  return (
    <Provider>
      <DashboardLayoutContent />
    </Provider>
  );
};
