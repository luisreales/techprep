import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminUsersApi } from '@/services/admin/usersApi';
import { questionsApi } from '@/services/admin/questionsApi';
import { topicsApi } from '@/services/admin/topicsApi';
import { adminMetricsApi } from '@/services/admin/adminMetricsApi';

const AdminPanel: React.FC = () => {
  // Fetch global metrics
  const { data: globalMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['adminMetrics', 'global'],
    queryFn: adminMetricsApi.getGlobal,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch totals for backwards compatibility
  const { data: usersData } = useQuery({
    queryKey: ['admin','users','count'],
    queryFn: () => adminUsersApi.getUsers({ page: 1, pageSize: 1 }),
  });
  const { data: questionsData } = useQuery({
    queryKey: ['admin','questions','count'],
    queryFn: () => questionsApi.list({ page: 1, limit: 1 }),
  });
  const { data: topicsData } = useQuery({
    queryKey: ['admin','topics','count'],
    queryFn: () => topicsApi.list(),
  });

  // Use global metrics if available, fallback to individual API calls
  const totalUsers = globalMetrics?.totalUsers ?? usersData?.total ?? usersData?.items?.length ?? 0;
  const totalQuestions = globalMetrics?.totalQuestions ?? questionsData?.data?.total ?? 0;
  const totalTopics = globalMetrics?.totalTopics ?? topicsData?.data?.length ?? 0;
  const totalSessions = globalMetrics?.totalSessions ?? 0;

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
          { icon: 'people', value: totalUsers.toLocaleString(), label: 'Total Users', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { icon: 'quiz', value: totalQuestions.toLocaleString(), label: 'Questions', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
          { icon: 'category', value: totalTopics.toLocaleString(), label: 'Topics', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          { icon: 'assignment', value: totalSessions.toLocaleString(), label: 'Sessions', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
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

      {/* Enhanced Global Metrics */}
      {globalMetrics && (
        <>
          {/* Performance & Activity Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance KPIs */}
            <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center">
                  <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">speed</span>
                  Performance Metrics
                </h2>
                {metricsLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--primary-color)]"></div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">{globalMetrics.avgAccuracy?.toFixed(1) ?? '0.0'}%</p>
                  <p className="text-sm text-green-700">Average Accuracy</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{globalMetrics.completionRate?.toFixed(1) ?? '0.0'}%</p>
                  <p className="text-sm text-blue-700">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-600">{globalMetrics.activeUsers?.toLocaleString() ?? '0'}</p>
                  <p className="text-sm text-purple-700">Active Users (30d)</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-2xl font-bold text-orange-600">{globalMetrics.avgSessionDuration?.toFixed(1) ?? '0.0'}m</p>
                  <p className="text-sm text-orange-700">Avg Session Duration</p>
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
                <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">trending_up</span>
                Activity Trends (7 Days)
              </h2>
              {globalMetrics.activityData && globalMetrics.activityData.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-32 space-x-2">
                    {globalMetrics.activityData.slice(-7).map((point, index) => {
                      const maxValue = Math.max(...globalMetrics.activityData.map(p => p.value));
                      const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-[var(--primary-color)] to-[var(--primary-color)]/60 rounded-t-lg transition-all duration-300 hover:opacity-80"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                            title={`${new Date(point.date).toLocaleDateString()}: ${point.value}`}
                          />
                          <div className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                            {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center text-sm text-[var(--text-secondary)]">
                    Daily Sessions
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-[var(--text-secondary)]">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">
                      bar_chart
                    </span>
                    No activity data available
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Topic Performance Analysis */}
          {globalMetrics.topicAccuracy && globalMetrics.topicAccuracy.length > 0 && (
            <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center">
                <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">psychology</span>
                Topic Performance Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalMetrics.topicAccuracy.slice(0, 6).map((topic, index) => {
                  const accuracyColor = topic.accuracy >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
                                       topic.accuracy >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                       'text-red-600 bg-red-50 border-red-200';
                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{topic.topicName}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${accuracyColor}`}>
                          {topic.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)]/80 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${topic.accuracy}%` }}
                        />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {topic.totalQuestions} questions
                      </p>
                    </div>
                  );
                })}
              </div>
              {globalMetrics.topicAccuracy.length > 6 && (
                <div className="text-center mt-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Showing top 6 topics. {globalMetrics.topicAccuracy.length - 6} more topics available.
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

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
          <Link to="/admin/users" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Manage Users
          </Link>
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
          <Link to="/admin/questions" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Manage Questions
          </Link>
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
          <Link to="/admin/import" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Import Questions
          </Link>
        </div>

        {/* Analytics */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
              <span className="material-symbols-outlined text-xl text-orange-600">analytics</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">System Logs</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            View system activity logs and error monitoring.
          </p>
          <Link to="/admin/logs" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            View Logs
          </Link>
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
          <Link to="/admin/settings" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Settings
          </Link>
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
          <Link to="/admin/maintenance" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Maintenance
          </Link>
        </div>

        {/* Health Monitoring */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <span className="material-symbols-outlined text-xl text-green-600">health_and_safety</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Health Monitor</h3>
          </div>
          <p className="text-[var(--text-secondary)] mb-4 text-sm">
            Monitor system health and dependencies status.
          </p>
          <Link to="/admin/health" className="block text-center w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Health Status
          </Link>
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
