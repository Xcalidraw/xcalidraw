import clsx from "clsx";
import { KEYS } from "@xcalidraw/common";
import { ToolButton } from "./ToolButton";
import { laserPointerToolIcon } from "./icons";
import "./ToolIcon.scss";

type LaserPointerIconProps = {
  title?: string;
  name?: string;
  checked: boolean;
  onChange?(): void;
  isMobile?: boolean;
};

export const LaserPointerButton = (props: LaserPointerIconProps) => {
  return (
    <ToolButton
      className={clsx("Shape", { fillable: false, active: props.checked })}
      type="radio"
      icon={laserPointerToolIcon}
      name="editor-current-shape"
      checked={props.checked}
      title={`${props.title} — ${KEYS.K.toLocaleUpperCase()}`}
      aria-label={`${props.title} — ${KEYS.K.toLocaleUpperCase()}`}
      keyBindingLabel={!props.isMobile ? KEYS.K.toLocaleUpperCase() : undefined}
      aria-keyshortcuts={KEYS.K}
      data-testid="toolbar-laser"
      onChange={() => props.onChange?.()}
    />
  );
};
