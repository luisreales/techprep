import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { http } from '@/utils/axios';

export const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid confirmation link. Token and email are required.');
        return;
      }

      try {
        const response = await http.get(`/auth/confirm-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        setStatus('success');
        setMessage(response.data.message || 'Email confirmed successfully. You can now log in.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email confirmation failed. The token may be invalid or expired.');
      }
    };

    confirmEmail();
  }, [searchParams]);

  const rootStyle: React.CSSProperties = {
    '--primary-color': '#4f46e5',
    '--primary-color-light': '#e0e7ff',
    '--background-color': '#f8fafc',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--card-background': '#ffffff',
    '--border-color': '#e2e8f0',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-color)] py-12 px-4 sm:px-6 lg:px-8" style={rootStyle}>
      <div className="max-w-md w-full">
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                TechPrep
              </span>
            </div>

            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Confirming your email...
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Email Confirmed!
                </h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  {message}
                </p>
                <Link
                  to="/login"
                  className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 inline-block text-center"
                >
                  Continue to Login
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Confirmation Failed
                </h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 inline-block text-center"
                  >
                    Try Registering Again
                  </Link>
                  <Link
                    to="/login"
                    className="w-full border border-[var(--border-color)] text-[var(--text-primary)] py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-color-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 inline-block text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};