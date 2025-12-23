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
} from "@shadcn/components/ui/dropdown-menu";

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
        <div className="cursor-pointer w-8 h-8 rounded-full overflow-hidden ring-offset-2 data-open:ring-2 data-open:ring-primary">
          <img
            src={avatarUrl}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 py-2">
          <span className="text-base font-semibold text-gray-900">{displayName}</span>
          {displayName !== displayEmail && (
            <span className="text-xs font-normal text-muted-foreground">{displayEmail}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")} className="px-3 py-2 gap-3">
          <User size={18} />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")} className="px-3 py-2 gap-3">
          <Settings size={18} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="px-3 py-2.5 gap-3" onClick={handleLogout} variant='destructive'>
          <LogOut size={18} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
