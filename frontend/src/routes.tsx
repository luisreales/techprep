import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPage } from '@/pages/auth/ResetPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PracticePage } from '@/pages/practice/PracticePage';
import { ChallengesPage } from '@/pages/challenges/ChallengesPage';
import { ResourcesPage } from '@/pages/resources/ResourcesPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset" element={<ResetPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/practice"
        element={
          isAuthenticated ? (
            <AppLayout>
              <PracticePage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/challenges"
        element={
          isAuthenticated ? (
            <AppLayout>
              <ChallengesPage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/resources"
        element={
          isAuthenticated ? (
            <AppLayout>
              <ResourcesPage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
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
