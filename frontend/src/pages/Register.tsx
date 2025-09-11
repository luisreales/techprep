import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { RegisterDto } from '@/types/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const [formData, setFormData] = useState<RegisterDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleInputChange = (field: keyof RegisterDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-gray-50" style={{ minHeight: 'max(884px, 100dvh)' }}>
      <div 
        className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" 
        style={{ 
          fontFamily: 'Inter, "Noto Sans", sans-serif',
          '--select-button-svg': 'url(\'data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(156, 163, 175)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M215.39,92.61l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,1,1,11.32-11.32L128,154.69l74.07-73.4a8,8,0,0,1,11.32,11.32Z%27%3e%3c/path%3e%3c/svg%3e)',
          '--primary-color': '#137fec'
        } as React.CSSProperties
      }>
        <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-[var(--primary-color)]">
                code
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Welcome to TechPrep
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Your journey to acing tech interviews starts here.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      person
                    </span>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      person
                    </span>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      email
                    </span>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      lock
                    </span>
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
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
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      className="form-input w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
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
                  className="flex w-full justify-center rounded-md border border-transparent bg-[var(--primary-color)] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-[var(--primary-color)] hover:text-blue-500"
                    >
                      Sign in
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;