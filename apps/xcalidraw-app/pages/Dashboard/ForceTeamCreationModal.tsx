import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCompleteTeamSetupMutation } from '../../hooks/api.hooks';
import './ForceTeamCreationModal.scss';

interface ForceTeamCreationModalProps {
  open: boolean;
}

export const ForceTeamCreationModal = ({ open }: ForceTeamCreationModalProps) => {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const completeSetup = useCompleteTeamSetupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      await completeSetup.mutateAsync({ teamName: teamName.trim() });
      // Modal will close automatically when onboarding status updates
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="force-team-modal-overlay" />
        <Dialog.Content 
          className="force-team-modal-content"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <Dialog.Title className="force-team-modal-title">
            Create Your First Team
          </Dialog.Title>
          <Dialog.Description className="force-team-modal-description">
            To get started, please name your first team. You can rename it later.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="force-team-modal-form">
            <div className="force-team-modal-field">
              <label htmlFor="team-name" className="force-team-modal-label">
                Team Name
              </label>
              <input
                id="team-name"
                type="text"
                className="force-team-modal-input"
                placeholder="e.g., Design Team, Engineering, Marketing"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError('');
                }}
                disabled={completeSetup.isPending}
                autoFocus
              />
            </div>

            {error && (
              <div className="force-team-modal-error">
                {error}
              </div>
            )}

            <div className="force-team-modal-actions">
              <button 
                type="submit" 
                className="force-team-modal-button"
                disabled={completeSetup.isPending || !teamName.trim()}
              >
                {completeSetup.isPending ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

