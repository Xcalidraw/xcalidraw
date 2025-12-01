import React from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { useAtom } from "jotai";

import { Button } from "../../../../components/ui/button";
import { sidebarOpenAtom } from "../../store";

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
          <Button variant="outline" size="default">
            <User size={16} />
            <span>Invite members</span>
          </Button>

          <button className="header-icon-btn">
            <Search size={20} />
          </button>

          <button className="header-icon-btn">
            <Bell size={20} />
          </button>

          <div className="user-avatar">
            <img
              src="https://ui-avatars.com/api/?name=Nadeem+Ahmad&background=random"
              alt="User"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
