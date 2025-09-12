import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const RoleGuard: React.FC<React.PropsWithChildren<{ role: 'Admin' | 'Student' }>> = ({ role, children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'Admin' && user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const useHasRole = (role: 'Admin' | 'Student') => {
  const { user } = useAuthStore();
  return user?.role === role;
};