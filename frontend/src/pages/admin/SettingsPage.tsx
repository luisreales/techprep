import React, { useState, useEffect } from 'react';
import { useSettings, useSaveSettings } from '@/hooks/useAdminSettings';
import { SettingUpdateDto } from '@/services/admin/adminSettingsApi';

interface SettingFormData {
  practiceThresholdWritten: number;
  practiceInterviewRequired: number;
  importMaxFileSize: number;
  importMaxQuestions: number;
}

const SettingsPage: React.FC = () => {
  const { data: settings, isLoading, error } = useSettings();
  const saveSettingsMutation = useSaveSettings();

  const [formData, setFormData] = useState<SettingFormData>({
    practiceThresholdWritten: 80,
    practiceInterviewRequired: 100,
    importMaxFileSize: 10,
    importMaxQuestions: 1000,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings into form when data is available
  useEffect(() => {
    if (settings) {
      const newFormData = {
        practiceThresholdWritten: parseInt(settings['Practice.ThresholdWritten.Default'] || '80'),
        practiceInterviewRequired: parseInt(settings['Practice.Interview.RequiredPercent'] || '100'),
        importMaxFileSize: parseInt(settings['Import.MaxFileSizeInMB'] || '10'),
        importMaxQuestions: parseInt(settings['Import.MaxQuestionsPerImport'] || '1000'),
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [settings]);

  const handleInputChange = (field: keyof SettingFormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const payload: SettingUpdateDto[] = [
        {
          key: 'Practice.ThresholdWritten.Default',
          value: String(formData.practiceThresholdWritten),
          type: 'int',
          description: 'Default threshold percentage for written questions'
        },
        {
          key: 'Practice.Interview.RequiredPercent',
          value: String(formData.practiceInterviewRequired),
          type: 'int',
          description: 'Required percentage for interview mode'
        },
        {
          key: 'Import.MaxFileSizeInMB',
          value: String(formData.importMaxFileSize),
          type: 'int',
          description: 'Maximum file size for Excel imports'
        },
        {
          key: 'Import.MaxQuestionsPerImport',
          value: String(formData.importMaxQuestions),
          type: 'int',
          description: 'Maximum number of questions per import'
        },
      ];

      await saveSettingsMutation.mutateAsync(payload);
      setHasChanges(false);

      // Show success toast (you can implement a toast system)
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    if (settings) {
      const resetFormData = {
        practiceThresholdWritten: parseInt(settings['Practice.ThresholdWritten.Default'] || '80'),
        practiceInterviewRequired: parseInt(settings['Practice.Interview.RequiredPercent'] || '100'),
        importMaxFileSize: parseInt(settings['Import.MaxFileSizeInMB'] || '10'),
        importMaxQuestions: parseInt(settings['Import.MaxQuestionsPerImport'] || '1000'),
      };
      setFormData(resetFormData);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
          <span className="text-[var(--text-secondary)]">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-red-700">Error Loading Settings</h1>
        <p className="mt-2 text-red-600">Failed to load system settings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">System Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Configure system parameters for practice sessions and data imports.
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <form className="space-y-8">
          {/* Practice Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">
                model_training
              </span>
              Practice Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="practiceThresholdWritten" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Default Threshold for Written Questions (%)
                </label>
                <input
                  type="number"
                  id="practiceThresholdWritten"
                  min="60"
                  max="100"
                  value={formData.practiceThresholdWritten}
                  onChange={(e) => handleInputChange('practiceThresholdWritten', parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Minimum score percentage required for written questions (60-100)
                </p>
              </div>

              <div>
                <label htmlFor="practiceInterviewRequired" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Interview Mode Required Percentage (%)
                </label>
                <input
                  type="number"
                  id="practiceInterviewRequired"
                  min="80"
                  max="100"
                  value={formData.practiceInterviewRequired}
                  onChange={(e) => handleInputChange('practiceInterviewRequired', parseInt(e.target.value) || 80)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Required percentage for interview mode practice (80-100)
                </p>
              </div>
            </div>
          </div>

          {/* Import Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center">
              <span className="material-symbols-outlined text-2xl mr-2 text-[var(--primary-color)]">
                upload_file
              </span>
              Import Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="importMaxFileSize" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  id="importMaxFileSize"
                  min="1"
                  max="50"
                  value={formData.importMaxFileSize}
                  onChange={(e) => handleInputChange('importMaxFileSize', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Maximum file size for Excel imports (1-50 MB)
                </p>
              </div>

              <div>
                <label htmlFor="importMaxQuestions" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Maximum Questions per Import
                </label>
                <input
                  type="number"
                  id="importMaxQuestions"
                  min="100"
                  max="5000"
                  value={formData.importMaxQuestions}
                  onChange={(e) => handleInputChange('importMaxQuestions', parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Maximum number of questions per import operation (100-5000)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || saveSettingsMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saveSettingsMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] border border-transparent rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saveSettingsMutation.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;