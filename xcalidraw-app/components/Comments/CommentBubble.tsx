import React from 'react';
import type { CommentThread } from '../../hooks/api.hooks';
import './Comments.scss';

// Color map for label colors
const LABEL_COLORS: Record<string, string> = {
  gray: '#9ca3af',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  black: '#1f2937',
};

interface CommentBubbleProps {
  thread: CommentThread;
  screenPosition: { x: number; y: number };
  isSelected: boolean;
  onClick: () => void;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
  thread,
  screenPosition,
  isSelected,
  onClick,
}) => {
  const replyCount = thread.replies.length;
  const isResolved = thread.root.resolved;
  const labelColor = thread.root.label_color;
  
  // Get the bubble background color
  const bubbleColor = isResolved 
    ? '#9ca3af' // Gray for resolved
    : labelColor 
      ? LABEL_COLORS[labelColor] 
      : undefined; // Default (uses CSS var)

  return (
    <div
      className={`comment-bubble ${isSelected ? 'selected' : ''} ${isResolved ? 'resolved' : ''}`}
      style={{
        transform: `translate(${screenPosition.x}px, ${screenPosition.y}px)`,
        ...(bubbleColor && !isResolved ? { backgroundColor: bubbleColor } : {}),
        ...(isSelected && bubbleColor ? { boxShadow: `0 0 0 3px ${bubbleColor}, 0 4px 12px rgba(0, 0, 0, 0.3)` } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
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
