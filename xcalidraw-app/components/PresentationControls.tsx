import React from "react";
import "./PresentationControls.scss";

interface PresentationControlsProps {
  currentSlide: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onExit: () => void;
  hasPrevSlide: boolean;
  hasNextSlide: boolean;
  showBlackBackground: boolean;
  onToggleBlackBackground: () => void;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onExit,
  hasPrevSlide,
  hasNextSlide,
  showBlackBackground,
  onToggleBlackBackground,
}) => {
  return (
    <div className="presentation-controls">
      <div className="presentation-controls__inner">
        <button
          className="presentation-controls__btn"
          onClick={onPrevSlide}
          disabled={!hasPrevSlide}
          title="Previous slide (←)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <span className="presentation-controls__counter">
          {currentSlide + 1} / {totalSlides}
        </span>
        
        <button
          className="presentation-controls__btn"
          onClick={onNextSlide}
          disabled={!hasNextSlide}
          title="Next slide (→ or Space)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        
        <div className="presentation-controls__spacer" />
        
        {/* Black background toggle */}
        <button
          className={`presentation-controls__btn presentation-controls__btn--toggle ${showBlackBackground ? 'presentation-controls__btn--active' : ''}`}
          onClick={onToggleBlackBackground}
          title="Toggle black background (B)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" fill={showBlackBackground ? "currentColor" : "none"} />
          </svg>
        </button>
        
        <div className="presentation-controls__spacer" />
        
        <button
          className="presentation-controls__btn presentation-controls__btn--exit"
          onClick={onExit}
          title="Exit presentation (Escape)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
