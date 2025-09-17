import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminMaintenanceApi, BackupInfoDto } from '@/services/admin/adminMaintenanceApi';

const AdminMaintenancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Fetch existing backups
  const { data: backups, isLoading: backupsLoading } = useQuery({
    queryKey: ['adminBackups'],
    queryFn: adminMaintenanceApi.listBackups,
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: adminMaintenanceApi.backup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
      setUploadStatus(`Backup created successfully: ${data.fileName}`);
      setTimeout(() => setUploadStatus(''), 5000);
    },
    onError: (error) => {
      setUploadStatus(`Failed to create backup: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    },
  });

  // Restore backup mutation
  const restoreMutation = useMutation({
    mutationFn: adminMaintenanceApi.restore,
    onSuccess: (data) => {
      setUploadStatus(`Restore result: ${data.status}${data.message ? ` - ${data.message}` : ''}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setUploadStatus(''), 10000);
    },
    onError: (error) => {
      setUploadStatus(`Failed to restore backup: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        setUploadStatus('Please select a .zip file');
        setTimeout(() => setUploadStatus(''), 3000);
        return;
      }
      restoreMutation.mutate(file);
    }
  };

  const downloadBackup = async (backup: BackupInfoDto) => {
    try {
      const blob = await adminMaintenanceApi.downloadBackup(backup.fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setUploadStatus(`Failed to download backup: ${error.message}`);
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">System Maintenance</h1>
        <p className="text-[var(--text-secondary)]">
          Backup and restore your TechPrep database and system files.
        </p>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`p-4 rounded-lg ${uploadStatus.includes('Failed') || uploadStatus.includes('error')
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {uploadStatus}
        </div>
      )}

      {/* Create Backup Section */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
          <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">
            backup
          </span>
          Create New Backup
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Create a complete backup of your database, logs, and system files. The backup will be saved as a ZIP file.
        </p>
        <button
          onClick={handleCreateBackup}
          disabled={createBackupMutation.isPending}
          className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {createBackupMutation.isPending && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span className="material-symbols-outlined">backup</span>
          <span>{createBackupMutation.isPending ? 'Creating Backup...' : 'Create Backup'}</span>
        </button>
      </div>

      {/* Existing Backups Section */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
          <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">
            folder_zip
          </span>
          Existing Backups
        </h2>

        {backupsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
              <span className="text-[var(--text-secondary)]">Loading backups...</span>
            </div>
          </div>
        ) : backups && backups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {backup.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(backup.sizeBytes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => downloadBackup(backup)}
                        className="text-[var(--primary-color)] hover:text-indigo-700 font-medium flex items-center space-x-1"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">
              folder_open
            </span>
            No backups found. Create your first backup to get started.
          </div>
        )}
      </div>

      {/* Restore Backup Section */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
          <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">
            restore
          </span>
          Restore from Backup
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <span className="material-symbols-outlined text-yellow-600 mr-2 mt-0.5">
              warning
            </span>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Restoring a backup will replace all current data. This action cannot be undone.
                Make sure to create a backup of your current system before proceeding.
              </p>
            </div>
          </div>
        </div>
        <p className="text-[var(--text-secondary)] mb-4">
          Upload a ZIP backup file to restore your system. The system may require restart after restoration.
        </p>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileUpload}
            disabled={restoreMutation.isPending}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-color)] file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer disabled:opacity-50"
          />
          {restoreMutation.isPending && (
            <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary-color)]"></div>
              <span>Restoring...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMaintenancePage;