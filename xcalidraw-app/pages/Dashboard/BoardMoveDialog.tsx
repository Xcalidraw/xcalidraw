import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { useMoveBoardMutation, useListTeamsQuery } from '../../hooks/api.hooks';
import { Board } from './store';
import './BoardMoveDialog.scss';

interface BoardMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board;
  orgId: string;
  teams: Array<{ id: string; name: string }>;
  spaces: Array<{ id: string; name: string; teamId: string }>;
}

export const BoardMoveDialog = ({
  open,
  onOpenChange,
  board,
  orgId,
  teams,
  spaces,
}: BoardMoveDialogProps) => {
  const [targetType, setTargetType] = useState<'TEAM' | 'SPACE'>(board.parentType);
  const [targetId, setTargetId] = useState(board.space || board.team);
  const [targetTeamId, setTargetTeamId] = useState(board.team);
  const moveBoardMutation = useMoveBoardMutation();

  useEffect(() => {
    // Reset when board changes
    setTargetType(board.parentType);
    setTargetId(board.space || board.team);
    setTargetTeamId(board.team);
  }, [board]);

  const handleMove = async () => {
    try {
      await moveBoardMutation.mutateAsync({
        orgId,
        boardId: board.id,
        targetType,
        targetId,
        teamId: targetTeamId,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to move board:', error);
    }
  };

  const availableTargets =
    targetType === 'TEAM'
      ? teams
      : spaces.filter((space) => space.teamId === targetTeamId);

  const isCurrentLocation =
    targetType === board.parentType &&
    targetId === (board.space || board.team);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="board-move-dialog-overlay" />
        <Dialog.Content className="board-move-dialog-content">
          <Dialog.Title className="board-move-dialog-title">
            Move Board
          </Dialog.Title>
          <Dialog.Description className="board-move-dialog-description">
            Move "{board.name}" to a different team or space
          </Dialog.Description>

          <div className="board-move-dialog-form">
            {/* Location Type Selection */}
            <div className="board-move-dialog-field">
              <label className="board-move-dialog-label">Move to</label>
              <Select.Root value={targetType} onValueChange={(value: 'TEAM' | 'SPACE') => {
                setTargetType(value);
                // Reset target when type changes
                if (value === 'TEAM') {
                  setTargetId(targetTeamId);
                } else {
                  const firstSpace = spaces.find(s => s.teamId === targetTeamId);
                  setTargetId(firstSpace?.id || '');
                }
              }}>
                <Select.Trigger className="board-move-dialog-select-trigger">
                  <Select.Value />
                  <Select.Icon>
                    <ChevronDown size={16} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="board-move-dialog-select-content">
                    <Select.Viewport>
                      <Select.Item value="TEAM" className="board-move-dialog-select-item">
                        <Select.ItemText>Team Level</Select.ItemText>
                        <Select.ItemIndicator className="board-move-dialog-select-indicator">
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                      <Select.Item value="SPACE" className="board-move-dialog-select-item">
                        <Select.ItemText>Space</Select.ItemText>
                        <Select.ItemIndicator className="board-move-dialog-select-indicator">
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Target Selection */}
            <div className="board-move-dialog-field">
              <label className="board-move-dialog-label">
                {targetType === 'TEAM' ? 'Select Team' : 'Select Space'}
              </label>
              <Select.Root value={targetId} onValueChange={setTargetId}>
                <Select.Trigger className="board-move-dialog-select-trigger">
                  <Select.Value placeholder={`Choose a ${targetType.toLowerCase()}...`} />
                  <Select.Icon>
                    <ChevronDown size={16} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="board-move-dialog-select-content">
                    <Select.Viewport>
                      {availableTargets.map((target) => (
                        <Select.Item
                          key={target.id}
                          value={target.id}
                          className="board-move-dialog-select-item"
                        >
                          <Select.ItemText>{target.name}</Select.ItemText>
                          <Select.ItemIndicator className="board-move-dialog-select-indicator">
                            <Check size={16} />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          <div className="board-move-dialog-actions">
            <button
              type="button"
              className="board-move-dialog-button-secondary"
              onClick={() => onOpenChange(false)}
              disabled={moveBoardMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="board-move-dialog-button-primary"
              onClick={handleMove}
              disabled={moveBoardMutation.isPending || isCurrentLocation || !targetId}
            >
              {moveBoardMutation.isPending ? 'Moving...' : 'Move Board'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
