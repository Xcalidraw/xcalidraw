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

const ProtectedLayout = () => {
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
