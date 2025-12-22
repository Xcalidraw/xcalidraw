// eslint-disable-next-line no-restricted-imports
import {
  atom,
  Provider,
  useAtom,
  useAtomValue,
  useSetAtom,
  createStore,
  type PrimitiveAtom,
} from "jotai";
import { useLayoutEffect } from "react";

export const appJotaiStore = createStore();

// Presentation mode state
export interface PresentationModeState {
  isActive: boolean;
  showBlackBackground: boolean;
  currentSlideIndex: number;
  totalSlides: number;
  // Navigation callbacks set by PresentationTrigger
  onNextSlide: (() => void) | null;
  onPrevSlide: (() => void) | null;
  onExit: (() => void) | null;
  onToggleBlackBackground: (() => void) | null;
  // Slide bounds in viewport coordinates (for masking)
  slideViewportBounds: { x: number; y: number; width: number; height: number } | null;
}

export const presentationModeAtom = atom<PresentationModeState>({
  isActive: false,
  showBlackBackground: false,
  currentSlideIndex: 0,
  totalSlides: 0,
  onNextSlide: null,
  onPrevSlide: null,
  onExit: null,
  onToggleBlackBackground: null,
  slideViewportBounds: null,
});

export { atom, Provider, useAtom, useAtomValue, useSetAtom };

export const useAtomWithInitialValue = <
  T extends unknown,
  A extends PrimitiveAtom<T>,
>(
  atom: A,
  initialValue: T | (() => T),
) => {
  const [value, setValue] = useAtom(atom);

  useLayoutEffect(() => {
    if (typeof initialValue === "function") {
      // @ts-ignore
      setValue(initialValue());
    } else {
      setValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, setValue] as const;
};
