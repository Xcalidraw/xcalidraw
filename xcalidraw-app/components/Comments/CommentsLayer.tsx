import React, { useState, useCallback } from 'react';
import { CommentBubble } from './CommentBubble';
import { CommentPopover } from './CommentPopover';
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useResolveCommentMutation,
} from '../../hooks/api.hooks';
import { FilledButton } from "@xcalidraw/xcalidraw";
import './Comments.scss';

interface CommentsLayerProps {
   boardId: string;
  currentUserId?: string;
  isCommentMode: boolean;
  isPanning?: boolean;
  canvasToScreen: (x: number, y: number) => { x: number; y: number };
  screenToCanvas: (x: number, y: number) => { x: number; y: number };
  onCommentModeChange?: (enabled: boolean) => void;
  theme: string;
  /** Used to force re-renders during panning - intentionally unused */
  _renderTrigger?: number;
}

export const CommentsLayer: React.FC<CommentsLayerProps> = ({
  boardId,
  currentUserId,
  isCommentMode,
  isPanning = false,
  canvasToScreen,
  screenToCanvas,
  onCommentModeChange,
  theme,
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

  const layerRef = React.useRef<HTMLDivElement>(null);
  const [cursorColor, setCursorColor] = useState('#087f5b');
  const [cursorStroke, setCursorStroke] = useState('#ffffff');

  React.useEffect(() => {
    if (layerRef.current) {
      const style = getComputedStyle(layerRef.current);
      // Use the semantic variable --color-brand-active which maps to Teal/Green in both modes
      const primaryColor = style.getPropertyValue('--color-brand-active').trim() || '#087f5b';
      const strokeColor = theme === 'dark' ? '#121212' : '#ffffff';
      
      setCursorColor(primaryColor);
      setCursorStroke(strokeColor);
    }
  }, [theme]);

  const cursorSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='16' fill='${cursorColor}'/><path transform='translate(6.4 6.4) scale(0.8)' d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' fill='none' stroke='${cursorStroke}' stroke-width='1.5'/></svg>`
  );

  // Apply cursor to the xcalidraw container when in comment mode
  // (since our layer has pointer-events: none, the cursor must be on the canvas)
  React.useEffect(() => {
    const xcalidrawContainer = document.querySelector('.xcalidraw') as HTMLElement;
    if (!xcalidrawContainer) return;

    if (isCommentMode) {
      xcalidrawContainer.style.cursor = `url("data:image/svg+xml,${cursorSvg}") 16 16, auto`;
    } else {
      xcalidrawContainer.style.cursor = '';
    }

    return () => {
      xcalidrawContainer.style.cursor = '';
    };
  }, [isCommentMode, cursorSvg]);

  return (
    <div
      ref={layerRef}
      className={`comments-layer ${isCommentMode ? 'comment-mode' : ''}`}
      style={isCommentMode ? { cursor: `url("data:image/svg+xml,${cursorSvg}") 16 16, auto` } : undefined}
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
          theme={theme}
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
            <FilledButton
              variant="outlined"
              color="muted"
              label="Cancel"
              size="small"
              onClick={() => {
                setNewCommentPos(null);
                setNewCommentContent('');
              }}
            />
            <FilledButton
              variant="filled"
              color="primary"
              label={createComment.isPending ? 'Posting...' : 'Post'}
              size="small"
              onClick={handleCreateComment}
              disabled={!newCommentContent.trim() || createComment.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsLayer;
