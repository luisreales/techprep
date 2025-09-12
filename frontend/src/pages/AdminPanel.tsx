import React from 'react';

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Admin Panel</h1>
        <p className="text-[var(--text-secondary)]">
          Welcome to the TechPrep Admin Panel. Manage users, questions, topics, and system settings.
        </p>
      </div>

      {/* Admin Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: 'people', value: '1,234', label: 'Total Users', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { icon: 'quiz', value: '567', label: 'Questions', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
          { icon: 'category', value: '25', label: 'Topics', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          { icon: 'assignment', value: '8,901', label: 'Sessions', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--card-background)] rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${stat.iconBg}`}>
              <span className={`material-symbols-outlined text-2xl ${stat.iconColor}`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <span className="material-symbols-outlined text-xl text-blue-600">manage_accounts</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">User Management</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            Manage user accounts, roles, and permissions.
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Manage Users
          </button>
        </div>

        {/* Question Management */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <span className="material-symbols-outlined text-xl text-green-600">quiz</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Questions & Topics</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            Create, edit, and organize practice questions.
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Manage Questions
          </button>
        </div>

        {/* Import/Export */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
              <span className="material-symbols-outlined text-xl text-purple-600">upload_file</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Import/Export</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            Bulk import questions from Excel or export data.
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Import/Export
          </button>
        </div>

        {/* Analytics */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
              <span className="material-symbols-outlined text-xl text-orange-600">analytics</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Analytics</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            View detailed analytics and usage reports.
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            View Analytics
          </button>
        </div>

        {/* System Settings */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
              <span className="material-symbols-outlined text-xl text-red-600">settings</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">System Settings</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            Configure system-wide settings and preferences.
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Settings
          </button>
        </div>

        {/* Backup & Recovery */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
              <span className="material-symbols-outlined text-xl text-gray-600">backup</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Backup & Recovery</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            Manage database backups and system recovery.
          </p>
          <button className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Backup Data
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Admin Activity</h2>
        <div className="space-y-3">
          {[
            { user: 'John Doe', action: 'Created new question in JavaScript topic', time: '2 minutes ago' },
            { user: 'Jane Smith', action: 'Uploaded 50 questions via Excel import', time: '15 minutes ago' },
            { user: 'Mike Wilson', action: 'Updated user permissions for sarah@example.com', time: '1 hour ago' },
            { user: 'Admin', action: 'System backup completed successfully', time: '2 hours ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary-color-light)]">
                <span className="material-symbols-outlined text-sm text-[var(--primary-color)]">person</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;