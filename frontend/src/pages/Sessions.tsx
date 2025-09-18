import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { Topic, DifficultyLevel, PracticeMode } from '@/types/api';

// Session template based on topics and difficulty levels
interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  topicId: number;
  topicName: string;
  questionCount: number;
  difficulty: DifficultyLevel;
  estimatedTime: number; // in minutes
}

const Sessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopicsAndCreateSessions = async () => {
      try {
        setIsLoading(true);
        console.log('Sessions: Starting to fetch topics...');

        // Fetch topics from the API
        const topicsResponse = await apiClient.getTopics();
        console.log('Sessions: Topics response:', topicsResponse);
        console.log('Sessions: Raw response type:', typeof topicsResponse);
        console.log('Sessions: Response data exists:', !!topicsResponse.data);
        console.log('Sessions: Response success:', topicsResponse.success);

        if (topicsResponse.success && topicsResponse.data) {
          const topics: Topic[] = topicsResponse.data;
          console.log('Sessions: Found topics:', topics.length);

          // Create session templates for each topic and difficulty level
          const sessionTemplates: SessionTemplate[] = [];

          topics.forEach((topic) => {
            // Create sessions for each difficulty level
            const difficulties: DifficultyLevel[] = [DifficultyLevel.Basic, DifficultyLevel.Intermediate, DifficultyLevel.Advanced];

            difficulties.forEach((difficulty, index) => {
              const questionCount = topic.questionCount || 10; // Use topic's question count or default
              const baseTime = difficulty === DifficultyLevel.Basic ? 15 :
                              difficulty === DifficultyLevel.Intermediate ? 25 : 35;

              sessionTemplates.push({
                id: `${topic.id}-${difficulty}`,
                name: `${topic.name} - ${difficulty}`,
                description: `${difficulty} level questions about ${topic.name}. ${topic.description || ''}`,
                topicId: topic.id,
                topicName: topic.name,
                questionCount: Math.min(questionCount, difficulty === DifficultyLevel.Basic ? 10 :
                                       difficulty === DifficultyLevel.Intermediate ? 15 : 20),
                difficulty,
                estimatedTime: baseTime
              });
            });
          });

          console.log('Sessions: Created session templates:', sessionTemplates.length);
          setSessions(sessionTemplates);
        } else {
          console.log('Sessions: API response not successful or no data:', topicsResponse);
          setSessions([]);
        }
      } catch (error) {
        console.error('Sessions: Failed to fetch topics:', error);
        console.error('Sessions: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          response: (error as any)?.response?.data || 'No response data'
        });
        // Fallback to empty sessions
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicsAndCreateSessions();
  }, []);

  const handleStartSession = (sessionId: string, mode: 'study' | 'interview') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Navigate to practice page with session data and mode
    navigate('/practice', {
      state: {
        sessionId,
        mode: mode === 'study' ? PracticeMode.Study : PracticeMode.Interview,
        sessionData: session
      }
    });
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
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
          <p className="text-[var(--text-secondary)]">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={rootStyle}>
      {/* Header */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Practice Sessions</h1>
        <p className="text-[var(--text-secondary)]">
          Choose a session to practice your technical interview skills. Study mode provides immediate feedback,
          while Interview mode simulates a real interview experience.
        </p>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-[var(--card-background)] rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md transition-all duration-200"
          >
            <div className="p-6">
              {/* Session Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
                  {session.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
                  {session.difficulty}
                </span>
              </div>

              {/* Session Details */}
              <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-3">
                {session.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="material-symbols-outlined text-base">topic</span>
                  <span>{session.topicName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="material-symbols-outlined text-base">quiz</span>
                  <span>{session.questionCount} questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>~{session.estimatedTime} minutes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleStartSession(session.id, 'study')}
                  className="w-full bg-[var(--primary-color)] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[var(--primary-color)]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">school</span>
                  Practice Session
                </button>
                <button
                  onClick={() => handleStartSession(session.id, 'interview')}
                  className="w-full bg-white border border-[var(--primary-color)] text-[var(--primary-color)] py-2.5 px-4 rounded-lg font-medium hover:bg-[var(--primary-color-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">work</span>
                  Take Real Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sessions.length === 0 && !isLoading && (
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl">quiz</span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Sessions Available</h3>
          <p className="text-[var(--text-secondary)]">Check back later for new practice sessions.</p>
        </div>
      )}
    </div>
  );
};

export default Sessions;