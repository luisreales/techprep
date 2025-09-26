// Interviews.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DifficultyLevel, PracticeMode } from '@/types/api';
import { practiceInterviewTemplatesApi } from '@/services/practiceInterviewTemplates';
import { TemplateKind, UserAssignedTemplateDto } from '@/types/practiceInterview';
import { interviewApi, InterviewSessionListDto } from '@/services/interviewApi';

interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  difficulty: DifficultyLevel;
  estimatedTime: number; // minutes
  topicName: string; // kept for UI, but we don't fetch topics
  assignmentId: number; // assignment ID from the backend
}

const Interviews: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionTemplate[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSessionListDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'sessions'>('sessions');

  const sumQuestions = (selection: any) => {
    if (!selection) return 0;
    const s = Number(selection.countSingle ?? 0);
    const m = Number(selection.countMulti ?? 0);
    const w = Number(selection.countWritten ?? 0);
    return s + m + w;
  };

  const toMinutes = (sec?: number) => {
    if (!sec || isNaN(sec)) return 25;
    return Math.max(1, Math.round(sec / 60));
  };

  const loadInterviewSessions = async () => {
    try {
      const sessionsList = await interviewApi.listMine();
      setInterviewSessions(Array.isArray(sessionsList) ? sessionsList : []);
    } catch (error) {
      console.error('Failed to load interview sessions:', error);
      setInterviewSessions([]);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoading(true);

        // Load interview sessions first (higher priority)
        await loadInterviewSessions();

        // TODO: Replace with actual user ID from authentication context
        // For now, using the user ID that has data in the database
        const currentUserId = "D4A93EE2-7B77-4341-8013-0EC6F6B1DB38"; // Replace with actual user ID

        // Fetch ONLY Interview templates assigned to the current user
        const res = await practiceInterviewTemplatesApi.listByUser(currentUserId, TemplateKind.Interview, 1, 24);

        // Handle the API response structure: { success, data: { data:[...], pagination: {...} } }
        console.log('API Response:', res); // Debug log to see the structure
        const inner = res?.data;
        const items = inner?.data ?? []; // The actual templates array

        const mapped: SessionTemplate[] = (items as UserAssignedTemplateDto[]).map((t) => {
          const totalQ = sumQuestions(t.selection);
          const minutes = toMinutes(t?.timers?.totalSec);

          return {
            id: String(t.assignmentId), // Use assignmentId as unique identifier
            name: t.name ?? 'Interview',
            description: t.description ?? '',
            questionCount: totalQ > 0 ? totalQ : 10, // sensible default
            // No difficulty in payload → default to Intermediate (or derive from your own rule)
            difficulty: DifficultyLevel.Intermediate,
            estimatedTime: minutes,
            topicName: 'Interview', // static label; we are not consulting topics
            assignmentId: t.assignmentId, // Include the assignment ID
          };
        });

        if (alive) setSessions(mapped);
      } catch (e) {
        console.error('Interviews load error:', e);
        if (alive) setSessions([]);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleStartSession = async (templateId: string, mode: 'study' | 'interview') => {
    const template = sessions.find((s) => s.id === templateId);
    if (!template) return;

    if (mode === 'study') {
      navigate('/practice/runner', {
        state: { templateId, assignmentId: template.assignmentId, mode: PracticeMode.Study, templateData: template },
      });
    } else {
      try {
        console.log('Starting interview session for assignmentId:', template.assignmentId);
        // Call backend to create InterviewSessionNew entry using assignmentId instead of templateId
        const response = await interviewApi.start(template.assignmentId);
        console.log('Interview session created:', response);

        // Navigate to runner with the session ID
        navigate(`/interviews/runner/${response.interviewSessionId}`, {
          state: { templateData: template },
        });
      } catch (error) {
        console.error('Failed to start interview session:', error);
        // TODO: Show error toast/notification to user
        alert('Failed to start interview. Please try again.');
      }
    }
  };

  const handleContinueSession = (sessionId: string) => {
    navigate(`/interviews/runner/${sessionId}`);
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      await interviewApi.finalize(sessionId);
      await loadInterviewSessions(); // Refresh the list
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/interviews/review/${sessionId}`);
  };

  const handleRetakeSession = async (sessionId: string) => {
    try {
      const retakeResponse = await interviewApi.retakeInterview(sessionId);
      navigate(`/interviews/runner/${retakeResponse.interviewSessionId}`);
    } catch (error) {
      console.error('Failed to start retake:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Finalized':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (d: DifficultyLevel) => {
    switch (d) {
      case DifficultyLevel.Basic:
        return 'bg-green-100 text-green-800';
      case DifficultyLevel.Intermediate:
        return 'bg-yellow-100 text-yellow-800';
      case DifficultyLevel.Advanced:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const rootStyle: React.CSSProperties = {
    '--primary-color': '#4f46e5',
    '--primary-color-light': '#e0e7ff',
    '--background-color': '#f8fafc',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--card-background': '#ffffff',
    '--border-color': '#e2e8f0',
    '--accent-color': '#10b981',
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={rootStyle}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading interview templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={rootStyle}>
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Technical Interviews</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your interview sessions and start new interviews.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm">
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
              }`}
            >
              My Sessions
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
              }`}
            >
              Start New Interview
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Interview Sessions</h2>
              {!Array.isArray(interviewSessions) || interviewSessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-2xl">quiz</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Interview Sessions</h3>
                  <p className="text-[var(--text-secondary)]">Start a new interview to see sessions here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(interviewSessions) && interviewSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-[var(--border-color)] rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-[var(--text-primary)]">{session.assignmentName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          {session.attemptNumber > 1 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Attempt {session.attemptNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                          <span>{session.totalItems} questions</span>
                          <span>Started: {formatDate(session.startedAt)}</span>
                          {session.submittedAt && <span>Submitted: {formatDate(session.submittedAt)}</span>}
                          {session.score && <span>Score: {session.score}%</span>}
                          <span>Duration: {formatDuration(session.durationSec)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === 'InProgress' && (
                          <button
                            onClick={() => handleContinueSession(session.id)}
                            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/90"
                          >
                            Continue
                          </button>
                        )}
                        {session.status === 'Submitted' && (
                          <button
                            onClick={() => handleCloseSession(session.id)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
                          >
                            Close
                          </button>
                        )}
                        {session.status === 'Finalized' && (
                          <>
                            <button
                              onClick={() => handleViewDetails(session.id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleRetakeSession(session.id)}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                            >
                              Retake
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Available Templates</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[var(--card-background)] rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">{s.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(s.difficulty)}`}>
                          {s.difficulty}
                        </span>
                      </div>

                      <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-3">{s.description}</p>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="material-symbols-outlined text-base">topic</span>
                          <span>{s.topicName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="material-symbols-outlined text-base">quiz</span>
                          <span>{s.questionCount} questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          <span>~{s.estimatedTime} minutes</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleStartSession(s.id, 'study')}
                          className="w-full bg-[var(--primary-color)] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">school</span>
                          Practice Mode
                        </button>
                        <button
                          onClick={() => handleStartSession(s.id, 'interview')}
                          className="w-full bg-white border border-[var(--primary-color)] text-[var(--primary-color)] py-2.5 px-4 rounded-lg font-medium hover:bg-[var(--primary-color-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">work</span>
                          Interview Mode
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length === 0 && !isLoading && (
                <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-2xl">quiz</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Interview Templates</h3>
                  <p className="text-[var(--text-secondary)]">Create Interview templates to see them here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interviews;
