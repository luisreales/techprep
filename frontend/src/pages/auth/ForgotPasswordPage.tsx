import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const response = await apiClient.forgotPassword(email);

    if (response.success) {
      setMessage('If an account exists for this email, a reset link has been sent.');
    } else {
      setError(response.error?.message || 'Request failed');
    }

    setIsLoading(false);
  };

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
              Forgot password
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
