import React from 'react';
import { Users, Building, TrendingUp, Activity } from 'lucide-react';
import { GroupStats } from '@/services/groupsApi';

interface GroupStatsPanelProps {
  stats: GroupStats;
}

const GroupStatsPanel: React.FC<GroupStatsPanelProps> = ({ stats }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Activity size={20} />
        Groups Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500">
              <Building size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Members/Group</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageMembersPerGroup.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{activity.details}</p>
                <p className="text-gray-600">
                  in {activity.groupName} • {new Date(activity.performedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupStatsPanel;