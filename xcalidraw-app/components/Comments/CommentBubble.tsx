import React, { useState, useRef, useCallback } from 'react';
import type { CommentThread } from '../../hooks/api.hooks';
import './Comments.scss';

// Color map for label colors - green is theme primary/default
const LABEL_COLORS: Record<string, string> = {
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  gray: '#9ca3af',
};

interface CommentBubbleProps {
  thread: CommentThread;
  screenPosition: { x: number; y: number };
  isSelected: boolean;
  onClick: () => void;
  onMove?: (deltaX: number, deltaY: number) => void;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
  thread,
  screenPosition,
  isSelected,
  onClick,
  onMove,
}) => {
  const replyCount = thread.replies.length;
  const isResolved = thread.root.resolved;
  const labelColor = thread.root.label_color;
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  
  // Get the bubble background color
  const bubbleColor = isResolved 
    ? '#9ca3af' // Gray for resolved
    : labelColor 
      ? LABEL_COLORS[labelColor] 
      : undefined; // Default (uses CSS var)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
    setIsDragging(true);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      
      // Only consider it a move if we've moved more than 3 pixels
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMoved.current = true;
      }
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      if (dragStartRef.current && hasMoved.current && onMove) {
        const deltaX = upEvent.clientX - dragStartRef.current.x;
        const deltaY = upEvent.clientY - dragStartRef.current.y;
        onMove(deltaX, deltaY);
      } else if (!hasMoved.current) {
        // It was a click, not a drag
        onClick();
      }
      
      dragStartRef.current = null;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onClick, onMove]);

  return (
    <div
      className={`comment-bubble ${isSelected ? 'selected' : ''} ${isResolved ? 'resolved' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translate(${screenPosition.x}px, ${screenPosition.y}px)`,
        ...(bubbleColor && !isResolved ? { backgroundColor: bubbleColor } : {}),
        ...(isSelected && bubbleColor ? { boxShadow: `0 0 0 3px ${bubbleColor}, 0 4px 12px rgba(0, 0, 0, 0.3)` } : {}),
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="comment-bubble-icon">
        {isResolved ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        )}
      </div>
      {replyCount > 0 && (
        <div className="comment-bubble-badge">
          {replyCount}
        </div>
      )}
    </div>
  );
};

export default CommentBubble;
