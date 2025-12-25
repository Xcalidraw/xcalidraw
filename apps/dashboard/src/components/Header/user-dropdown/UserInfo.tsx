import { UserAvatar } from "./UserAvatar";

interface UserInfoProps {
  name: string;
  email: string;
  avatarUrl: string;
}

export const UserInfo = ({ name, email, avatarUrl }: UserInfoProps) => {
  return (
    <div className="flex items-center justify-between p-3 mb-1 border border-gray-100 rounded-xl">
      <div className="flex flex-col min-w-0 mr-2">
        <span className="font-semibold text-[15px] truncate text-foreground">
          {name}
        </span>
        <span className="text-xs text-muted-foreground truncate">{email}</span>
      </div>
      <UserAvatar src={avatarUrl} size="md" />
    </div>
  );
};
