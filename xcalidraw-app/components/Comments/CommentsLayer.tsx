import React, { useState, useCallback } from 'react';
import { CommentBubble } from './CommentBubble';
import { CommentPopover } from './CommentPopover';
import type { CommentThread } from '../../hooks/api.hooks';
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useResolveCommentMutation,
} from '../../hooks/api.hooks';
import './Comments.scss';

interface CommentsLayerProps {
  boardId: string;
  currentUserId?: string;
  isCommentMode: boolean;
  canvasToScreen: (x: number, y: number) => { x: number; y: number };
  screenToCanvas: (x: number, y: number) => { x: number; y: number };
  onCommentModeChange?: (enabled: boolean) => void;
}

export const CommentsLayer: React.FC<CommentsLayerProps> = ({
  boardId,
  currentUserId,
  isCommentMode,
  canvasToScreen,
  screenToCanvas,
  onCommentModeChange,
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newCommentPos, setNewCommentPos] = useState<{ x: number; y: number } | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');

  const { data: commentsData } = useCommentsQuery(boardId);
  const createComment = useCreateCommentMutation();
  const deleteComment = useDeleteCommentMutation();
  const resolveComment = useResolveCommentMutation();

  const threads = commentsData?.threads || [];
  const selectedThread = threads.find((t) => t.root.comment_id === selectedThreadId);

  const handleLayerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isCommentMode) return;
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setNewCommentPos({ x: canvasPos.x, y: canvasPos.y });
      setSelectedThreadId(null);
    },
    [isCommentMode, screenToCanvas]
  );

  const handleCreateComment = useCallback(async () => {
    if (!newCommentPos || !newCommentContent.trim()) return;

    await createComment.mutateAsync({
      boardId,
      content: newCommentContent.trim(),
      x: newCommentPos.x,
      y: newCommentPos.y,
    });

    setNewCommentPos(null);
    setNewCommentContent('');
    onCommentModeChange?.(false);
  }, [boardId, newCommentPos, newCommentContent, createComment, onCommentModeChange]);

  const handleReply = useCallback(
    async (content: string) => {
      if (!selectedThread) return;
      await createComment.mutateAsync({
        boardId,
        content,
        parentId: selectedThread.root.comment_id,
      });
    },
    [boardId, selectedThread, createComment]
  );

  const handleResolve = useCallback(
    async (resolved: boolean) => {
      if (!selectedThread) return;
      await resolveComment.mutateAsync({
        boardId,
        commentId: selectedThread.root.comment_id,
        resolved,
      });
    },
    [boardId, selectedThread, resolveComment]
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      await deleteComment.mutateAsync({ boardId, commentId });
      if (selectedThread?.root.comment_id === commentId) {
        setSelectedThreadId(null);
      }
    },
    [boardId, selectedThread, deleteComment]
  );

  return (
    <div
      className={`comments-layer ${isCommentMode ? 'comment-mode' : ''}`}
      onClick={handleLayerClick}
    >
      {/* Comment bubbles */}
      {threads.map((thread) => {
        const screenPos = canvasToScreen(thread.root.x, thread.root.y);
        return (
          <CommentBubble
            key={thread.root.comment_id}
            thread={thread}
            screenPosition={screenPos}
            isSelected={selectedThreadId === thread.root.comment_id}
            onClick={() => {
              setSelectedThreadId(thread.root.comment_id);
              setNewCommentPos(null);
            }}
          />
        );
      })}

      {/* Selected thread popover */}
      {selectedThread && (
        <CommentPopover
          thread={selectedThread}
          position={canvasToScreen(selectedThread.root.x, selectedThread.root.y)}
          onClose={() => setSelectedThreadId(null)}
          onReply={handleReply}
          onResolve={handleResolve}
          onDelete={handleDelete}
          currentUserId={currentUserId}
        />
      )}

      {/* New comment input */}
      {newCommentPos && (
        <div
          className="new-comment-input"
          style={{
            left: canvasToScreen(newCommentPos.x, newCommentPos.y).x + 20,
            top: canvasToScreen(newCommentPos.x, newCommentPos.y).y - 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreateComment();
              }
              if (e.key === 'Escape') {
                setNewCommentPos(null);
                setNewCommentContent('');
              }
            }}
          />
          <div className="new-comment-actions">
            <button onClick={() => { setNewCommentPos(null); setNewCommentContent(''); }}>Cancel</button>
            <button
              onClick={handleCreateComment}
              disabled={!newCommentContent.trim() || createComment.isPending}
            >
              {createComment.isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsLayer;
