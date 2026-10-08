import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '../../shared/api/types';
import { appRoutes } from '../../shared/routes/app-routes';
import { useAuth } from './auth-context';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { authenticated, user } = useAuth();
  const location = useLocation();
  if (!authenticated) return <Navigate to={appRoutes.login} replace state={{ from: location.pathname }} />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to={appRoutes.dashboard} replace />;
  return <Outlet />;
}
