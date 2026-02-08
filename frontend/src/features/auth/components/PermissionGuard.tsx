import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  permission: string | string[];
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: Props) {
  const { hasPermission } = useAuth();

  // Support single permission or array of permissions (any-of logic)
  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = permissions.some((p) => hasPermission(p));

  if (!hasAccess) {
    return <Navigate to="/employees" replace />;
  }

  return <>{children}</>;
}
