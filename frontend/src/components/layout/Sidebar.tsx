import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
  studentOnly?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed = false }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems: NavItem[] = [
    // Student menu items - only what students should see
    {
      to: '/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      studentOnly: true
    },
    {
      to: '/practice',
      icon: 'model_training',
      label: 'Practice',
      studentOnly: true
    },
    {
      to: '/challenges',
      icon: 'code_blocks',
      label: 'Challenges',
      studentOnly: true
    },
    {
      to: '/resources',
      icon: 'auto_stories',
      label: 'Resources',
      studentOnly: true
    },
    {
      to: '/interviews',
      icon: 'play_lesson',
      label: 'Interviews',
      studentOnly: true
    },
    {
      to: '/profile',
      icon: 'person',
      label: 'Profile',
      studentOnly: true
    },
    {
      to: '/help',
      icon: 'help',
      label: 'Help',
      studentOnly: true
    },
    // Admin menu items - only what admins should see
    {
      to: '/admin',
      icon: 'admin_panel_settings',
      label: 'Admin Panel',
      adminOnly: true
    },
    {
      to: '/admin/questions',
      icon: 'quiz',
      label: 'Questions',
      adminOnly: true
    },
    {
      to: '/admin/challenges',
      icon: 'code',
      label: 'Challenges',
      adminOnly: true
    },
    {
      to: '/admin/users',
      icon: 'people',
      label: 'Users',
      adminOnly: true
    },
    {
      to: '/admin/resources',
      icon: 'library_books',
      label: 'Admin Resources',
      adminOnly: true
    },
    {
      to: '/admin/session-templates',
      icon: 'assignment',
      label: 'Session Templates',
      adminOnly: true
    },
    {
      to: '/admin/practice-interview/templates',
      icon: 'fact_check',
      label: 'Practice & Interview',
      adminOnly: true
    },
    {
      to: '/admin/practice-interview/assignments',
      icon: 'group_work',
      label: 'Assignments',
      adminOnly: true
    },
    // Enhanced Question Bank
    {
      to: '/admin/question-bank',
      icon: 'library_books',
      label: 'Question Bank',
      adminOnly: true
    },
    // Groups Management
    {
      to: '/admin/groups',
      icon: 'groups',
      label: 'Groups',
      adminOnly: true
    },
    // Credits & Subscription
    {
      to: '/admin/credits',
      icon: 'account_balance_wallet',
      label: 'Credits & Plans',
      adminOnly: true
    },
    // Proctoring & Certificates
    {
      to: '/admin/proctoring',
      icon: 'verified_user',
      label: 'Proctoring',
      adminOnly: true
    },
    // Analytics & Reports
    {
      to: '/admin/analytics',
      icon: 'analytics',
      label: 'Analytics',
      adminOnly: true
    },
    {
      to: '/admin/logs',
      icon: 'description',
      label: 'System Logs',
      adminOnly: true
    },
    {
      to: '/admin/maintenance',
      icon: 'build',
      label: 'Maintenance',
      adminOnly: true
    },
    {
      to: '/admin/health',
      icon: 'health_and_safety',
      label: 'Health Status',
      adminOnly: true
    },
    {
      to: '/admin/settings',
      icon: 'settings',
      label: 'Settings',
      adminOnly: true
    }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const desktopTranslateClass = collapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0';
  const mobileTranslateClass = isOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 ${isOpen ? '' : 'hidden'} lg:hidden`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--card-background)] shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${mobileTranslateClass} ${desktopTranslateClass} lg:shadow-sm lg:border-r border-[var(--border-color)]`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b border-[var(--border-color)]">
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
              TechPrep
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                // Filter based on user role
                if (item.adminOnly && user?.role !== 'Admin') return null;
                if (item.studentOnly && user?.role !== 'Student') return null;
                
                const isActive = isActiveRoute(item.to);
                return (
                  <li key={item.to}>
                    <Link 
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive 
                          ? 'bg-[var(--primary-color-light)] text-[var(--primary-color)] font-semibold shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t border-[var(--border-color)]">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
