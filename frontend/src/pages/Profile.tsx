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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center p-4">
            <button className="text-gray-700">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-gray-900 text-xl font-bold flex-1 text-center pr-8">Profile</h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 space-y-6">
          {activeTab === 'profile' ? (
            <>
              {/* Profile Information */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                    <p className="text-gray-600">{profile.email}</p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="text-gray-900">{profile.role}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">{profile.joinDate}</p>
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profile.studyStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.totalSessions}</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{profile.averageScore}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Notification Settings */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive email updates about your progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Study Reminders</h3>
                      <p className="text-sm text-gray-600">Get reminded to practice daily</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.studyReminders}
                        onChange={() => handleNotificationChange('studyReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Progress Reports</h3>
                      <p className="text-sm text-gray-600">Weekly summary of your achievements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications.progressReports}
                        onChange={() => handleNotificationChange('progressReports')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Account Actions */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">Change Password</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">Export Data</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">Privacy Policy</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">Terms of Service</span>
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-400">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-gray-600 mb-4">
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
        </main>

        {/* Bottom Navigation */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-200">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center justify-end gap-1 text-gray-500" href="#">
              <span className="material-symbols-outlined">home</span>
              <p className="text-xs font-medium">Home</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-gray-500" href="#">
              <span className="material-symbols-outlined">code</span>
              <p className="text-xs font-medium">Practice</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-gray-500" href="#">
              <span className="material-symbols-outlined">collections_bookmark</span>
              <p className="text-xs font-medium">Resources</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-[#137fec]" href="#">
              <span className="material-symbols-outlined">person</span>
              <p className="text-xs font-bold">Profile</p>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default Profile;