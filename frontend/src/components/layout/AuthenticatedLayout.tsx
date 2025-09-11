import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MainContent from './MainContent';

const AuthenticatedLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const rootStyle: React.CSSProperties = {
    '--primary-color': '#4f46e5',
    '--primary-color-light': '#e0e7ff',
    '--background-color': '#f8fafc',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--card-background': '#ffffff',
    '--border-color': '#e2e8f0',
    '--accent-color': '#10b981',
  } as React.CSSProperties;

  return (
    <div className="flex min-h-screen bg-[var(--background-color)]" style={rootStyle}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top Navbar */}
        <TopNavbar onMenuToggle={toggleSidebar} />

        {/* Main Content Area */}
        <MainContent />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;