import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trophy, Target, BarChart3, RefreshCw, Eye, LogOut } from 'lucide-react';
import { interviewApi, InterviewSummaryDto, SummarySlice } from '@/services/interviewApi';

const InterviewSummary: React.FC = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<InterviewSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        return;
      }

      try {
        const summaryData = await interviewApi.summary(sessionId);
        setSummary(summaryData);
      } catch (err) {
        setError('Failed to load interview summary');
        console.error('Failed to load summary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [sessionId]);

  const handleRetake = async () => {
    if (!sessionId) return;

    setRetaking(true);
    try {
      const retakeResponse = await interviewApi.retake(sessionId);
      navigate(`/interviews/runner/${retakeResponse.newInterviewSessionId}`);
    } catch (err) {
      setError('Failed to start retake');
      console.error('Failed to retake:', err);
    } finally {
      setRetaking(false);
    }
  };

  const handleViewReview = () => {
    navigate(`/interviews/review/${sessionId}`);
  };

  const handleExit = () => {
    navigate('/interviews');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderSummarySlices = (slices: SummarySlice[], title: string) => (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{slice.key}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {slice.correct}/{slice.total}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(slice.accuracy)}`}>
                {slice.accuracy.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading summary...</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Summary not found'}</p>
          <button
            onClick={() => navigate('/interviews')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const overallAccuracy = summary.totalItems > 0 ? (summary.correctCount / summary.totalItems) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
        <p className="text-gray-600">Here's how you performed on your interview</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold mb-1">{summary.correctCount}</div>
          <div className="text-sm text-gray-600">Correct Answers</div>
        </div>

        <div className="bg-white rounded-lg border p-6 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold mb-1">{summary.totalItems}</div>
          <div className="text-sm text-gray-600">Total Questions</div>
        </div>

        <div className="bg-white rounded-lg border p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className={`text-2xl font-bold mb-1 ${getScoreColor(overallAccuracy).split(' ')[0]}`}>
            {overallAccuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Overall Score</div>
        </div>

        <div className="bg-white rounded-lg border p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold mb-1">{formatTime(summary.totalTimeSec)}</div>
          <div className="text-sm text-gray-600">Total Time</div>
        </div>
      </div>

      {/* Session Details */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Session Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Started At</div>
              <div className="font-medium">{formatDate(summary.startedAt)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Submitted At</div>
              <div className="font-medium">{formatDate(summary.submittedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {summary.byTopic.length > 0 && renderSummarySlices(summary.byTopic, 'Performance by Topic')}
        {summary.byType.length > 0 && renderSummarySlices(summary.byType, 'Performance by Question Type')}
        {summary.byLevel.length > 0 && renderSummarySlices(summary.byLevel, 'Performance by Difficulty Level')}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleViewReview}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Eye className="w-5 h-5" />
          <span>Ver Resumen</span>
        </button>

        <button
          onClick={handleRetake}
          disabled={retaking}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${retaking ? 'animate-spin' : ''}`} />
          <span>{retaking ? 'Starting...' : 'Retake'}</span>
        </button>

        <button
          onClick={handleExit}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Salir</span>
        </button>
      </div>

      {/* Performance Insights */}
      {overallAccuracy < 60 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Improvement Suggestions</h3>
          <p className="text-yellow-700 text-sm">
            Consider reviewing the topics where you scored lower and retaking the interview when you feel more prepared.
          </p>
        </div>
      )}

      {overallAccuracy >= 80 && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-2">Great Performance!</h3>
          <p className="text-green-700 text-sm">
            Excellent work! You've demonstrated strong knowledge across the interview topics.
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewSummary;