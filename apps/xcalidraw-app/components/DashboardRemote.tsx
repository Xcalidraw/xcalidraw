import { lazy, Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";

// Dynamic import from the remote module (Module Federation)
const RemoteDashboard = lazy(() => import("dashboard/App"));

export const DashboardRemote = () => {
  return (
    <Suspense
      fallback={
        <div style={{ 
          display: 'flex', 
          height: '100vh', 
          width: '100%', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <IconLoader2 className="animate-spin" style={{ color: 'var(--color-gray-60)' }} size={32} />
        </div>
      }
    >
      <RemoteDashboard />
    </Suspense>
  );
};
