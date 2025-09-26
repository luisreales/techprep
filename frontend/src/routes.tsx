import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPage } from '@/pages/auth/ResetPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ConfirmEmailPage } from '@/pages/auth/ConfirmEmailPage';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuthStore } from '@/stores/authStore';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      
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
        path="/practice/runner"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/interviews"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/interviews/runner/:templateId"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/interviews/runner/:id"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/interviews/summary/:id"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/interviews/review/:id"
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
        path="/admin/session-templates"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/session-templates/new"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/session-templates/:id/edit"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/session-templates/:id/preview"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/settings"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/templates"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/templates/new"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/templates/:id/edit"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/templates/:id/preview"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/assignments"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/assignments/new"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/practice-interview/assignments/:id/edit"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/question-bank"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/groups"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/credits"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/proctoring"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/analytics"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/logs"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/maintenance"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/health"
        element={isAuthenticated ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin/import"
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
