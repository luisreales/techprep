import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ResetPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reset password functionality
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-color)] py-12 px-4 sm:px-6 lg:px-8" style={rootStyle}>
      <div className="max-w-md w-full">
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                TechPrep
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Reset your password
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Enter your new password below
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm font-medium text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
