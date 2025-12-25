import {
  IconUser,
  IconCreditCard,
  IconSettings,
  IconShieldLock,
  IconHelp,
  IconLogout,
  IconBolt,
} from "@tabler/icons-react";
import { useGetUser } from "../../../hooks/auth.hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { Badge } from "../../ui/badge";
import { UserAvatar } from "./UserAvatar";
import { UserInfo } from "./UserInfo";
import { useUserActions } from "./hooks";

export const UserDropdown = () => {
  const { user } = useGetUser();
  const {
    navigateToProfile,
    navigateToSubscription,
    navigateToSettings,
    navigateToAdmin,
    handleLogout,
    openHelpCenter,
  } = useUserActions();

  const displayName = user?.name || user?.email || "Nadeem Ahmad";
  const displayEmail = user?.email || "nadeem@xcalidraw.com";
  const avatarUrl =
    user?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=087f5b&color=fff`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer group outline-none">
          <UserAvatar src={avatarUrl} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[280px]">
        <UserInfo name={displayName} email={displayEmail} avatarUrl={avatarUrl} />

        {/* Profile */}
        <DropdownMenuItem onClick={navigateToProfile} className="group">
          <IconUser className="w-5! h-5! text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
          <span className="flex-1 text-sm text-foreground">Profile</span>
        </DropdownMenuItem>

        {/* Subscription */}
        <DropdownMenuItem onClick={navigateToSubscription} className="group">
          <IconCreditCard className="w-5! h-5! text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
          <span className="flex-1 text-sm text-foreground">Subscription</span>
          <Badge
            variant="success"
            className="px-1 pr-2 gap-1 text-xs tracking-wide font-normal rounded-full shadow-none"
          >
            <IconBolt size={10} className="fill-current w-3! h-3! text-white" />
            <span>Pro</span>
          </Badge>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem onClick={navigateToSettings} className="group">
          <IconSettings className="w-5! h-5! text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
          <span className="flex-1 text-sm text-foreground">Settings</span>
        </DropdownMenuItem>

        {/* Admin Settings */}
        <DropdownMenuItem onClick={navigateToAdmin} className="group">
          <IconShieldLock className="w-5! h-5! text-muted-foreground group-focus:text-foreground group-hover:text-foreground shrink-0" />
          <span className="flex-1 text-sm text-foreground">Admin Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Help Center */}
        <DropdownMenuItem onClick={openHelpCenter} className="group">
          <IconHelp className="w-5! h-5! shrink-0" />
          <span className="flex-1 text-sm">Help Center</span>
        </DropdownMenuItem>

        {/* Logout */}
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <IconLogout className="w-5! h-5! shrink-0" />
          <span className="flex-1 text-sm">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
