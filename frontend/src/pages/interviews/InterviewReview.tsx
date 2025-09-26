import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, FileText } from 'lucide-react';
import { interviewApi, ReviewResponse, ReviewQuestion } from '@/services/interviewApi';

const InterviewReview: React.FC = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReview = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        return;
      }

      try {
        // First, ensure the session is finalized before loading review
        await interviewApi.finalize(sessionId);

        // Then load the review data
        const data = await interviewApi.review(sessionId);
        setReviewData(data);
      } catch (err) {
        setError('Failed to load interview review');
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

  const renderQuestion = (question: ReviewQuestion, index: number) => {
    const hasCorrectOptions = question.options?.some(o => o.isCorrect) || false;

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
          <div className="flex space-x-2 text-xs">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {question.type}
            </span>
            {question.matchPercent !== undefined && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Match: {question.matchPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Single/Multiple Choice Questions */}
        {(question.type === 'single' || question.type === 'multiple') && question.options && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Options:</h5>
            {question.options.map((option, optionIndex) => {
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
        {question.type === 'written' && (
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-sm mb-2">Your Answer:</h5>
              <div className="p-3 bg-white border rounded">
                {question.givenText || <span className="text-gray-400 italic">No answer provided</span>}
              </div>
            </div>
            {question.matchPercent !== undefined && (
              <div className="text-sm">
                <span className="font-medium">Match Percentage: </span>
                <span className={question.matchPercent >= 80 ? 'text-green-600' : 'text-red-600'}>
                  {question.matchPercent}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Result Summary */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`font-medium ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
            {question.type === 'written' && question.matchPercent !== undefined && (
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
        <div className="text-lg">Loading review...</div>
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
            onClick={() => navigate('/interviews')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const correctCount = reviewData.questions.filter(q => q.isCorrect).length;
  const totalQuestions = reviewData.questions.length;
  const overallAccuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(`/interviews/summary/${sessionId}`)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Summary</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Interview Review</h1>
        </div>
        <p className="text-gray-600">
          Review your answers and see the correct solutions
        </p>
      </div>

      {/* Summary Stats */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Question-by-Question Review</h2>
        {reviewData.questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => navigate(`/interviews/summary/${sessionId}`)}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Summary
        </button>
        <button
          onClick={() => navigate('/interviews')}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Interviews
        </button>
      </div>
    </div>
  );
};

export default InterviewReview;