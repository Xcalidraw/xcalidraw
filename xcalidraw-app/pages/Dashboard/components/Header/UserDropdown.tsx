import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogout, useGetUser } from "../../../../hooks/auth.hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";

export const UserDropdown = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const { user } = useGetUser();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth/login");
      },
    });
  };

  const displayName = user?.name || user?.email || "User";
  const displayEmail = user?.email || "";
  const avatarUrl = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=087f5b&color=fff`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="user-avatar" style={{ cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden" }}>
          <img
            src={avatarUrl}
            alt="User"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="user-dropdown-content">
        <DropdownMenuLabel className="dropdown-header" style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "8px 12px" }}>
          <span style={{ fontWeight: 500, fontSize: "14px", color: "var(--color-on-surface)" }}>{displayName}</span>
          {displayName !== displayEmail && (
            <span style={{ fontSize: "12px", color: "var(--color-muted-darker)", fontWeight: 400 }}>{displayEmail}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User size={16} />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings size={16} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red" onClick={handleLogout} style={{ color: "#ef4444" }}>
          <LogOut size={16} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
