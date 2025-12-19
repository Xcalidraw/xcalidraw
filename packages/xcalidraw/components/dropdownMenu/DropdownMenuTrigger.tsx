import clsx from "clsx";

import { useEditorInterface } from "../App";
import { Tooltip } from "../Tooltip";

const MenuTrigger = ({
  className = "",
  children,
  onToggle,
  title,
  ...rest
}: {
  className?: string;
  children: React.ReactNode;
  onToggle: () => void;
  title?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">) => {
  const editorInterface = useEditorInterface();
  const classNames = clsx(
    `dropdown-menu-button ${className}`,
    "zen-mode-transition",
    {
      "dropdown-menu-button--mobile": editorInterface.formFactor === "phone",
    },
  ).trim();
  return (
    <Tooltip label={title || ""} position="right">
      <button
        className={classNames}
        onClick={onToggle}
        type="button"
        data-testid="dropdown-menu-button"
        title={undefined}
        {...rest}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default MenuTrigger;
MenuTrigger.displayName = "DropdownMenuTrigger";
