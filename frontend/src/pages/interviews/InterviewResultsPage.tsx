import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Trophy, ArrowLeft, FileText } from 'lucide-react';
import type { SessionSummary } from '@/services/sessionsApi';
import type { TemplateDto } from '@/types/practiceInterview';

interface LocationState {
  summary: SessionSummary;
  template: TemplateDto;
}

export const InterviewResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { summary, template } = (location.state as LocationState) || {};

  if (!summary || !template) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-600">No interview results found.</p>
          <button
            onClick={() => navigate('/interviews')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/interviews')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interviews
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Interview Results</h1>
        <p className="text-gray-600 mt-2">{template.name}</p>
      </div>

      {/* Overall Score Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(summary.score, summary.totalQuestions)}`}>
              {summary.score}/{summary.totalQuestions}
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((summary.score / summary.totalQuestions) * 100)}% Accuracy
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {summary.correctAnswers}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {summary.incorrectAnswers}
            </div>
            <div className="text-sm text-gray-600">Incorrect Answers</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatTime(summary.totalTimeMs)}
            </div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
      </div>

      {/* Topic Performance */}
      {summary.topicStats && summary.topicStats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Performance by Topic</h2>
          <div className="space-y-4">
            {summary.topicStats.map((topic) => (
              <div key={topic.topicId} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium">{topic.topicName}</h3>
                  <p className="text-sm text-gray-600">
                    {topic.correctAnswers}/{topic.totalQuestions} questions correct
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                    {Math.round(topic.accuracy)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Results */}
      {summary.questions && summary.questions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Question Details
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.questions.map((question, index) => (
              <div key={question.questionId} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {question.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Question {index + 1}</h3>
                      {question.matchPercent !== null && (
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          question.matchPercent >= 80 ? 'bg-green-100 text-green-800' :
                          question.matchPercent >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(question.matchPercent)}% match
                        </span>
                      )}
                    </div>

                    <p className="text-gray-900 mb-4">{question.questionText}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h4>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm">{question.userAnswer || 'No answer provided'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</h4>
                        <div className="p-3 bg-blue-50 rounded-md">
                          <p className="text-sm">{question.officialAnswer}</p>
                        </div>
                      </div>

                      {question.explanation && question.explanation !== question.officialAnswer && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Explanation:</h4>
                          <div className="p-3 bg-yellow-50 rounded-md">
                            <p className="text-sm">{question.explanation}</p>
                          </div>
                        </div>
                      )}

                      {question.resources && question.resources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Resources:</h4>
                          <div className="flex flex-wrap gap-2">
                            {question.resources.map((resource) => (
                              <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                              >
                                {resource.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/interviews')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Back to Interviews
        </button>

        <button
          onClick={() => navigate(`/interviews/runner/${template.id}`)}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Retake Interview
        </button>
      </div>
    </div>
  );
};