import { Provider } from "../../app-jotai";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { Templates } from "./components/Templates/Templates";
import { BoardsTable } from "./components/BoardsTable/BoardsTable";

import "./DashboardPage.scss";

export const DashboardPage = () => {
  return (
    <Provider>
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
    </Provider>
  );
};
