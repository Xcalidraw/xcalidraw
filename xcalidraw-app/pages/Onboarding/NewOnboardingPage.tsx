import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLoader2 } from '@tabler/icons-react';
import { useCheckOnboardingQuery, useOnboardMutation } from '../../hooks/api.hooks';
import './OnboardingPage.scss';

export const NewOnboardingPage = () => {
  const navigate = useNavigate();
  const { data: status, isLoading: isCheckingStatus, error: checkError } = useCheckOnboardingQuery();
  const onboard = useOnboardMutation();

  // Start onboarding if needed (only once)
  useEffect(() => {
    if (status?.needsOnboarding && !onboard.isPending && !onboard.isSuccess && !onboard.isError) {
      onboard.mutate();
    }
  }, [status?.needsOnboarding]);

  // Navigate to dashboard when onboarding succeeds
  useEffect(() => {
    if (onboard.isSuccess && onboard.data) {
      // Set org ID from response
      if (onboard.data.org_id) {
        localStorage.setItem('currentOrgId', onboard.data.org_id);
      }
      navigate('/dashboard', { replace: true });
    }
  }, [onboard.isSuccess, onboard.data, navigate]);

  // If already complete on initial load, redirect
  useEffect(() => {
    if (!isCheckingStatus && status?.isComplete && !onboard.isPending) {
      navigate('/dashboard', { replace: true });
    }
  }, [isCheckingStatus, status?.isComplete, onboard.isPending, navigate]);

  // Show loading while checking status
  if (isCheckingStatus) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <IconLoader2 className="animate-spin" style={{ color: '#666' }} size={48} />
        <h2 style={{ marginTop: '24px', color: '#333', fontSize: '24px', fontWeight: 600 }}>
          Checking your account...
        </h2>
        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
          This will only take a moment
        </p>
      </div>
    );
  }

  // Show loading while onboarding is in progress
  if (onboard.isPending) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <IconLoader2 className="animate-spin" style={{ color: '#666' }} size={48} />
        <h2 style={{ marginTop: '24px', color: '#333', fontSize: '24px', fontWeight: 600 }}>
          Setting up your workspace...
        </h2>
        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
          Creating your organization and team
        </p>
      </div>
    );
  }

  // Show error state with retry
  if (checkError || onboard.isError) {
    const errorMessage = (checkError || onboard.error) as Error;
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ color: '#dc2626', marginBottom: '16px' }}>
          <IconLoader2 size={48} />
        </div>
        <h2 style={{ color: '#333', fontSize: '24px', fontWeight: 600 }}>Oops! Something went wrong</h2>
        <p style={{ color: '#666', marginTop: '8px', marginBottom: '24px', fontSize: '14px' }}>
          {errorMessage?.message || 'Failed to set up your workspace'}
        </p>
        <button
          onClick={() => {
            if (checkError) {
              window.location.reload();
            } else {
              onboard.mutate();
            }
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Fallback: show loading (while waiting for effects to trigger)
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <IconLoader2 className="animate-spin" style={{ color: '#666' }} size={48} />
      <h2 style={{ marginTop: '24px', color: '#333', fontSize: '20px' }}>Please wait...</h2>
    </div>
  );
};
