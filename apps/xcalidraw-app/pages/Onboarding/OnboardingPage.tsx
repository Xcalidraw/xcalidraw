import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStatusQuery } from '../../hooks/api.hooks';
import { OrgUserFlow } from './OrgUserFlow';
import { SoloUserFlow } from './SoloUserFlow';
import './OnboardingPage.scss';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { data: onboarding, isLoading, error } = useOnboardingStatusQuery();

  // If already has first team, redirect to dashboard
  useEffect(() => {
    if (onboarding?.has_created_first_team) {
      // User has completed onboarding, redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [onboarding, navigate]);

  if (isLoading) {
    return (
      <div className="onboarding-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="onboarding-loading">
        <p style={{ color: 'red' }}>Error loading onboarding status: {(error as Error).message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="onboarding-loading">
        <p>No onboarding data available</p>
      </div>
    );
  }

  // If user has already completed onboarding, show loading while redirecting
  if (onboarding.has_created_first_team) {
    return (
      <div className="onboarding-loading">
        <div className="spinner" />
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      {onboarding.user_type === 'org' ? (
        <OrgUserFlow defaultOrgId={onboarding.default_org_id!} />
      ) : (
        <SoloUserFlow defaultOrgId={onboarding.default_org_id!} />
      )}
    </div>
  );
};
