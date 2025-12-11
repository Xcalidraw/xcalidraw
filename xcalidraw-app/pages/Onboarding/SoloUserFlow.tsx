import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompleteTeamSetupMutation } from '../../hooks/api.hooks';
import { useGetUser } from '../../hooks/auth.hooks';

interface SoloUserFlowProps {
  defaultOrgId: string;
}

export const SoloUserFlow = ({ defaultOrgId }: SoloUserFlowProps) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Setting up your workspace...');
  const createTeam = useCompleteTeamSetupMutation();
  const { user } = useGetUser();

  useEffect(() => {
    const autoSetup = async () => {
      if (!user) return;

      try {
        // Auto-create team with user's name
        const teamName = `${user.name}'s Team`;
        
        setStatus('Creating your team...');
        const result = await createTeam.mutateAsync({ teamName });
        
        setStatus('Finalizing...');
        
        // Small delay for UX (so user sees the messages)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate to the dashboard
        // TODO: Navigate to /dashboard/team/:teamId once route is implemented
        navigate('/dashboard');
      } catch (error: any) {
        setStatus(`Error: ${error.message || 'Failed to set up workspace'}`);
      }
    };

    autoSetup();
  }, [user, createTeam, navigate]);

  return (
    <div className="solo-user-flow">
      <div className="onboarding-card">
        <div className="loading-content">
          <div className="loading-spinner" />
          <h2 className="loading-title">{status}</h2>
          <p className="loading-subtitle">This will only take a moment</p>
        </div>
      </div>
    </div>
  );
};
