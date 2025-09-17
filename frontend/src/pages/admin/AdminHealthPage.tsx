import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminHealthApi, HealthStatusDto } from '@/services/admin/adminHealthApi';

const AdminHealthPage: React.FC = () => {
  const { data: health, isLoading, error, refetch } = useQuery({
    queryKey: ['adminHealth'],
    queryFn: adminHealthApi.get,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env.toLowerCase()) {
      case 'production':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'staging':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'development':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const openPublicHealthEndpoint = () => {
    window.open('/health', '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
          <span className="text-[var(--text-secondary)]">Checking system health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-red-700">Health Check Failed</h1>
        <p className="mt-2 text-red-600">Failed to retrieve system health status. Please try again.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">System Health</h1>
            <p className="text-[var(--text-secondary)]">
              Monitor system status, database connectivity, and resource usage.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Overall Status</h2>
        <div className="flex items-center space-x-4">
          <div className={`px-6 py-3 rounded-lg border-2 ${getStatusColor(health?.status || 'unknown')}`}>
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-2xl">
                {health?.status?.toLowerCase() === 'healthy' || health?.status?.toLowerCase() === 'up'
                  ? 'check_circle'
                  : health?.status?.toLowerCase() === 'unhealthy' || health?.status?.toLowerCase() === 'down'
                  ? 'error'
                  : 'warning'}
              </span>
              <span className="text-lg font-semibold">{health?.status || 'Unknown'}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border ${getEnvironmentColor(health?.environment || 'unknown')}`}>
            <span className="font-medium">{health?.environment || 'Unknown'} Environment</span>
          </div>
        </div>
      </div>

      {/* System Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Health */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center">
            <span className="material-symbols-outlined text-xl mr-2 text-[var(--primary-color)]">
              storage
            </span>
            Database
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Connectivity</span>
              <div className="flex items-center space-x-2">
                <span className={`material-symbols-outlined text-sm ${health?.dbOk ? 'text-green-600' : 'text-red-600'}`}>
                  {health?.dbOk ? 'check_circle' : 'error'}
                </span>
                <span className={health?.dbOk ? 'text-green-600' : 'text-red-600'}>
                  {health?.dbOk ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Pending Migrations</span>
              <span className={`font-medium ${(health?.pendingMigrations || 0) > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {health?.pendingMigrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Database Size</span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatBytes(health?.dbSizeBytes || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* System Resources */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center">
            <span className="material-symbols-outlined text-xl mr-2 text-[var(--primary-color)]">
              memory
            </span>
            System Resources
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Free Disk Space</span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatBytes(health?.freeDiskBytes || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Disk Usage Warning</span>
              <span className={`font-medium ${(health?.freeDiskBytes || 0) < (1024 * 1024 * 1024) ? 'text-yellow-600' : 'text-green-600'}`}>
                {(health?.freeDiskBytes || 0) < (1024 * 1024 * 1024) ? 'Low Space' : 'Normal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Monitoring */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center">
          <span className="material-symbols-outlined text-xl mr-2 text-[var(--primary-color)]">
            bug_report
          </span>
          Error Monitoring
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">Last Error Timestamp</span>
          <span className={`font-medium ${health?.lastErrorAt ? 'text-yellow-600' : 'text-green-600'}`}>
            {health?.lastErrorAt
              ? new Date(health.lastErrorAt).toLocaleString()
              : 'No recent errors'
            }
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={openPublicHealthEndpoint}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>Open Public Health Endpoint</span>
          </button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Status Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Healthy / Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Warning / Degraded</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Error / Unhealthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHealthPage;