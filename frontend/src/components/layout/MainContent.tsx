import React from 'react';
import { useLocation } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Practice from '@/pages/Practice';
import Challenges from '@/pages/Challenges';
import Resources from '@/pages/Resources';
import Profile from '@/pages/Profile';

const MainContent: React.FC = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/dashboard':
        return <Dashboard />;
      case '/practice':
        return <Practice />;
      case '/challenges':
        return <Challenges />;
      case '/resources':
        return <Resources />;
      case '/profile':
        return <Profile />;
      case '/admin':
        // TODO: Create Admin component
        return (
          <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Admin Panel</h2>
            <p className="text-[var(--text-secondary)]">Admin functionality coming soon...</p>
          </div>
        );
      default:
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