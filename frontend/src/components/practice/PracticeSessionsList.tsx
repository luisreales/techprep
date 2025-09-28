import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, PlayCircle, Target, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

interface PracticeSession {
  id: string;
  topicId?: number;
  topicName?: string;
  level: string;
  questionCount: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  startedAt: string;
  finishedAt?: string;
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  totalItems: number;
  currentQuestionIndex: number;
}

interface PracticeSessionsListProps {
  filters?: {
    topicId?: number;
    status?: string;
  };
}

export const PracticeSessionsList: React.FC<PracticeSessionsListProps> = ({ filters }) => {
  const navigate = useNavigate();

  // Fetch practice sessions
  const { data: sessionsResponse, isLoading, error } = useQuery({
    queryKey: ['practice-sessions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.topicId) params.append('topicId', filters.topicId.toString());
      if (filters?.status) params.append('status', filters.status);
      const response = await api.get(`/practice/sessions?${params}`);
      return response.data;
    }
  });

  const sessions = sessionsResponse?.data || [];

  const handleContinueSession = async (session: PracticeSession) => {
    try {
      // First, get the session details including questions
      const response = await api.get(`/practice/${session.id}`);
      const sessionData = response.data;

      if (sessionData.success) {
        debugger
        // Navigate with the session data and questions
        navigate(`/practice/session/${session.id}`, {
          state: {
            questions: sessionData.data.questions || [],
            sessionData: {
              sessionId: session.id,
              questionCount: session.totalItems,
              currentIndex: session.currentQuestionIndex
            }
          }
        });
      } else {
        console.error('Failed to load session details');
        alert('Failed to load session details');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Failed to load session');
    }
  };

  const handleViewResults = (session: PracticeSession) => {
    navigate(`/practice/review/${session.id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'InProgress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Completed';
      case 'InProgress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateProgress = (session: PracticeSession) => {
    if (session.status === 'Completed') return 100;
    if (session.status === 'NotStarted') return 0;
    // For in-progress sessions, calculate based on current question index
    // Add 1 to currentQuestionIndex because we want to show progress for the question we're currently on
    const progress = session.currentQuestionIndex > 0
      ? Math.round(((session.currentQuestionIndex + 1) / session.totalItems) * 100)
      : 0;
    return Math.min(progress, 100); // Cap at 100%
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading practice sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load practice sessions</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Practice Sessions</h3>
        <p className="text-gray-600 mb-4">
          Start your first practice session to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session: PracticeSession) => (
        <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(session.status)}
                <h3 className="text-lg font-medium text-gray-900">
                  {session.topicName || 'All Topics'} - {session.level} Level
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : session.status === 'InProgress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(session.status)}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {session.totalItems} questions
                </span>
                <span>Started: {formatDate(session.startedAt)}</span>
                {session.finishedAt && (
                  <span>Finished: {formatDate(session.finishedAt)}</span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{calculateProgress(session)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(session)}%` }}
                  />
                </div>
              </div>

              {/* Score Summary */}
              {session.status === 'Completed' && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    ✓ {session.correctCount} correct
                  </span>
                  <span className="text-red-600 font-medium">
                    ✗ {session.incorrectCount} incorrect
                  </span>
                  <span className="text-gray-600">
                    Score: {Math.round((session.correctCount / session.totalItems) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              {session.status === 'Completed' ? (
                <button
                  onClick={() => handleViewResults(session)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  View Results
                </button>
              ) : (
                <button
                  onClick={() => handleContinueSession(session)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {session.status === 'InProgress' ? 'Continue' : 'Start'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};