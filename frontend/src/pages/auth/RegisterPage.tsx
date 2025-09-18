import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';

const schema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } =
    useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values: RegisterForm) => {
    clearError();
    const success = await registerUser({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (success) {
      setRegistrationSuccess(true);
    }
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
              {registrationSuccess ? 'Check your email!' : 'Create your account'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {registrationSuccess ? (
                'We sent you a confirmation link to complete your registration.'
              ) : (
                <>
                  Or{' '}
                  <Link to="/login" className="font-medium text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 transition-colors">
                    sign in to your account
                  </Link>
                </>
              )}
            </p>
          </div>

          {registrationSuccess ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[var(--text-primary)] font-medium">
                  Registration successful!
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Please check your email and click the confirmation link to activate your account.
                  After confirming, you'll be able to sign in.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 inline-block text-center"
                >
                  Continue to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                    placeholder="Enter your first name"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                    placeholder="Enter your last name"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                  placeholder="Enter your email address"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all"
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};
