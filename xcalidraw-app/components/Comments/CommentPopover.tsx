import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CommentThread, Comment } from '../../hooks/api.hooks';
import './Comments.scss';

// Color labels available - green (theme primary) is default
const LABEL_COLORS = ['green', 'orange', 'red', 'gray'] as const;
type LabelColor = typeof LABEL_COLORS[number];

interface CommentPopoverProps {
  thread: CommentThread;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: (content: string) => void;
  onResolve: (resolved: boolean) => void;
  onDelete: (commentId: string) => void;
  onLabelChange?: (color: LabelColor | undefined) => void;
  currentUserId?: string;
  theme: string;
}

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  thread,
  position,
  onClose,
  onReply,
  onResolve,
  onDelete,
  onLabelChange,
  currentUserId,
  theme,
}) => {
  const [replyContent, setReplyContent] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentColor = thread.root.label_color;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
  };

  const handleColorClick = (color: LabelColor) => {
    if (onLabelChange) {
      // Toggle off if same color is clicked
      onLabelChange(currentColor === color ? undefined : color);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Yesterday, ${time}`;
    return `${date.toLocaleDateString()}, ${time}`;
  };

  // Emoji reaction button SVG
  const EmojiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // Send icon SVG
  const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );

  // More options icon
  const MoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );

  // Bell icon
  const BellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  // Get accent color for left border
  const accentColor = currentColor ? {
    green: '#22c55e',
    orange: '#f97316',
    red: '#ef4444',
    gray: '#9ca3af',
  }[currentColor] : undefined;

  return createPortal(
    <div className={`xcalidraw theme--${theme}`} style={{ position: 'absolute', top: 0, left: 0, transition: 'none' }}>
      <div
        ref={popoverRef}
        className={`comment-popover-v2 ${thread.root.resolved ? 'resolved' : ''}`}
        style={{
          left: position.x + 40,
          top: position.y,
        }}
      >
        {/* Header with Resolve toggle and actions */}
        <div 
          className="comment-header-v2"
          style={{
            borderLeft: accentColor ? `5px solid ${accentColor}` : undefined,
            marginLeft: accentColor ? '-1px' : undefined,
          }}
        >
          <label className="resolve-toggle">
            <input
              type="checkbox"
              checked={thread.root.resolved}
              onChange={() => onResolve(!thread.root.resolved)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Resolve</span>
          </label>
          
          <div className="header-actions">
            <div className="color-dots">
              {LABEL_COLORS.map((color) => (
                <span
                  key={color}
                  className={`dot ${color} ${currentColor === color ? 'selected' : ''}`}
                  onClick={() => handleColorClick(color)}
                  title={`Label: ${color}`}
                />
              ))}
            </div>
            <button className="icon-btn" title="Notifications">
              <BellIcon />
            </button>
            <button className="icon-btn" title="More options">
              <MoreIcon />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="comment-list-v2">
          {/* Root comment */}
          <div className="comment-item-v2">
            <div className="comment-row">
              <div className="comment-avatar-v2">
                {thread.root.author_avatar ? (
                  <img src={thread.root.author_avatar} alt={thread.root.author_name} />
                ) : (
                  <span>{thread.root.author_name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="comment-meta">
                <span className="author-name">{thread.root.author_name}</span>
                <span className="comment-time-v2">{formatDateTime(thread.root.created_at)}</span>
              </div>
            </div>
            <div className="comment-body">
              <p className="comment-text-v2">{thread.root.content}</p>
              <button className="emoji-btn" title="Add reaction">
                <EmojiIcon />
              </button>
            </div>
            {currentUserId === thread.root.author_id && (
              <button
                className="delete-link"
                onClick={() => onDelete(thread.root.comment_id)}
              >
                Delete
              </button>
            )}
          </div>

          {/* Replies - simpler layout without avatar */}
          {thread.replies.map((reply) => (
            <div key={reply.comment_id} className="comment-item-v2 reply">
              <div className="comment-body">
                <p className="comment-text-v2">{reply.content}</p>
                <button className="emoji-btn" title="Add reaction">
                  <EmojiIcon />
                </button>
              </div>
              {currentUserId === reply.author_id && (
                <button
                  className="delete-link"
                  onClick={() => onDelete(reply.comment_id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Reply input - always visible */}
        <div className="reply-input-v2">
          <input
            ref={inputRef}
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Leave a reply. Use @ to mention."
          />
          <button className="emoji-btn" title="Add emoji">
            <EmojiIcon />
          </button>
          <button
            className="send-btn"
            onClick={handleSubmitReply}
            disabled={!replyContent.trim()}
            title="Send reply"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommentPopover;
