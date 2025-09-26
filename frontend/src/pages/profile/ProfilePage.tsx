import React, { useState, useRef } from 'react';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore, type Theme } from '@/stores/themeStore';
import type { UpdateProfileDto } from '@/types/api';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const { theme: currentTheme, setTheme } = useThemeStore();

  const [formData, setFormData] = useState<UpdateProfileDto>({
    firstName: '',
    lastName: '',
    language: 'en',
    theme: currentTheme, // Use the current theme from the store as default
  });

  const [isFormDirty, setIsFormDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        language: profile.language,
        theme: profile.theme,
      });
    }
  }, [profile]);

  // Sync the local theme store with the user's saved theme only on initial load
  React.useEffect(() => {
    if (profile && !isFormDirty) {
      // Only sync if form hasn't been modified by user
      if (profile.theme !== currentTheme) {
        setTheme(profile.theme);
      }
    }
  }, [profile]); // Remove currentTheme from dependencies to prevent loops

  const handleInputChange = (field: keyof UpdateProfileDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsFormDirty(true);

    // Apply theme immediately when user selects it
    if (field === 'theme') {
      setTheme(value as Theme);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(formData);
      setIsFormDirty(false);
      // Show success message (you could add a toast here)
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message (you could add a toast here)
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
      // Show success message
      console.log('Avatar uploaded successfully');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      // Show error message
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB.');
        return;
      }
      handleAvatarUpload(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const firstName = profile?.firstName || '';
    const lastName = profile?.lastName || '';
    return (firstName[0] || '').toUpperCase() + (lastName[0] || '').toUpperCase() || 'U';
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Please log in to view your profile.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('Profile error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          <div>Failed to load profile. Please try again.</div>
          <div className="text-sm mt-2">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-primary)' }}>
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your account information and preferences</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getInitials()}
                  </div>
                )}
                {uploadAvatarMutation.isPending && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Profile Picture</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Upload a profile picture. Recommended size: 400x400px, max 2MB
                </p>
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  disabled={uploadAvatarMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadAvatarMutation.isPending ? 'Uploading...' : 'Change Avatar'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-primary)',
                    borderWidth: '1px'
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-primary)',
                    borderWidth: '1px'
                  }}
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={profile?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm opacity-60"
                style={{
                  backgroundColor: 'var(--hover-background)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderWidth: '1px'
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Email cannot be changed</p>
            </div>

            {/* Language Selection */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Language
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value as 'en' | 'es')}
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                  borderWidth: '1px'
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Theme Preference
              </label>
              <div className="space-y-2">
                {[
                  { value: 'light', label: 'Light', description: 'Default light theme' },
                  { value: 'dark', label: 'Dark', description: 'Dark theme for low-light environments' },
                ].map((theme) => (
                  <label key={theme.value} className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={formData.theme === theme.value}
                      onChange={(e) => handleInputChange('theme', e.target.value as 'light' | 'dark' | 'blue')}
                      className="mt-1 h-4 w-4"
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{theme.label}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{theme.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (profile) {
                    setFormData({
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      language: profile.language,
                      theme: profile.theme,
                    });
                    setIsFormDirty(false);
                  }
                }}
                className="px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'var(--hover-background)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormDirty || updateProfileMutation.isPending}
                className="px-4 py-2 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;