import { Star } from "lucide-react";
import clsx from "clsx";

interface StarButtonProps {
  isStarred: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  variant?: "table" | "gallery";
}

export const StarButton = ({
  isStarred,
  onClick,
  size = 18,
  variant = "table",
}: StarButtonProps) => {
  const baseClasses = "cursor-pointer transition-colors";
  
  const variantClasses = {
    table: "text-muted-foreground p-1 box-content rounded hover:text-foreground hover:bg-muted",
    gallery: "text-muted-foreground p-1.5 box-content rounded-md bg-white shadow-sm hover:text-foreground hover:bg-muted",
  };

  return (
    <Star
      size={variant === "gallery" ? 14 : size}
      className={clsx(baseClasses, variantClasses[variant], {
        "text-yellow-400 fill-yellow-400 opacity-100": isStarred,
      })}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    />
  );
};
