import { Routes, Route, Navigate } from "react-router-dom";

import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import BoardPage from "../pages/Board/BoardPage";
import { XcalidrawPlusIframeExport } from "../XcalidrawPlusIframeExport";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Dashboard - default landing page */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Board routes */}
      <Route path="/board/create" element={<BoardPage />} />
      <Route path="/board/:boardId" element={<BoardPage />} />

      {/* Xcalidraw Plus export iframe */}
      <Route
        path="/xcalidraw-plus-export"
        element={<XcalidrawPlusIframeExport />}
      />

      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
