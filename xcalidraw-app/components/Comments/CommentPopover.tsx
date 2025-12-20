import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Comment, CommentThread } from '../../hooks/api.hooks';
import './Comments.scss';
import { FilledButton } from "@xcalidraw/xcalidraw";

interface CommentPopoverProps {
  thread: CommentThread;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: (content: string) => void;
  onResolve: (resolved: boolean) => void;
  onDelete: (commentId: string) => void;
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
  currentUserId,
  theme,
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Focus input when starting to reply
  useEffect(() => {
    if (isReplying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isReplying]);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
    if (e.key === 'Escape') {
      setIsReplying(false);
      setReplyContent('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return createPortal(
    <div className={`xcalidraw theme--${theme}`} style={{ position: 'absolute', top: 0, left: 0, transition: 'none' }}>
    <div
      ref={popoverRef}
      className={`comment-popover ${thread.root.resolved ? 'resolved' : ''}`}
      style={{
        left: position.x + 40, // 32px bubble width + 8px gap
        top: position.y,
      }}
    >
      {/* Header */}
      <div className="comment-popover-header">
        <span className="comment-popover-title">
          {thread.root.resolved ? '✓ Resolved' : 'Comment Thread'}
        </span>
        <button className="comment-popover-close" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Comments list */}
      <div className="comment-popover-body">
        {/* Root comment */}
        <div className="comment-item root">
          <div className="comment-avatar">
            {thread.root.author_avatar ? (
              <img src={thread.root.author_avatar} alt={thread.root.author_name} />
            ) : (
              <span>{thread.root.author_name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="comment-content">
            <div className="comment-header">
              <span className="comment-author">{thread.root.author_name}</span>
              <span className="comment-time">
                {formatDate(thread.root.created_at)} at {formatTime(thread.root.created_at)}
              </span>
            </div>
            <p className="comment-text">{thread.root.content}</p>
            {currentUserId === thread.root.author_id && (
              <button
                className="comment-delete"
                onClick={() => onDelete(thread.root.comment_id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {thread.replies.map((reply) => (
          <div key={reply.comment_id} className="comment-item reply">
            <div className="comment-avatar">
              {reply.author_avatar ? (
                <img src={reply.author_avatar} alt={reply.author_name} />
              ) : (
                <span>{reply.author_name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{reply.author_name}</span>
                <span className="comment-time">{formatTime(reply.created_at)}</span>
              </div>
              <p className="comment-text">{reply.content}</p>
              {currentUserId === reply.author_id && (
                <button
                  className="comment-delete"
                  onClick={() => onDelete(reply.comment_id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      {/* Reply input */}
      <div className="comment-popover-footer">
        {isReplying ? (
          <div className="comment-reply-input">
            <textarea
              ref={inputRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a reply..."
              rows={2}
            />
            <div className="comment-reply-actions">
              <FilledButton
                variant="outlined"
                color="muted"
                label="Cancel"
                size="small"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
              />
              <FilledButton
                variant="filled"
                color="primary"
                label="Reply"
                size="small"
                onClick={handleSubmitReply}
                disabled={!replyContent.trim()}
              />
            </div>
          </div>
        ) : (
          <div className="comment-footer-actions">
            <FilledButton
              variant="outlined"
              color="muted"
              label="Reply"
              size="small"
              onClick={() => setIsReplying(true)}
            />
            <FilledButton
              variant="outlined"
              color={thread.root.resolved ? "warning" : "success"}
              label={thread.root.resolved ? 'Reopen' : 'Resolve'}
              size="small"
              className="resolve"
              onClick={() => onResolve(!thread.root.resolved)}
            />
          </div>
        )}
      </div>
    </div>
    </div>,
    document.body
  );
};

export default CommentPopover;
