import React from 'react';
import { useAuthStore } from '@/stores/authStore';

interface TopNavbarProps {
  onMenuToggle: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuToggle }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-[var(--card-background)] shadow-sm sticky top-0 z-30 border-b border-[var(--border-color)]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-[var(--text-primary)] hover:text-[var(--primary-color)] transition-colors"
            onClick={onMenuToggle}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Welcome message */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-[var(--text-primary)] lg:text-2xl">
              {user?.firstName ? `Welcome Back, ${user.firstName}!` : 'Welcome Back!'}
            </h1>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors p-2 rounded-lg hover:bg-gray-50">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-sm">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;