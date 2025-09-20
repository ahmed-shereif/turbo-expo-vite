import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Role } from '@repo/auth-client';
import type React from 'react';

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactElement;
}) {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(...roles)) {
    return <div>Not authorized</div>;
  }

  return children;
}
