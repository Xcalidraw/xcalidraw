import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompleteTeamSetupMutation, useListTeamsQuery } from '../../hooks/api.hooks';

interface OrgUserFlowProps {
  defaultOrgId: string;
}

export const OrgUserFlow = ({ defaultOrgId }: OrgUserFlowProps) => {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const createTeam = useCompleteTeamSetupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      const result = await createTeam.mutateAsync({ teamName: teamName.trim() });
      
      // Navigate to the dashboard
      // TODO: Navigate to /dashboard/team/:teamId once route is implemented
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  };

  return (
    <div className="org-user-flow">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Create Your First Team</h1>
        <p className="onboarding-subtitle">
          Get started by creating your first team. You can add members and create more teams later.
        </p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-field">
            <label htmlFor="team-name" className="form-label">
              Team Name
            </label>
            <input
              id="team-name"
              type="text"
              className="form-input"
              placeholder="e.g., Engineering, Design, Marketing..."
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError('');
              }}
              disabled={createTeam.isPending}
              autoFocus
              maxLength={50}
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="form-submit-button"
            disabled={createTeam.isPending || !teamName.trim()}
          >
            {createTeam.isPending ? 'Creating Team...' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  );
};
