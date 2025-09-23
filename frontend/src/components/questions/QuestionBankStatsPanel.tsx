import React from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  Target
} from 'lucide-react';
import { QuestionBankStats } from '@/services/questionBankApi';

interface QuestionBankStatsPanelProps {
  stats: QuestionBankStats;
}

const QuestionBankStatsPanel: React.FC<QuestionBankStatsPanelProps> = ({ stats }) => {
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Question Bank Statistics</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={<FileText size={20} className="text-white" />}
          color="bg-blue-500"
          subtitle="Questions in bank"
        />

        <StatCard
          title="Verification Rate"
          value={formatPercentage(stats.verificationRate)}
          icon={<CheckCircle size={20} className="text-white" />}
          color="bg-green-500"
          subtitle="Questions verified"
        />

        <StatCard
          title="Avg Difficulty"
          value={stats.averageDifficulty.toFixed(1)}
          icon={<Target size={20} className="text-white" />}
          color="bg-yellow-500"
          subtitle="Out of 5.0"
        />

        <StatCard
          title="Need Review"
          value={stats.needsReview}
          icon={<AlertTriangle size={20} className="text-white" />}
          color="bg-red-500"
          subtitle="Questions flagged"
        />
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">By Question Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const percentage = (count / stats.totalQuestions) * 100;
              const labels: Record<string, string> = {
                single_choice: 'Single Choice',
                multi_choice: 'Multiple Choice',
                written: 'Written'
              };

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{labels[type] || type}</span>
                    <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Level */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">By Difficulty Level</h3>
          <div className="space-y-3">
            {Object.entries(stats.byLevel).map(([level, count]) => {
              const percentage = (count / stats.totalQuestions) * 100;
              const colors: Record<string, string> = {
                basic: 'bg-green-500',
                intermediate: 'bg-yellow-500',
                advanced: 'bg-red-500'
              };

              return (
                <div key={level} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{level}</span>
                    <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[level] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {Object.entries(stats.byCategory)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => {
                const percentage = (count / stats.totalQuestions) * 100;

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">{category}</span>
                      <span className="font-medium">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-green-900">{stats.recentlyAdded} New Questions</p>
              <p className="text-sm text-green-700">Added in the last 7 days</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Users size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Quality Score: {(stats.verificationRate * 100).toFixed(1)}%</p>
              <p className="text-sm text-blue-700">Based on verification rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankStatsPanel;