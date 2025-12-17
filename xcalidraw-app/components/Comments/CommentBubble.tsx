import React, { useState, useRef } from 'react';
import type { CommentThread } from '../../hooks/api.hooks';
import './Comments.scss';

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

  return (
    <div
      className={`comment-bubble ${isSelected ? 'selected' : ''} ${isResolved ? 'resolved' : ''}`}
      style={{
        transform: `translate(${screenPosition.x}px, ${screenPosition.y}px)`,
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
