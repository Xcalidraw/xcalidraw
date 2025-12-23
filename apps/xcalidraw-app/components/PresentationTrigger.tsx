import React, { useCallback, useState, useEffect, useRef } from "react";
import { presentationIcon } from "@xcalidraw/xcalidraw/components/icons";
import { getOrderedFrames } from "../hooks/usePresentation";
import { zoomToFitBounds } from "@xcalidraw/xcalidraw";
import { useAtom } from "../app-jotai";
import { presentationModeAtom } from "../app-jotai";
import { toast } from "sonner";

import type { XcalidrawFrameLikeElement } from "@xcalidraw/element/types";
import type { XcalidrawImperativeAPI } from "@xcalidraw/xcalidraw/types";

import "./PresentationTrigger.scss";

interface PresentationTriggerProps {
  xcalidrawAPI: XcalidrawImperativeAPI | null;
}

export const PresentationTrigger: React.FC<PresentationTriggerProps> = ({
  xcalidrawAPI,
}) => {
  const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom);
  const [slides, setSlides] = useState<XcalidrawFrameLikeElement[]>([]);
  const currentSlideIndexRef = useRef(0);
  
  // Store current frame viewport bounds refs for toggle logic without re-zoom
  const currentViewportBoundsRef = useRef<{x: number, y: number, width: number, height: number} | null>(null);

  const isActive = presentationMode.isActive;

  // Get frames whenever API is available
  const refreshSlides = useCallback(() => {
    if (!xcalidrawAPI) return [];
    const elements = xcalidrawAPI.getSceneElements();
    const orderedFrames = getOrderedFrames(elements);
    setSlides(orderedFrames);
    return orderedFrames;
  }, [xcalidrawAPI]);

  // Zoom to fit the entire frame and return projected viewport bounds
  const zoomToFrame = useCallback((frame: XcalidrawFrameLikeElement) => {
    if (!xcalidrawAPI) return null;
    
    const appState = xcalidrawAPI.getAppState();
    
    // Always zoom to frame bounds to ensure full frame is visible
    const bounds: [number, number, number, number] = [
      frame.x,
      frame.y,
      frame.x + frame.width,
      frame.y + frame.height,
    ];
    
    // Add small padding for aesthetics
    const padding = 10;
    const paddedBounds: [number, number, number, number] = [
      bounds[0] - padding,
      bounds[1] - padding,
      bounds[2] + padding,
      bounds[3] + padding,
    ];
    
    const result = zoomToFitBounds({
      bounds: paddedBounds,
      appState,
      fitToViewport: true,
      viewportZoomFactor: 1.0,
    });
    
    xcalidrawAPI.updateScene({ appState: result.appState });
    
    // Calculate projected viewport bounds for masking
    // Formula: screenX = (sceneX + scrollX) * zoom
    const { scrollX, scrollY, zoom } = result.appState;
    const zoomValue = zoom.value;
    
    // We want the bounds of the FRAME itself (not padded) to be the "hole"
    // So we calculate viewport coords of the original frame bounds
    const viewportX = (frame.x + scrollX) * zoomValue;
    const viewportY = (frame.y + scrollY) * zoomValue;
    const viewportWidth = frame.width * zoomValue;
    const viewportHeight = frame.height * zoomValue;
    
    const viewportBounds = { 
      x: viewportX, 
      y: viewportY, 
      width: viewportWidth, 
      height: viewportHeight 
    };
    
    currentViewportBoundsRef.current = viewportBounds;
    return viewportBounds;
  }, [xcalidrawAPI]);

  // Navigation
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      currentSlideIndexRef.current = index;
      const frame = slides[index];
      let viewportBounds: { x: number; y: number; width: number; height: number } | null = null;
      
      if (frame) {
        viewportBounds = zoomToFrame(frame);
      }
      
      // Update atom with new index and bounds
      setPresentationMode(prev => ({
        ...prev,
        currentSlideIndex: index,
        slideViewportBounds: viewportBounds,
      }));
    }
  }, [slides, zoomToFrame, setPresentationMode]);

  const nextSlide = useCallback(() => {
    goToSlide(Math.min(currentSlideIndexRef.current + 1, slides.length - 1));
  }, [slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(Math.max(currentSlideIndexRef.current - 1, 0));
  }, [goToSlide]);

  // Toggle black background - just toggles state now
  const toggleBlackBackground = useCallback(() => {
    setPresentationMode(prev => ({
      ...prev,
      showBlackBackground: !prev.showBlackBackground,
      slideViewportBounds: currentViewportBoundsRef.current, // Ensure bounds are synced
    }));
  }, [setPresentationMode]);

  // Exit presentation
  const exitPresentation = useCallback(() => {
    setPresentationMode(prev => ({
      ...prev,
      isActive: false,
      showBlackBackground: false,
      currentSlideIndex: 0,
      totalSlides: 0,
      onNextSlide: null,
      onPrevSlide: null,
      onExit: null,
      onToggleBlackBackground: null,
      slideViewportBounds: null,
    }));
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(console.error);
    }
  }, [setPresentationMode]);

  // Start presentation
  const startPresentation = useCallback(() => {
    if (!xcalidrawAPI) return;
    
    const currentSlides = refreshSlides();
    if (currentSlides.length === 0) {
      toast.error("No frames found. Create frames to use as presentation slides.");
      return;
    }
    
    currentSlideIndexRef.current = 0;
    
    // Enter fullscreen
    document.documentElement.requestFullscreen?.().catch(console.error);
    
    // Zoom to first frame
    let initialBounds: { x: number; y: number; width: number; height: number } | null = null;
    if (currentSlides[0]) {
      setTimeout(() => {
        initialBounds = zoomToFrame(currentSlides[0]);
        // Need to update atom again with bounds since setTimeout is async
        setPresentationMode(prev => ({
          ...prev,
          slideViewportBounds: initialBounds,
        }));
      }, 100);
    }
    
    // Set atom with all state and callbacks
    setPresentationMode({
      isActive: true,
      showBlackBackground: false,
      currentSlideIndex: 0,
      totalSlides: currentSlides.length,
      onNextSlide: nextSlide,
      onPrevSlide: prevSlide,
      onExit: exitPresentation,
      onToggleBlackBackground: toggleBlackBackground,
      slideViewportBounds: null, // Will be updated by setTimeout
    });
  }, [xcalidrawAPI, refreshSlides, zoomToFrame, setPresentationMode, nextSlide, prevSlide, exitPresentation, toggleBlackBackground]);

  // Update callbacks in atom when slides change
  useEffect(() => {
    if (isActive) {
      setPresentationMode(prev => ({
        ...prev,
        totalSlides: slides.length,
        onNextSlide: nextSlide,
        onPrevSlide: prevSlide,
        onExit: exitPresentation,
        onToggleBlackBackground: toggleBlackBackground,
      }));
    }
  }, [isActive, slides.length, nextSlide, prevSlide, exitPresentation, toggleBlackBackground, setPresentationMode]);

  // Listen for fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive) {
        exitPresentation();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isActive, exitPresentation]);

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
          goToSlide(0);
          break;
        case "End":
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          exitPresentation();
          break;
        case "b":
        case "B":
          e.preventDefault();
          toggleBlackBackground();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, nextSlide, prevSlide, goToSlide, slides.length, exitPresentation, toggleBlackBackground]);

  if (!xcalidrawAPI) {
    return null;
  }

  // Only render the trigger button here - controls are rendered by PresentationOverlay
  return (
    <button
      className="presentation-trigger"
      onClick={startPresentation}
      title="Start Presentation"
    >
      {presentationIcon}
    </button>
  );
};
