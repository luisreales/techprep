import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/useProfile';
import { UserRole } from '@/types/api';

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth/login');
    setIsDropdownOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const firstName = profile?.firstName || user?.firstName || '';
    const lastName = profile?.lastName || user?.lastName || '';
    return (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase() || 'U';
  };

  // Get avatar source (profile avatar or fallback to initials)
  const avatarSrc = profile?.avatarUrl;

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
              {profile?.firstName || user?.firstName ? `Welcome Back, ${profile?.firstName || user?.firstName}!` : 'Welcome Back!'}
            </h1>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors p-2 rounded-lg hover:bg-gray-50">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                ref={buttonRef}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
                onClick={handleToggleDropdown}
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                aria-label="User menu"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Profile Link */}
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-lg mr-3">person</span>
                    Profile
                  </button>

                  {/* Settings Link (Admin only) */}
                  {user?.role === UserRole.Admin && (
                    <>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => handleNavigation('/admin/settings')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        <span className="material-symbols-outlined text-lg mr-3">settings</span>
                        Settings
                      </button>
                    </>
                  )}

                  {/* Sign Out */}
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    role="menuitem"
                  >
                    <span className="material-symbols-outlined text-lg mr-3">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;