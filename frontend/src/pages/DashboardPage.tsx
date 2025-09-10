import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Play, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Mock data - this would come from API calls
  const stats = [
    {
      name: 'Total Sessions',
      value: '12',
      icon: Play,
      color: 'bg-blue-500',
    },
    {
      name: 'Average Score',
      value: '78%',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Study Time',
      value: '24h',
      icon: Clock,
      color: 'bg-purple-500',
    },
    {
      name: 'Topics Covered',
      value: '8',
      icon: BookOpen,
      color: 'bg-orange-500',
    },
  ];

  const recentSessions = [
    {
      id: '1',
      topic: 'JavaScript',
      score: 85,
      date: '2024-01-15',
      questionsAnswered: 10,
    },
    {
      id: '2',
      topic: 'React',
      score: 92,
      date: '2024-01-14',
      questionsAnswered: 15,
    },
    {
      id: '3',
      topic: 'Node.js',
      score: 76,
      date: '2024-01-13',
      questionsAnswered: 12,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your technical interview preparation progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/practice"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Play className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Start Practice Session</p>
                <p className="text-sm text-gray-600">Begin a new practice session</p>
              </div>
            </Link>
            <Link
              to="/topics"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Browse Topics</p>
                <p className="text-sm text-gray-600">Explore available study topics</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{session.topic}</p>
                  <p className="text-sm text-gray-600">
                    {session.questionsAnswered} questions • {session.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{session.score}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No sessions yet. Start your first practice!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Study Recommendation */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Study Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <h3 className="font-medium text-red-900">Needs Improvement</h3>
            <p className="text-sm text-red-700 mt-1">Algorithms & Data Structures</p>
            <p className="text-xs text-red-600 mt-2">Average: 62%</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <h3 className="font-medium text-yellow-900">Good Progress</h3>
            <p className="text-sm text-yellow-700 mt-1">JavaScript Fundamentals</p>
            <p className="text-xs text-yellow-600 mt-2">Average: 78%</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <h3 className="font-medium text-green-900">Strong Knowledge</h3>
            <p className="text-sm text-green-700 mt-1">React Development</p>
            <p className="text-xs text-green-600 mt-2">Average: 92%</p>
          </div>
        </div>
      </div>
    </div>
  );
};