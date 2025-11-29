import { useEffect, useRef, useState } from "react";

import type { AppClassProperties } from "../types";

const DEBOUNCE_DELAY = 150;

type CanvasState = {
  isStable: boolean;
  scrollX: number;
  scrollY: number;
  zoom: number;
};

/**
 * Hook to detect when the canvas is being panned or zoomed.
 * Returns isStable (false during movement, true when stopped) and current scroll/zoom values.
 */
export const useCanvasMoving = (app: AppClassProperties): CanvasState => {
  const [state, setState] = useState<CanvasState>(() => ({
    isStable: true,
    scrollX: app.state.scrollX,
    scrollY: app.state.scrollY,
    zoom: app.state.zoom.value,
  }));

  const prevRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const timerRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const stableRef = useRef(true);

  useEffect(() => {
    const tick = () => {
      const { scrollX, scrollY, zoom } = app.state;
      const prev = prevRef.current;

      if (!prev) {
        prevRef.current = { x: scrollX, y: scrollY, z: zoom.value };
      } else if (
        prev.x !== scrollX ||
        prev.y !== scrollY ||
        prev.z !== zoom.value
      ) {
        // Movement detected - hide immediately
        if (stableRef.current) {
          setState((s) => ({ ...s, isStable: false }));
          stableRef.current = false;
        }

        // Reset debounce timer
        clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          // Update with final position when movement stops
          setState({
            isStable: true,
            scrollX: app.state.scrollX,
            scrollY: app.state.scrollY,
            zoom: app.state.zoom.value,
          });
          stableRef.current = true;
        }, DEBOUNCE_DELAY);

        prevRef.current = { x: scrollX, y: scrollY, z: zoom.value };
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [app]);

  return state;
};
