import { 
  IconUser, 
  IconCreditCard, 
  IconSettings, 
  IconShieldLock, 
  IconHelp, 
  IconLogout, 
  IconBolt
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useLogout, useGetUser } from "../../hooks/auth.hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

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

  const displayName = user?.name || user?.email || "Nadeem Ahmad";
  const displayEmail = user?.email || "nadeem@xcalidraw.com";
  // Fallback avatar
  const avatarUrl = user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=087f5b&color=fff`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer group outline-none">
          <div className="w-9 h-9 rounded-full p-[2px] bg-linear-to-tr from-[#fbbf24] via-[#ec4899] to-[#8b5cf6]">
            <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
               <img
                src={avatarUrl}
                alt="User"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="flex items-center justify-between p-3 mb-1 border border-gray-100 rounded-xl">
          <div className="flex flex-col min-w-0 mr-2">
            <span className="font-semibold text-[15px] truncate text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
          </div>
          <div className="w-10 h-10 rounded-full p-[2px] bg-linear-to-tr from-[#fbbf24] via-[#ec4899] to-[#8b5cf6] shrink-0">
             <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-full h-full object-cover rounded-full"
                />
             </div>
          </div>
        </div>

          {/* Profile */}
          <DropdownMenuItem onClick={() => navigate("/profile")} className="group">
            <IconUser className="!w-5 !h-5 text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
            <span className="flex-1 text-sm text-foreground">Profile</span>
          </DropdownMenuItem>
          
          {/* Subscription */}
          <DropdownMenuItem onClick={() => navigate("/subscription")} className="group">
            <IconCreditCard className="!w-5 !h-5 text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
            <span className="flex-1 text-sm text-foreground">Subscription</span>
            <Badge variant="success" className="px-1 pr-2 gap-1 text-xs tracking-wide font-normal rounded-full shadow-none">
              <IconBolt size={10} className="fill-current !w-3 !h-3 text-white" />
              <span>Pro</span>
            </Badge>
          </DropdownMenuItem>

          {/* Settings */}
          <DropdownMenuItem onClick={() => navigate("/settings")} className="group">
            <IconSettings className="!w-5 !h-5 text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
            <span className="flex-1 text-sm text-foreground">Settings</span>
          </DropdownMenuItem>
          
          {/* Admin Settings */}
          <DropdownMenuItem onClick={() => navigate("/admin")} className="group">
            <IconShieldLock className="!w-5 !h-5 text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
            <span className="flex-1 text-sm text-foreground">Admin Settings</span>
          </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Help Center */}
        <DropdownMenuItem onClick={() => {}} className="group">
          <IconHelp className="!w-5 !h-5 shrink-0" />
          <span className="flex-1 text-sm">Help Center</span>
        </DropdownMenuItem>
        
        {/* Logout */}
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <IconLogout className="!w-5 !h-5 shrink-0" />
          <span className="flex-1 text-sm">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
