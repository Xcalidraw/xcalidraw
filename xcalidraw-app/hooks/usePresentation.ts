import { useState, useCallback, useEffect, useMemo } from "react";
import { getCommonBounds } from "@xcalidraw/element";
import { isFrameLikeElement } from "@xcalidraw/element";

import type { XcalidrawFrameLikeElement, XcalidrawElement } from "@xcalidraw/element/types";
import type { AppState } from "@xcalidraw/xcalidraw/types";

export interface PresentationState {
  isActive: boolean;
  currentSlideIndex: number;
  slides: XcalidrawFrameLikeElement[];
  totalSlides: number;
}

/**
 * Get frames sorted by position (top-left to bottom-right)
 */
export const getOrderedFrames = (
  elements: readonly XcalidrawElement[]
): XcalidrawFrameLikeElement[] => {
  const frames = elements.filter(
    (el): el is XcalidrawFrameLikeElement =>
      isFrameLikeElement(el) && !el.isDeleted
  );

  // Sort by y first (top to bottom), then by x (left to right)
  return frames.sort((a, b) => {
    const yDiff = a.y - b.y;
    // If y positions are close (within 50px), sort by x
    if (Math.abs(yDiff) < 50) {
      return a.x - b.x;
    }
    return yDiff;
  });
};

export interface UsePresentationOptions {
  elements: readonly XcalidrawElement[];
  onZoomToFrame?: (frame: XcalidrawFrameLikeElement) => void;
}

export const usePresentation = ({
  elements,
  onZoomToFrame,
}: UsePresentationOptions) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Get ordered frames
  const slides = useMemo(() => getOrderedFrames(elements), [elements]);
  const totalSlides = slides.length;

  // Navigate to a specific slide
  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        setCurrentSlideIndex(index);
        const frame = slides[index];
        if (frame && onZoomToFrame) {
          onZoomToFrame(frame);
        }
      }
    },
    [totalSlides, slides, onZoomToFrame]
  );

  // Navigation functions
  const nextSlide = useCallback(() => {
    goToSlide(Math.min(currentSlideIndex + 1, totalSlides - 1));
  }, [currentSlideIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(Math.max(currentSlideIndex - 1, 0));
  }, [currentSlideIndex, goToSlide]);

  const firstSlide = useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const lastSlide = useCallback(() => {
    goToSlide(totalSlides - 1);
  }, [totalSlides, goToSlide]);

  // Start presentation
  const startPresentation = useCallback(() => {
    if (totalSlides === 0) {
      return false;
    }
    setIsActive(true);
    setCurrentSlideIndex(0);
    // Enter fullscreen
    document.documentElement.requestFullscreen?.().catch(console.error);
    // Zoom to first frame
    const firstFrame = slides[0];
    if (firstFrame && onZoomToFrame) {
      onZoomToFrame(firstFrame);
    }
    return true;
  }, [totalSlides, slides, onZoomToFrame]);

  // Exit presentation
  const exitPresentation = useCallback(() => {
    setIsActive(false);
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(console.error);
    }
  }, []);

  // Listen for fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive) {
        setIsActive(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ": // Space
        case "PageDown":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prevSlide();
          break;
        case "Home":
          e.preventDefault();
          firstSlide();
          break;
        case "End":
          e.preventDefault();
          lastSlide();
          break;
        case "Escape":
          e.preventDefault();
          exitPresentation();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, nextSlide, prevSlide, firstSlide, lastSlide, exitPresentation]);

  return {
    isActive,
    currentSlideIndex,
    slides,
    totalSlides,
    currentSlide: slides[currentSlideIndex] || null,
    startPresentation,
    exitPresentation,
    nextSlide,
    prevSlide,
    goToSlide,
    firstSlide,
    lastSlide,
    hasSlides: totalSlides > 0,
    hasNextSlide: currentSlideIndex < totalSlides - 1,
    hasPrevSlide: currentSlideIndex > 0,
  };
};
