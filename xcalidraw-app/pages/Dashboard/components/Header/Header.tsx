import React from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { useAtom } from "jotai";

import { Button } from "@shadcn/components/ui/button";
import { sidebarOpenAtom } from "../../store";

import { UserDropdown } from "./UserDropdown";
import { OrgSwitcher } from "./OrgSwitcher";
import "./Header.scss";

export const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="xcalidraw-logo">Xcalidraw</span>
        </div>

        {/* Right Side Actions */}
        <div className="header-right">
          <Button variant='secondary' size="default">
            <User size={16} />
            <span>Invite members</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Search size={20} />
          </Button>

          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>

          <div className="h-6 w-px bg-border mx-2" /> {/* Divider */}
          
          <OrgSwitcher />
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};
