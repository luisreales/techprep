import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiClient.forgotPassword(email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-['Inter','Noto_Sans',sans-serif]">
          <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 text-center">
              <div>
                <span className="material-symbols-outlined text-6xl text-green-500">
                  mark_email_read
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                  Check Your Email
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Don't see the email? Check your spam folder or wait a few minutes and try again.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="flex w-full justify-center rounded-md border border-transparent bg-[#137fec] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:ring-offset-2"
                >
                  Back to Sign In
                </Link>
                
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="flex w-full justify-center rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-['Inter','Noto_Sans',sans-serif]">
        <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-[#137fec]">
                lock_reset
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Forgot Password?
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                    email
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-[#137fec] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-[#137fec] flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">
                      arrow_back
                    </span>
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;