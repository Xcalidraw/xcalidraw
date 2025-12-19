import React, { useEffect } from "react";

import "./Tooltip.scss";

export const getTooltipDiv = () => {
  const existingDiv =
    document.querySelector<HTMLDivElement>(".xcalidraw-tooltip");
  if (existingDiv) {
    return existingDiv;
  }
  const div = document.createElement("div");
  document.body.appendChild(div);
  div.classList.add("xcalidraw-tooltip");
  return div;
};

export const updateTooltipPosition = (
  tooltip: HTMLDivElement,
  item: {
    left: number;
    top: number;
    width: number;
    height: number;
  },
  position: "bottom" | "top" | "right" = "bottom",
) => {
  const tooltipRect = tooltip.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const margin = 5;

  let left: number;
  let top: number;

  if (position === "right") {
    left = item.left + item.width + margin;
    top = item.top + item.height / 2 - tooltipRect.height / 2;

    if (left + tooltipRect.width >= viewportWidth) {
      left = item.left - tooltipRect.width - margin;
    }
    if (top < 0) {
      top = margin;
    } else if (top + tooltipRect.height >= viewportHeight) {
      top = viewportHeight - tooltipRect.height - margin;
    }
  } else {
    left = item.left + item.width / 2 - tooltipRect.width / 2;
    if (left < 0) {
      left = margin;
    } else if (left + tooltipRect.width >= viewportWidth) {
      left = viewportWidth - tooltipRect.width - margin;
    }

    if (position === "bottom") {
      top = item.top + item.height + margin;
      if (top + tooltipRect.height >= viewportHeight) {
        top = item.top - tooltipRect.height - margin;
      }
    } else {
      top = item.top - tooltipRect.height - margin;
      if (top < 0) {
        top = item.top + item.height + margin;
      }
    }
  }

  Object.assign(tooltip.style, {
    top: `${top}px`,
    left: `${left}px`,
  });
};

const updateTooltip = (
  item: HTMLDivElement,
  tooltip: HTMLDivElement,
  label: string,
  position: "bottom" | "top" | "right",
) => {
  tooltip.classList.add("xcalidraw-tooltip--visible");

  tooltip.textContent = label;

  const itemRect = item.getBoundingClientRect();
  updateTooltipPosition(tooltip, itemRect, position);
};

type TooltipProps = {
  children: React.ReactNode;
  label: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  position?: "bottom" | "top" | "right";
};

export const Tooltip = ({
  children,
  label,
  style,
  disabled,
  position = "bottom",
}: TooltipProps) => {
  useEffect(() => {
    return () => getTooltipDiv().classList.remove("xcalidraw-tooltip--visible");
  }, []);
  if (disabled) {
    return null;
  }
  return (
    <div
      className="xcalidraw-tooltip-wrapper"
      onPointerEnter={(event) =>
        updateTooltip(
          event.currentTarget as HTMLDivElement,
          getTooltipDiv(),
          label,
          position,
        )
      }
      onPointerLeave={() =>
        getTooltipDiv().classList.remove("xcalidraw-tooltip--visible")
      }
      style={style}
    >
      {children}
    </div>
  );
};
