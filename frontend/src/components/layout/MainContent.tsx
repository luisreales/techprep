import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Practice from '@/pages/Practice';
import { PracticeRunnerPage } from '@/pages/practice/PracticeRunnerPage';
import PracticeReview from '@/pages/practice/PracticeReview';
import { InterviewRunnerPage } from '@/pages/interviews/InterviewRunnerPage';
import { InterviewResultsPage } from '@/pages/interviews/InterviewResultsPage';
import InterviewRunner from '@/pages/interviews/InterviewRunner';
import InterviewSummary from '@/pages/interviews/InterviewSummary';
import InterviewReview from '@/pages/interviews/InterviewReview';
import Interviews from '@/pages/Interviews';
import Challenges from '@/pages/Challenges';
import ChallengeDetail from '@/pages/ChallengeDetail';
import Resources from '@/pages/Resources';
import ProfilePage from '@/pages/profile/ProfilePage';
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
import TemplatesPage from '@/pages/admin/practice-interview/TemplatesPage';
import TemplateFormPage from '@/pages/admin/practice-interview/TemplateFormPage';
import TemplatePreviewPage from '@/pages/admin/practice-interview/TemplatePreviewPage';
import AssignmentsPage from '@/pages/admin/practice-interview/AssignmentsPage';
import AssignmentFormPage from '@/pages/admin/practice-interview/AssignmentFormPage';
// New enhanced pages
import QuestionBank from '@/pages/admin/QuestionBank';
import GroupsManagement from '@/pages/admin/GroupsManagement';
import CreditsManagement from '@/pages/admin/CreditsManagement';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';

// Placeholder components for new admin pages - will be replaced with actual implementations
const AdminImport = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Excel Import</h1><p className="mt-4 text-gray-600">Excel import interface coming soon...</p></div>;
const ProctoringPage = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Proctoring & Certificates</h1><p className="mt-4 text-gray-600">Proctoring policies and certificate management interface coming soon...</p></div>;
const AnalyticsPage = () => <div className="p-6 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Analytics & Reports</h1><p className="mt-4 text-gray-600">Comprehensive analytics dashboard coming soon...</p></div>;

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
        '/admin/settings',
        '/admin/practice-interview/templates',
        '/admin/practice-interview/assignments'
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

      if (location.pathname.startsWith('/admin/practice-interview/templates/')) {
        if (location.pathname.endsWith('/new')) return <TemplateFormPage />;
        if (location.pathname.endsWith('/edit')) return <TemplateFormPage />;
        if (location.pathname.endsWith('/preview')) return <TemplatePreviewPage />;
      }

      if (location.pathname.startsWith('/admin/practice-interview/assignments/')) {
        if (location.pathname.endsWith('/new')) return <AssignmentFormPage />;
        if (location.pathname.endsWith('/edit')) return <AssignmentFormPage />;
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
        case '/admin/practice-interview/templates':
          return <TemplatesPage />;
        case '/admin/practice-interview/assignments':
          return <AssignmentsPage />;
        case '/admin/question-bank':
          return <QuestionBank />;
        case '/admin/groups':
          return <GroupsManagement />;
        case '/admin/credits':
          return <CreditsManagement />;
        case '/admin/proctoring':
          return <ProctoringPage />;
        case '/admin/analytics':
          return <AnalyticsPage />;
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
      case '/practice/runner':
        return <PracticeRunnerPage />;
      case '/sessions':
      case '/interviews':
        return <Interviews />;
      case '/challenges':
        return <Challenges />;
      case '/resources':
        return <Resources />;
      case '/profile':
        return <ProfilePage />;
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
        // Handle practice session route (/practice/session/:sessionId)
        if (location.pathname.match(/^\/practice\/session\/[^/]+$/)) {
          return <PracticeRunnerPage />;
        }
        // Handle practice review route (/practice/review/:sessionId)
        if (location.pathname.match(/^\/practice\/review\/[^/]+$/)) {
          return <PracticeReview />;
        }
        // Handle practice summary route (/practice/summary/:sessionId)
        if (location.pathname.match(/^\/practice\/summary\/[^/]+$/)) {
          return <div className="text-center p-8"><h1 className="text-2xl font-bold mb-4">Practice Complete!</h1><p>Practice summary page coming soon...</p></div>;
        }
        // Handle new interview runner route with sessionId (/interviews/runner/:id)
        if (location.pathname.match(/^\/interviews\/runner\/[^/]+$/)) {
          const pathParts = location.pathname.split('/');
          const sessionId = pathParts[3];
          console.log('Router: sessionId =', sessionId);
          // Check if it's a UUID (new interview runner) vs templateId (old)
          // UUID pattern: 8-4-4-4-12 hex characters with hyphens
          const isUUID = sessionId.match(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/);
          console.log('Router: isUUID =', isUUID);
          if (isUUID) {
            console.log('Router: Using InterviewRunner for UUID sessionId');
            return <InterviewRunner />;
          } else {
            console.log('Router: Using InterviewRunnerPage for templateId');
            return <InterviewRunnerPage />;
          }
        }
        // Handle interview summary route
        if (location.pathname.match(/^\/interviews\/summary\/[^/]+$/)) {
          return <InterviewSummary />;
        }
        // Handle interview review route
        if (location.pathname.match(/^\/interviews\/review\/[^/]+$/)) {
          return <InterviewReview />;
        }
        // Handle interview results route with sessionId
        if (location.pathname.match(/^\/interviews\/[^/]+\/results$/)) {
          return <InterviewResultsPage />;
        }
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
