import React from "react";
import { useAtomValue } from "../app-jotai";
import { presentationModeAtom } from "../app-jotai";
import { PresentationControls } from "./PresentationControls";

import "./PresentationOverlay.scss";

/**
 * PresentationOverlay - Renders outside of Xcalidraw component
 * to avoid being hidden by the presentation mode CSS.
 */
export const PresentationOverlay: React.FC = () => {
  const presentationMode = useAtomValue(presentationModeAtom);
  
  if (!presentationMode.isActive) {
    return null;
  }

  const {
    showBlackBackground,
    slideViewportBounds,
    currentSlideIndex,
    totalSlides,
    onNextSlide,
    onPrevSlide,
    onExit,
    onToggleBlackBackground,
  } = presentationMode;

  // Only render controls if we have callbacks
  if (!onNextSlide || !onPrevSlide || !onExit || !onToggleBlackBackground) {
    return null;
  }

  return (
    <>
      {/* Black Background Masking - only visible when showBlackBackground is true and bounds are available */}
      {showBlackBackground && slideViewportBounds && (
        <>
          {/* Top Mask */}
          <div
            className="presentation-overlay__mask"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, slideViewportBounds.y),
            }}
          />
          {/* Bottom Mask */}
          <div
            className="presentation-overlay__mask"
            style={{
              top: slideViewportBounds.y + slideViewportBounds.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          {/* Left Mask */}
          <div
            className="presentation-overlay__mask"
            style={{
              top: slideViewportBounds.y,
              left: 0,
              width: Math.max(0, slideViewportBounds.x),
              height: slideViewportBounds.height,
            }}
          />
          {/* Right Mask */}
          <div
            className="presentation-overlay__mask"
            style={{
              top: slideViewportBounds.y,
              left: slideViewportBounds.x + slideViewportBounds.width,
              right: 0,
              height: slideViewportBounds.height,
            }}
          />
        </>
      )}

      <PresentationControls
        currentSlide={currentSlideIndex}
        totalSlides={totalSlides}
        onPrevSlide={onPrevSlide}
        onNextSlide={onNextSlide}
        onExit={onExit}
        hasPrevSlide={currentSlideIndex > 0}
        hasNextSlide={currentSlideIndex < totalSlides - 1}
        showBlackBackground={showBlackBackground}
        onToggleBlackBackground={onToggleBlackBackground}
      />
    </>
  );
};
