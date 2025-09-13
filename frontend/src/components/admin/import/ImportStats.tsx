import React from 'react';
import { ImportSummary } from '@/schemas/importSchema';
import { CheckCircle, XCircle, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { questionTypeLabels } from '@/utils/enums';

interface ImportStatsProps {
  summary: ImportSummary;
  className?: string;
}

export const ImportStats: React.FC<ImportStatsProps> = ({ summary, className = '' }) => {
  const validPercentage = summary.total > 0 ? Math.round((summary.valid / summary.total) * 100) : 0;
  const invalidPercentage = 100 - validPercentage;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Rows */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Rows</p>
              <p className="text-2xl font-bold text-blue-900">{summary.total}</p>
            </div>
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Valid Rows */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Valid Rows</p>
              <p className="text-2xl font-bold text-green-900">{summary.valid}</p>
              <p className="text-xs text-green-700">{validPercentage}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Invalid Rows */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Invalid Rows</p>
              <p className="text-2xl font-bold text-red-900">{summary.invalid}</p>
              <p className="text-xs text-red-700">{invalidPercentage}%</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {summary.total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Validation Progress</span>
            <span>{summary.valid}/{summary.total} rows valid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${validPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Breakdown by Question Type */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Breakdown by Question Type
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Single Choice */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Single Choice</p>
              <p className="text-xs text-gray-600">{questionTypeLabels.single_choice}</p>
            </div>
            <span className="text-lg font-bold text-blue-600">{summary.byType.single_choice}</span>
          </div>

          {/* Multiple Choice */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Multiple Choice</p>
              <p className="text-xs text-gray-600">{questionTypeLabels.multi_choice}</p>
            </div>
            <span className="text-lg font-bold text-purple-600">{summary.byType.multi_choice}</span>
          </div>

          {/* Written */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Written</p>
              <p className="text-xs text-gray-600">{questionTypeLabels.written}</p>
            </div>
            <span className="text-lg font-bold text-green-600">{summary.byType.written}</span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      {summary.total > 0 && (
        <div className="flex items-center space-x-4 text-sm">
          {summary.valid > 0 && (
            <div className="flex items-center text-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              {summary.valid} ready to import
            </div>
          )}
          {summary.invalid > 0 && (
            <div className="flex items-center text-red-700">
              <XCircle className="h-4 w-4 mr-1" />
              {summary.invalid} need fixes
            </div>
          )}
        </div>
      )}
    </div>
  );
};