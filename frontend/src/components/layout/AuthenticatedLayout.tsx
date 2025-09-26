import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MainContent from './MainContent';

const AuthenticatedLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => !prev);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (location.pathname.startsWith('/admin/question-bank')) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [location.pathname]);

  const showCollapseToggle = location.pathname.startsWith('/admin/question-bank');

  return (
    <div className="flex min-h-screen bg-[var(--background-color)]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-10' : 'lg:pl-64'}`}>
        {/* Top Navbar */}
        <TopBar
          onMenuToggle={toggleSidebar}
          onCollapseToggle={toggleSidebarCollapsed}
          isSidebarCollapsed={sidebarCollapsed}
          showCollapseToggle={showCollapseToggle}
        />

        {/* Main Content Area */}
        <MainContent />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
