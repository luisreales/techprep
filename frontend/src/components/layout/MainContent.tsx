import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Practice from '@/pages/Practice';
import Challenges from '@/pages/Challenges';
import ChallengeDetail from '@/pages/ChallengeDetail';
import Resources from '@/pages/Resources';
import Profile from '@/pages/Profile';
import Help from '@/pages/Help';
import AdminPanel from '@/pages/AdminPanel';
import { QuestionsPage } from '@/pages/admin/questions/QuestionsPage';
import { ChallengesPage } from '@/pages/admin/challenges/ChallengesPage';
import { UsersPage } from '@/pages/admin/users/UsersPage';
import SessionTemplatesPage from '@/pages/admin/session-templates/SessionTemplatesPage';
import NewSessionTemplatePage from '@/pages/admin/session-templates/NewSessionTemplatePage';
import EditSessionTemplatePage from '@/pages/admin/session-templates/EditSessionTemplatePage';
import PreviewSessionTemplatePage from '@/pages/admin/session-templates/PreviewSessionTemplatePage';
import { ResourcesPage } from '@/pages/admin/resources/ResourcesPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import AdminLogsPage from '@/pages/admin/AdminLogsPage';
import AdminMaintenancePage from '@/pages/admin/AdminMaintenancePage';
import AdminHealthPage from '@/pages/admin/AdminHealthPage';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';

// Placeholder components for new admin pages - will be replaced with actual implementations
const AdminImport = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Excel Import</h1><p className="mt-4 text-gray-600">Excel import interface coming soon...</p></div>;

const MainContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const renderContent = () => {
    // Admin routes - require Admin role
    if (location.pathname.startsWith('/admin/')) {
      // Temporary relaxation: allow any authenticated user to access these pages
      const allowedPages = [
        '/admin/session-templates',
        '/admin/logs',
        '/admin/maintenance',
        '/admin/health',
        '/admin/settings'
      ];
      const isAllowedPage = allowedPages.some(page =>
        location.pathname === page || location.pathname.startsWith(page + '/')
      );

      if (user?.role !== 'Admin' && !isAllowedPage) {
        return <div className="p-6 bg-red-50 border border-red-200 rounded-lg"><h1 className="text-xl font-bold text-red-700">Access Denied</h1><p className="mt-2 text-red-600">You don't have permission to access this area.</p></div>;
      }

      // Handle nested session template routes
      if (location.pathname.startsWith('/admin/session-templates/')) {
        if (location.pathname.endsWith('/new')) return <NewSessionTemplatePage />;
        if (location.pathname.endsWith('/edit')) return <EditSessionTemplatePage />;
        if (location.pathname.endsWith('/preview')) return <PreviewSessionTemplatePage />;
      }

      switch (location.pathname) {
        case '/admin/questions':
          return <QuestionsPage />;
        case '/admin/import':
          return <AdminImport />;
        case '/admin/challenges':
          return <ChallengesPage />;
        case '/admin/users':
          return <UsersPage />;
        case '/admin/session-templates':
          return <SessionTemplatesPage />;
        case '/admin/resources':
          return <ResourcesPage />;
        case '/admin/logs':
          return <AdminLogsPage />;
        case '/admin/maintenance':
          return <AdminMaintenancePage />;
        case '/admin/health':
          return <AdminHealthPage />;
        case '/admin/settings':
          return <SettingsPage />;
        default:
          return <AdminPanel />;
      }
    }

    // Regular routes
    switch (location.pathname) {
      case '/dashboard':
        // Redirect admin users to admin panel instead of dashboard
        if (user?.role === UserRole.Admin) {
          return <Navigate to="/admin" replace />;
        }
        return <Dashboard />;
      case '/practice':
        return <Practice />;
      case '/challenges':
        return <Challenges />;
      case '/resources':
        return <Resources />;
      case '/profile':
        return <Profile />;
      case '/help':
        return <Help />;
      case '/admin':
        return user?.role === UserRole.Admin ? <AdminPanel /> : <div className="p-6 bg-red-50 border border-red-200 rounded-lg"><h1 className="text-xl font-bold text-red-700">Access Denied</h1><p className="mt-2 text-red-600">You don't have permission to access this area.</p></div>;
      case '/':
        // Root path - redirect based on role
        if (user?.role === UserRole.Admin) {
          return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
      default:
        // Handle challenge detail route
        if (location.pathname.startsWith('/challenges/')) {
          return <ChallengeDetail />;
        }
        // Default fallback - redirect based on role
        if (user?.role === UserRole.Admin) {
          return <Navigate to="/admin" replace />;
        }
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-[var(--background-color)] overflow-auto">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
