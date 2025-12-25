import { Logo } from "./Logo";
import { InviteMembersButton } from "./InviteMembersButton";
import { NotificationsDropdown } from "./notifications";
import { OrgSwitcher } from "./org-switcher";
import { UserDropdown } from "./user-dropdown";
import { HeaderDivider } from "./shared";

export const Header = () => {
  return (
    <div className="h-16 px-4 flex items-center justify-center bg-white border-b border-border">
      <div className="w-full flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <InviteMembersButton />
          <NotificationsDropdown />
          <HeaderDivider />
          <OrgSwitcher />
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};
