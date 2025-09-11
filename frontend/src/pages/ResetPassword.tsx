import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/services/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ general: 'Invalid or missing reset token' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiClient.resetPassword(token, formData.password);
      navigate('/login?message=Password reset successful');
    } catch (error) {
      console.error('Reset password failed:', error);
      setErrors({ general: 'Failed to reset password. The token may have expired.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!token) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-['Inter','Noto_Sans',sans-serif]">
          <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 text-center">
              <div>
                <span className="material-symbols-outlined text-6xl text-red-500">
                  error
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                  Invalid Reset Link
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  This password reset link is invalid or has expired.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link
                  to="/forgot-password"
                  className="flex w-full justify-center rounded-md border border-transparent bg-[#137fec] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:ring-offset-2"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  to="/login"
                  className="flex w-full justify-center rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Back to Sign In
                </Link>
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
                password
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Reset Your Password
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your new password below.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      lock
                    </span>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      lock
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[#137fec] focus:ring-[#137fec]"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
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
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
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

export default ResetPassword;