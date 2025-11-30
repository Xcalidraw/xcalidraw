import React from "react";
import { Bell, Search, User } from "lucide-react";

import "./Header.scss";

export const Header = () => {
  return (
    <div className="dashboard-header">
      <div className="header-content">
        {/* Placeholder for symmetry or left-aligned items if needed */}
        <div className="header-left"></div>

        {/* Right Side Actions */}
        <div className="header-right">
          <button className="header-btn invite-btn">
            <User size={16} className="icon-plus" />
            <span>Invite members</span>
          </button>

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
