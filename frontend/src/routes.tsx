import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPage } from '@/pages/auth/ResetPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuthStore } from '@/stores/authStore';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset" element={<ResetPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes - All use the same AuthenticatedLayout */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/practice"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/challenges"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/challenges/:id"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/resources"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/questions"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/import"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/challenges"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/users"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/resources"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/settings"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/help"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};
