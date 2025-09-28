import React, { useState } from 'react';
import { PracticeStatsHeader } from '@/components/practice/PracticeStatsHeader';
import { PracticeSessionFilters } from '@/components/practice/PracticeSessionFilters';
import { PracticeSessionsList } from '@/components/practice/PracticeSessionsList';
import { PracticeSessionConfig, PracticeConfigData } from '@/components/practice/PracticeSessionConfig';
import { PlayCircle, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export const PracticePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'progress'>('sessions');
  const [showFilters, setShowFilters] = useState(false);
  const [showSessionConfig, setShowSessionConfig] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionFilters, setSessionFilters] = useState<{ topicId?: number; status?: string }>({});
  const navigate = useNavigate();

  const handleFiltersChange = (filters: { topicId?: number; status?: string }) => {
    setSessionFilters(filters);
  };

  const handleStartPracticeSession = async (config: PracticeConfigData) => {
    console.log('🚀 Starting practice session with config:', config);
    setIsStartingSession(true);
    try {
      const requestData = {
        TopicId: config.topicId,
        Level: config.levels.join(','), // Send as comma-separated string
        QuestionCount: config.questionCount
      };
      console.log('📤 Sending request to /practice/start-direct:', requestData);

      // Create practice session via API using the configured axios instance
      const response = await api.post('/practice/start-direct', requestData);
      console.log('📥 Received response:', response);

      const result = response.data;
      console.log('📊 Response data:', result);

      if (result.success) {
        console.log('✅ Session created successfully, navigating to:', `/practice/session/${result.data.sessionId}`);
        console.log('📚 Questions data:', result.data.questions);
        // Navigate to practice runner with session ID and questions data
        navigate(`/practice/session/${result.data.sessionId}`, {
          state: {
            questions: result.data.questions,
            sessionData: {
              questionCount: result.data.questionCount,
              sessionId: result.data.sessionId
            }
          }
        });
      } else {
        console.error('❌ Session creation failed:', result.message);
        alert(result.message || 'Failed to start practice session');
      }
    } catch (error: any) {
      console.error('💥 Error starting practice session:', error);
      console.error('🔍 Error response:', error.response);
      console.error('📝 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start practice session';
      alert(errorMessage);
    } finally {
      console.log('🏁 Practice session creation flow completed');
      setIsStartingSession(false);
      setShowSessionConfig(false);
    }
  };

  const handleCancelSession = () => {
    setShowSessionConfig(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Questions</h1>
          <p className="text-gray-600">
            Sharpen your skills with our comprehensive question bank
          </p>
        </div>
        <button
          onClick={() => {
            console.log('🎯 "Start Practice Session" button clicked');
            setShowSessionConfig(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlayCircle className="w-5 h-5" />
          Start Practice Session
        </button>
      </div>

      {/* Stats Header */}
      <PracticeStatsHeader />

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sessions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Practice Sessions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'progress'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Progress
            </div>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Filters Section */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filter Sessions</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Target className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="p-4">
                <PracticeSessionFilters onFiltersChange={handleFiltersChange} />
              </div>
            )}
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === 'sessions' && 'Practice Sessions'}
            {activeTab === 'progress' && 'Progress Overview'}
          </h3>

          {activeTab === 'sessions' && (
            <PracticeSessionsList filters={sessionFilters} />
          )}

          {activeTab === 'progress' && (
            <div className="text-center py-8 text-gray-500">
              Detailed progress analytics will appear here
            </div>
          )}
        </div>
      </div>

      {/* Practice Session Configuration Modal */}
      {showSessionConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <PracticeSessionConfig
              onStartPractice={handleStartPracticeSession}
              onCancel={handleCancelSession}
              isLoading={isStartingSession}
            />
          </div>
        </div>
      )}
    </div>
  );
};
