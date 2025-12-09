import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useUserLoggedIn } from "../hooks/auth.hooks";
import { useEffect, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";

import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import BoardPage from "../pages/Board/BoardPage";
import { XcalidrawPlusIframeExport } from "../XcalidrawPlusIframeExport";

import Auth from "../pages/Auth/Auth";
import LoginPage from "../pages/Auth/Login";
import SignupPage from "../pages/Auth/Signup";
import ConfirmEmailPage from "../pages/Auth/ConfirmEmail";
import ForgotPasswordPage from "../pages/Auth/ForgotPassword";
import ResetPasswordPage from "../pages/Auth/ResetPassword";

import { useSyncUserMutation, useListUserOrgsQuery } from "../hooks/api.hooks";

const ProtectedLayout = () => {
  const checkUser = useUserLoggedIn();
  const syncUser = useSyncUserMutation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { data: orgs } = useListUserOrgsQuery();

  useEffect(() => {
    checkUser.mutate(undefined, {
      onSuccess: () => {
        setIsAuthenticated(true);
        const orgName = localStorage.getItem('xcalidraw_signup_org_name');
        syncUser.mutate({ orgName: orgName || undefined }, {
          onSuccess: () => {
            if (orgName) {
              localStorage.removeItem('xcalidraw_signup_org_name');
            }
          }
        });
      },
      onError: () => setIsAuthenticated(false),
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated && orgs && orgs.items) {
      if (orgs.items.length > 0) {
        const currentOrgId = localStorage.getItem('currentOrgId');
        if (!currentOrgId) {
          // Default to the first organization
          const firstOrg = orgs.items[0];
          if (firstOrg && firstOrg.org_id) {
            localStorage.setItem('currentOrgId', firstOrg.org_id);
          }
          // We might want to reload the page to ensure all components pick up the new org ID
          // window.location.reload(); 
          // For now, let's rely on the fact that subsequent queries will pick it up.
        }
      } else if (!syncUser.isPending) {
        // Recovery: If user has no organizations, create a default one
        // This handles the case where "Individual" signup previously didn't create an org
        syncUser.mutate({ orgName: "My Workspace" });
      }
    }
  }, [isAuthenticated, orgs, syncUser.isPending]);

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

  useEffect(() => {
    checkUser.mutate(undefined, {
      onSuccess: () => setIsAuthenticated(true),
      onError: () => setIsAuthenticated(false),
    });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <IconLoader2 className="animate-spin" style={{ color: 'var(--muted-foreground)' }} size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
        <Route path="/dashboard" element={<DashboardPage />} />
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
