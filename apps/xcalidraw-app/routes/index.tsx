import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserLoggedIn } from "../hooks/auth.hooks";
import { useEffect, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";

import { DashboardRemote } from "../components/DashboardRemote";
import BoardPage from "../pages/Board/BoardPage";
import { XcalidrawPlusIframeExport } from "../XcalidrawPlusIframeExport";
import { NewOnboardingPage as OnboardingPage } from "../pages/Onboarding/NewOnboardingPage";

import Auth from "../pages/Auth/Auth";
import LoginPage from "../pages/Auth/Login";
import SignupPage from "../pages/Auth/Signup";
import ConfirmEmailPage from "../pages/Auth/ConfirmEmail";
import ForgotPasswordPage from "../pages/Auth/ForgotPassword";
import ResetPasswordPage from "../pages/Auth/ResetPassword";

import { useListUserOrgsQuery, useOnboardingStatusQuery } from "../hooks/api.hooks";
import { useQueryClient } from "@tanstack/react-query";

const ProtectedLayout = () => {
  const checkUser = useUserLoggedIn();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // We call syncUser once on mount if authenticated to ensure DB record exists
  // but we don't retry infinitely if orgs are missing
  useEffect(() => {
    checkUser.mutate(undefined, {
      onSuccess: () => {
        setIsAuthenticated(true);
        // Clean up signup artifact
        localStorage.removeItem('xcalidraw_signup_org_name');
      },
      onError: () => setIsAuthenticated(false),
    });
  }, []);

  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Don't fetch orgs during onboarding - they're being created!
  const isOnboarding = location.pathname === '/onboarding';
  const { data: orgs } = useListUserOrgsQuery({ enabled: !isOnboarding });

  // Validate and Set default currentOrgId
  useEffect(() => {
    if (orgs?.items && orgs.items.length > 0) {
      const currentOrgId = localStorage.getItem('currentOrgId');

      // Check if the stored Org ID actually belongs to this user
      const isValid = currentOrgId && orgs.items.some(o => o.org_id === currentOrgId);

      if (!isValid) {
        // If missing or invalid (stale), switch to the default or first available org
        // Cast to any because is_default might be missing from the generated client type
        const bestOrg = orgs.items.find(o => (o as any).is_default) || orgs.items[0];
        if (bestOrg && bestOrg.org_id) {
          console.log(`Auto-switching organization from ${currentOrgId} to ${bestOrg.org_id}`);
          localStorage.setItem('currentOrgId', bestOrg.org_id);

          // Invalidate queries to ensure they retry with the new correct header
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          queryClient.invalidateQueries({ queryKey: ['boards'] });
          queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        }
      }
    }
  }, [orgs, queryClient]);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <IconLoader2 className="animate-spin" style={{ color: 'var(--color-gray-60)' }} size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

const PublicLayout = () => {
  const checkUser = useUserLoggedIn();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check onboarding status to decide where to redirect
  const { data: onboardingStatus, isLoading: isOnboardingLoading } = useOnboardingStatusQuery({
    enabled: isAuthenticated === true
  });

  useEffect(() => {
    checkUser.mutate(undefined, {
      onSuccess: () => setIsAuthenticated(true),
      onError: () => setIsAuthenticated(false),
    });
  }, []);

  if (isAuthenticated === null || (isAuthenticated && isOnboardingLoading)) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <IconLoader2 className="animate-spin" style={{ color: 'var(--muted-foreground)' }} size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    // If user has created their first team, go to dashboard
    if (onboardingStatus?.has_created_first_team) {
      return <Navigate to="/dashboard" replace />;
    }
    // Otherwise go to onboarding
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/auth" element={<Auth />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="confirm-email" element={<ConfirmEmailPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Dashboard - Remote Module (Module Federation) */}
        <Route path="/dashboard/*" element={<DashboardRemote />} />

        <Route path="/board/create" element={<BoardPage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route
          path="/xcalidraw-plus-export"
          element={<XcalidrawPlusIframeExport />}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
