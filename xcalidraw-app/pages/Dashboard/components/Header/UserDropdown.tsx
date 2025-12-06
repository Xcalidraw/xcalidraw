import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useLogout, useGetUser } from "../../../../hooks/auth.hooks";
import "./UserDropdown.scss";

export const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const logout = useLogout();
  const { user } = useGetUser();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth/login");
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName = user?.name || user?.email || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=087f5b&color=fff`;

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <div 
        className={clsx("user-avatar", { active: isOpen })} 
        onClick={toggleDropdown}
      >
        <img
          src={avatarUrl}
          alt="User"
        />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <span className="user-name" title={displayName}>{displayName}</span>
            {displayName !== displayEmail && (
              <span className="user-email" title={displayEmail}>{displayEmail}</span>
            )}
          </div>
          <div className="dropdown-divider" />
          <button className="dropdown-item" onClick={() => navigate("/profile")}>
            <User size={16} />
            <span>Profile</span>
          </button>
          <button className="dropdown-item" onClick={() => navigate("/settings")}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <div className="dropdown-divider" />
          <button className="dropdown-item text-red" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
