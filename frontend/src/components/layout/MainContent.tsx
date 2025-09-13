import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Practice from '@/pages/Practice';
import Challenges from '@/pages/Challenges';
import Resources from '@/pages/Resources';
import Profile from '@/pages/Profile';
import Help from '@/pages/Help';
import AdminPanel from '@/pages/AdminPanel';
import { QuestionsPage } from '@/pages/admin/questions/QuestionsPage';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';
const AdminImport = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Excel Import</h1><p className="mt-4 text-gray-600">Excel import interface coming soon...</p></div>;
const AdminChallenges = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Admin Challenges</h1><p className="mt-4 text-gray-600">Admin challenges management coming soon...</p></div>;
const AdminUsers = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Users Management</h1><p className="mt-4 text-gray-600">Users management interface coming soon...</p></div>;
const AdminResources = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Admin Resources</h1><p className="mt-4 text-gray-600">Admin resources management coming soon...</p></div>;
const AdminSettings = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">System Settings</h1><p className="mt-4 text-gray-600">System settings interface coming soon...</p></div>;

const MainContent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const renderContent = () => {
    // Admin routes - require Admin role
    if (location.pathname.startsWith('/admin/')) {
      if (user?.role !== 'Admin') {
        return <div className="p-6 bg-red-50 border border-red-200 rounded-lg"><h1 className="text-xl font-bold text-red-700">Access Denied</h1><p className="mt-2 text-red-600">You don't have permission to access this area.</p></div>;
      }
      
      switch (location.pathname) {
        case '/admin/questions':
          return <QuestionsPage />;
        case '/admin/import':
          return <AdminImport />;
        case '/admin/challenges':
          return <AdminChallenges />;
        case '/admin/users':
          return <AdminUsers />;
        case '/admin/resources':
          return <AdminResources />;
        case '/admin/settings':
          return <AdminSettings />;
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