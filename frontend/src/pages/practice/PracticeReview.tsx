import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, FileText, Lightbulb, ExternalLink } from 'lucide-react';
import PracticeModuleApi from '@/services/practiceModuleApi';

interface PracticeReviewQuestion {
  questionId: string;
  questionText: string;
  type: 'SingleChoice' | 'MultiChoice' | 'Written';
  level: string;
  topicName?: string;
  timeMs: number;
  isCorrect: boolean;
  matchPercentage?: number;
  givenText?: string;
  selectedOptions: string[];
  correctAnswer?: string;
  explanation?: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  relatedResources?: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
    description: string;
  }>;
}

interface PracticeReviewResponse {
  sessionId: string;
  questions: PracticeReviewQuestion[];
  totalTimeMs: number;
  correctCount: number;
  totalQuestions: number;
}

const PracticeReview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState<PracticeReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReview = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        return;
      }

      try {
        // For now, since we don't have a practice review API endpoint,
        // we'll simulate the data structure based on the interview pattern
        // In a real implementation, you would call:
        // const data = await PracticeModuleApi.getSessionReview(sessionId);

        // Temporary mock data - this should be replaced with actual API call
        const mockData: PracticeReviewResponse = {
          sessionId,
          questions: [],
          totalTimeMs: 0,
          correctCount: 0,
          totalQuestions: 0
        };

        setReviewData(mockData);
      } catch (err) {
        setError('Failed to load practice review');
        console.error('Failed to load review:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [sessionId]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getResultIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getResultColor = (isCorrect: boolean) => {
    return isCorrect
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200';
  };

  const renderQuestion = (question: PracticeReviewQuestion, index: number) => {
    return (
      <div key={question.questionId} className={`border rounded-lg p-6 ${getResultColor(question.isCorrect)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
              {index + 1}
            </span>
            <h3 className="text-lg font-medium">Question {index + 1}</h3>
            {getResultIcon(question.isCorrect)}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(question.timeMs)}</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">{question.questionText}</h4>
          <div className="flex flex-wrap space-x-2 text-xs">
            {question.topicName && (
              <span className="px-2 py-1 bg-gray-100 rounded mb-1">
                {question.topicName}
              </span>
            )}
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded mb-1">
              {question.level}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded mb-1">
              {question.type}
            </span>
            {question.matchPercentage !== undefined && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded mb-1">
                Match: {question.matchPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Single/Multiple Choice Questions */}
        {(question.type === 'SingleChoice' || question.type === 'MultiChoice') && question.options && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Options:</h5>
            {question.options.map((option) => {
              const isSelected = question.selectedOptions.includes(option.id);
              const isCorrect = option.isCorrect;

              let optionClass = 'p-3 rounded border ';
              if (isSelected && isCorrect) {
                optionClass += 'bg-green-100 border-green-300'; // Correct selection
              } else if (isSelected && !isCorrect) {
                optionClass += 'bg-red-100 border-red-300'; // Incorrect selection
              } else if (!isSelected && isCorrect) {
                optionClass += 'bg-yellow-100 border-yellow-300'; // Should have been selected
              } else {
                optionClass += 'bg-gray-50 border-gray-200'; // Not selected, not correct
              }

              return (
                <div key={option.id} className={optionClass}>
                  <div className="flex items-center justify-between">
                    <span>{option.text}</span>
                    <div className="flex items-center space-x-2">
                      {isSelected && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Selected
                        </span>
                      )}
                      {isCorrect && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Correct
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Written Questions */}
        {question.type === 'Written' && (
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-2">Your Answer:</h5>
              <div className="p-3 bg-white border rounded">
                {question.givenText || <span className="text-gray-400 italic">No answer provided</span>}
              </div>
            </div>
            {question.matchPercentage !== undefined && (
              <div className="text-sm">
                <span className="font-medium">Match Percentage: </span>
                <span className={question.matchPercentage >= 80 ? 'text-green-600' : 'text-red-600'}>
                  {question.matchPercentage}%
                </span>
              </div>
            )}
            {question.correctAnswer && (
              <div>
                <h5 className="font-medium text-sm mb-2">Expected Answer:</h5>
                <div className="p-3 bg-gray-50 border rounded">
                  {question.correctAnswer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="mt-4">
            <h5 className="font-medium text-sm mb-2">Explanation:</h5>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          </div>
        )}

        {/* Related Resources */}
        {question.relatedResources && question.relatedResources.length > 0 && (
          <div className="mt-4">
            <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Related Resources
            </h5>
            <div className="space-y-2">
              {question.relatedResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <div>
                    <h6 className="font-medium text-blue-900">{resource.title}</h6>
                    {resource.description && (
                      <p className="text-sm text-blue-700">{resource.description}</p>
                    )}
                    <span className="text-xs text-blue-600 uppercase">{resource.type}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Result Summary */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`font-medium ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
            {question.type === 'Written' && question.matchPercentage !== undefined && (
              <div className="text-sm text-gray-600">
                Threshold: 80% (Required for correct)
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading practice review...</div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Review not found'}</p>
          <button
            onClick={() => navigate('/practice')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  const { correctCount, totalQuestions } = reviewData;
  const overallAccuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/practice')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Practice</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Practice Review</h1>
        </div>
        <p className="text-gray-600">
          Review your answers and learn from detailed explanations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{totalQuestions}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${overallAccuracy >= 80 ? 'text-green-600' : overallAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {overallAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatTime(reviewData.totalTimeMs)}</div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      {reviewData.questions.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Question-by-Question Review</h2>
          {reviewData.questions.map((question, index) => renderQuestion(question, index))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No questions were answered in this practice session.</p>
        </div>
      )}

      {/* Performance Insights */}
      {overallAccuracy < 60 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Improvement Suggestions</h3>
          <p className="text-yellow-700 text-sm">
            Consider reviewing the topics where you scored lower and practicing more questions to strengthen your understanding.
          </p>
        </div>
      )}

      {overallAccuracy >= 80 && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-2">Excellent Performance!</h3>
          <p className="text-green-700 text-sm">
            Great work! You've demonstrated strong knowledge across the practice topics. Keep up the excellent preparation!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => navigate('/practice')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Continue Practice
        </button>
        <button
          onClick={() => navigate('/practice')}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Practice
        </button>
      </div>
    </div>
  );
};

export default PracticeReview;