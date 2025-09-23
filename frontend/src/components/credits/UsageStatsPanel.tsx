import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { UsageStats, UserSubscription } from '@/services/creditsApi';

interface UsageStatsPanelProps {
  stats: UsageStats;
  subscription: UserSubscription | null;
  detailed?: boolean;
}

const UsageStatsPanel: React.FC<UsageStatsPanelProps> = ({
  stats,
  subscription,
  detailed = false
}) => {
  const currentPeriod = stats.currentPeriod;
  const lastPeriod = stats.lastPeriod;
  const historical = stats.historical;

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatChange = (current: number, previous: number) => {
    const change = getChangePercentage(current, previous);
    const isPositive = change >= 0;

    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  return (
    <div className="space-y-6">
      {/* Current Period Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credits Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPeriod.creditsUsed.toLocaleString()}
              </p>
              {(() => {
                const change = formatChange(currentPeriod.creditsUsed, lastPeriod.creditsUsed);
                const IconComponent = change.icon;
                return (
                  <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                    <IconComponent size={14} />
                    <span>{change.value}% from last period</span>
                  </div>
                );
              })()}
            </div>
            <BarChart3 size={24} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPeriod.sessionsCompleted.toLocaleString()}
              </p>
              {(() => {
                const change = formatChange(currentPeriod.sessionsCompleted, lastPeriod.sessionsCompleted);
                const IconComponent = change.icon;
                return (
                  <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                    <IconComponent size={14} />
                    <span>{change.value}% from last period</span>
                  </div>
                );
              })()}
            </div>
            <Calendar size={24} className="text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Questions Answered</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPeriod.questionsAnswered.toLocaleString()}
              </p>
              {(() => {
                const change = formatChange(currentPeriod.questionsAnswered, lastPeriod.questionsAnswered);
                const IconComponent = change.icon;
                return (
                  <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                    <IconComponent size={14} />
                    <span>{change.value}% from last period</span>
                  </div>
                );
              })()}
            </div>
            <BarChart3 size={24} className="text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Issued</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPeriod.certificatesIssued.toLocaleString()}
              </p>
              {(() => {
                const change = formatChange(currentPeriod.certificatesIssued, lastPeriod.certificatesIssued);
                const IconComponent = change.icon;
                return (
                  <div className={`flex items-center gap-1 text-sm ${change.color}`}>
                    <IconComponent size={14} />
                    <span>{change.value}% from last period</span>
                  </div>
                );
              })()}
            </div>
            <Calendar size={24} className="text-yellow-600" />
          </div>
        </div>
      </div>

      {detailed && (
        <>
          {/* Historical Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Historical Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {historical.totalCreditsEarned.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Credits Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {historical.totalCreditsSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Credits Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {historical.totalSessions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
            </div>
          </div>

          {/* Projections */}
          {stats.projections && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Usage Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xl font-bold text-blue-900">
                    {stats.projections.estimatedMonthlyUsage.toLocaleString()} credits/month
                  </div>
                  <div className="text-sm text-blue-700">Estimated monthly usage</div>
                </div>
                {stats.projections.recommendedTier && (
                  <div>
                    <div className="text-xl font-bold text-blue-900">
                      {stats.projections.recommendedTier}
                    </div>
                    <div className="text-sm text-blue-700">Recommended plan</div>
                    {stats.projections.costSaving && (
                      <div className="text-sm text-green-700 font-medium">
                        Save ${stats.projections.costSaving}/month
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsageStatsPanel;