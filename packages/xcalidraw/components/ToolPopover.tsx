import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";

import { capitalizeString } from "@xcalidraw/common";

import * as Popover from "@radix-ui/react-popover";

import { trackEvent } from "../analytics";

import { ToolButton } from "./ToolButton";

import "./ToolPopover.scss";

import { useXcalidrawContainer } from "./App";

import type { AppClassProperties } from "../types";

type ToolOption = {
  type: string;
  icon: React.ReactNode;
  title?: string;
};

type ToolPopoverProps = {
  app: AppClassProperties;
  options: readonly ToolOption[];
  activeTool: { type: string };
  defaultOption: string;
  className?: string;
  namePrefix: string;
  title: string;
  "data-testid": string;
  onToolChange: (type: string) => void;
  displayedOption: ToolOption;
  fillable?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  suppressActiveState?: boolean;
  triggerIcon?: React.ReactNode;
  horizontal?: boolean;
};

export const ToolPopover = ({
  app,
  options,
  activeTool,
  defaultOption,
  className = "Shape",
  namePrefix,
  title,
  "data-testid": dataTestId,
  onToolChange,
  displayedOption,
  fillable = false,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  suppressActiveState = false,
  triggerIcon,
  horizontal = false,
}: ToolPopoverProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = useCallback(
    (open: boolean) => {
      if (controlledOnOpenChange) {
        controlledOnOpenChange(open);
      }
      if (!isControlled) {
        setInternalIsOpen(open);
      }
    },
    [controlledOnOpenChange, isControlled],
  );

  const currentType = activeTool.type;
  const isActive = displayedOption.type === currentType;
  const SIDE_OFFSET = 32 / 2 + 10;
  const { container } = useXcalidrawContainer();

  // if currentType is not in options, close popup
  if (!options.some((o) => o.type === currentType) && isOpen) {
    setIsOpen(false);
  }

  // Close popover when user starts interacting with the canvas (pointer down)
  useEffect(() => {
    const unsubscribe = app.onPointerDownEmitter.on(() => {
      setIsOpen(false);
    });
    return () => unsubscribe?.();
  }, [app, setIsOpen]);

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger asChild>
        <ToolButton
          className={clsx(className, {
            fillable,
            active:
              !suppressActiveState &&
              options.some((o) => o.type === activeTool.type),
          })}
          type="radio"
          icon={triggerIcon || displayedOption.icon}
          checked={isActive && !suppressActiveState}
          name="editor-current-shape"
          title={title}
          aria-label={title}
          data-testid={dataTestId}
          onPointerDown={() => {
            setIsOpen(!isOpen);
            onToolChange(defaultOption);
          }}
        />
      </Popover.Trigger>

      <Popover.Content
        className={clsx("tool-popover-content", {
          "tool-popover-content--horizontal": horizontal,
        })}
        side={horizontal ? "top" : "right"}
        align="center"
        sideOffset={SIDE_OFFSET}
        collisionBoundary={container ?? undefined}
      >
        {options.map(({ type, icon, title }) => (
          <ToolButton
            className={clsx(className, {
              active: currentType === type,
            })}
            key={type}
            type="radio"
            icon={icon}
            checked={currentType === type}
            name={`${namePrefix}-option`}
            title={title || capitalizeString(type)}
            keyBindingLabel=""
            aria-label={title || capitalizeString(type)}
            data-testid={`toolbar-${type}`}
            onChange={() => {
              if (app.state.activeTool.type !== type) {
                trackEvent("toolbar", type, "ui");
              }
              app.setActiveTool({ type: type as any });
              onToolChange?.(type);
            }}
          />
        ))}
      </Popover.Content>
    </Popover.Root>
  );
};
