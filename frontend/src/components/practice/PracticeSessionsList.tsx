import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, PlayCircle, Target, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

interface PracticeSession {
  id: string;
  name: string;
  topicId?: string;
  topicName?: string;
  levels?: string;
  level?: string;
  questionCount: number;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Paused' | 'Expired' | 'Abandoned';
  startedAt: string;
  finishedAt?: string;
  submittedAt?: string;
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  totalItems: number;
  currentQuestionIndex: number;
  topics?: Array<{
    id: string;
    name: string;
    levels: string;
  }>;
}

interface PracticeSessionsListProps {
  filters?: {
    topicId?: number;
    status?: string;
  };
  itemsPerPage?: number;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const PracticeSessionsList: React.FC<PracticeSessionsListProps> = ({ filters, itemsPerPage = 6 }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    sessionId: string;
    sessionName: string;
  }>({ isOpen: false, sessionId: '', sessionName: '' });

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

  const allSessions = sessionsResponse?.data || [];

  // Calculate pagination
  const totalSessions = allSessions.length;
  const totalPages = Math.ceil(totalSessions / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sessions = allSessions.slice(startIndex, endIndex);

  // Delete session mutation
  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/practice/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] });
      setDeleteDialog({ isOpen: false, sessionId: '', sessionName: '' });
      // Reset to first page if current page becomes empty
      if (sessions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: (error: unknown) => {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  });

  const handleContinueSession = async (session: PracticeSession) => {
    try {
      // First, get the session details including questions
      const response = await api.get(`/practice/${session.id}`);
      const sessionData = response.data;

      if (sessionData.success) {
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

  const handleDeleteSession = (session: PracticeSession) => {
    setDeleteDialog({
      isOpen: true,
      sessionId: session.id,
      sessionName: session.name || 'Practice Session'
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.sessionId) {
      deleteMutation.mutate(deleteDialog.sessionId);
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, sessionId: '', sessionName: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'InProgress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'Paused':
        return <Clock className="w-5 h-5 text-yellow-500" />;
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
      case 'Paused':
        return 'Paused';
      case 'Expired':
        return 'Expired';
      case 'Abandoned':
        return 'Abandoned';
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
    <>
      <div className="space-y-4">
        {sessions.map((session: PracticeSession) => (
        <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(session.status)}
                <h3 className="text-lg font-medium text-gray-900">
                  {session.name || 'Practice Session'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : session.status === 'InProgress'
                    ? 'bg-blue-100 text-blue-800'
                    : session.status === 'Paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : session.status === 'Expired'
                    ? 'bg-red-100 text-red-800'
                    : session.status === 'Abandoned'
                    ? 'bg-gray-100 text-gray-800'
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
                {(session.topicName || session.topics?.length) && (
                  <span>
                    Topic: {session.topicName || session.topics?.map(t => t.name).join(', ') || 'Mixed Topics'}
                  </span>
                )}
                {(session.levels || session.level) && (
                  <span>
                    Levels: {session.levels || session.level || 'Mixed'}
                  </span>
                )}
                <span>Started: {formatDate(session.startedAt)}</span>
                {(session.finishedAt || session.submittedAt) && (
                  <span>Finished: {formatDate(session.finishedAt || session.submittedAt!)}</span>
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
                <>
                  <button
                    onClick={() => handleViewResults(session)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : session.status === 'Expired' || session.status === 'Abandoned' ? (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                >
                  Unavailable
                </button>
              ) : (
                <button
                  onClick={() => handleContinueSession(session)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  {session.status === 'InProgress' || session.status === 'Paused' ? 'Continue' : 'Start'}
                </button>
              )}
            </div>
          </div>
        </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, totalSessions)} of {totalSessions} sessions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Practice Session"
        message={`Are you sure you want to delete "${deleteDialog.sessionName}"? This action cannot be undone and all session data will be permanently removed.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};