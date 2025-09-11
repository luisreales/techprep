import React, { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  role: 'Student' | 'Admin';
  joinDate: string;
  studyStreak: number;
  totalSessions: number;
  averageScore: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  studyReminders: boolean;
  progressReports: boolean;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Student',
    joinDate: 'January 2024',
    studyStreak: 12,
    totalSessions: 45,
    averageScore: 85
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    studyReminders: true,
    progressReports: false
  });

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Here you would typically make an API call to save the profile
    console.log('Profile saved:', editedProfile);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Here you would typically make an API call to save the settings
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Here you would implement account deletion
      console.log('Account deletion requested');
      alert('Account deletion functionality would be implemented here');
    }
  };

  return (
    <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-1 flex">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors rounded-lg ${
              activeTab === 'profile'
                ? 'bg-[var(--primary-color)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors rounded-lg ${
              activeTab === 'settings'
                ? 'bg-[var(--primary-color)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'profile' ? (
            <>
              {/* Profile Information */}
              <section className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[var(--primary-color)] hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="text-[var(--text-secondary)] hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="text-[var(--primary-color)] hover:text-blue-700 font-medium"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-color-light)] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--primary-color)]">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{profile.name}</h3>
                    <p className="text-[var(--text-secondary)]">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-[var(--text-primary)]">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <p className="text-[var(--text-primary)]">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="text-[var(--text-primary)]">{profile.role}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-[var(--text-primary)]">{profile.joinDate}</p>
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <section className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Your Progress</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">{profile.studyStreak}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.totalSessions}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{profile.averageScore}%</div>
                    <div className="text-sm text-[var(--text-secondary)]">Average Score</div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Notification Settings */}
              <section className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Email Notifications</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Receive email updates about your progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Study Reminders</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Get reminded to practice daily</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.studyReminders}
                        onChange={() => handleNotificationChange('studyReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">Progress Reports</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Weekly summary of your achievements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.progressReports}
                        onChange={() => handleNotificationChange('progressReports')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Account Actions */}
              <section className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Account</h2>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-primary)]">Change Password</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-primary)]">Export Data</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-primary)]">Privacy Policy</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-primary)]">Terms of Service</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-400">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </section>
            </>
          )}
        </div>
    </div>
  );
};

export default Profile;