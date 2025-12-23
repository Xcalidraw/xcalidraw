import { Outlet } from "react-router-dom";
import { Provider, useAtom } from "jotai";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";
import { sidebarOpenAtom } from "../store";

const DashboardLayoutContent = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <>
      {sidebarOpen && (
        <div
          className="hidden md:hidden max-md:block fixed inset-0 bg-black/50 z-[999] animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div 
        id="dashboard-root" 
        className="flex min-h-screen bg-background font-sans max-md:flex-col"
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-muted max-md:h-screen max-md:overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto overflow-x-auto flex flex-col min-w-0 min-h-0 bg-white">
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
