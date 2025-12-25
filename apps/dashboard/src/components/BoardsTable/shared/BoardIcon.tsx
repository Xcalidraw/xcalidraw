import { Layout } from "lucide-react";
import { BOARD_ICON_MAP } from "../boards-table.store";

interface BoardIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const BoardIcon = ({ icon, size = 16, className }: BoardIconProps) => {
  const IconComponent = BOARD_ICON_MAP[icon] || Layout;
  return <IconComponent size={size} className={className} />;
};

export const getBoardIconComponent = (icon: string): React.ElementType => {
  return BOARD_ICON_MAP[icon] || Layout;
};
