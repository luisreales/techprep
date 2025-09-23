import React from 'react';
import { CheckCircle } from 'lucide-react';
import { EnhancedQuestion } from '@/services/questionBankApi';

interface QuestionPreviewModalProps {
  question: EnhancedQuestion;
  onClose: () => void;
}

const typeLabels = {
  single_choice: 'Single Choice',
  multi_choice: 'Multiple Choice',
  written: 'Written'
};

const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({ question, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Question Preview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Question Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <span className="ml-2">{typeLabels[question.type]}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Level:</span>
                <span className="ml-2 capitalize">{question.level}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Estimated Time:</span>
                <span className="ml-2">{question.estimatedTimeMinutes} minutes</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Bloom's Taxonomy:</span>
                <span className="ml-2 capitalize">{question.bloomsTaxonomy}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Question:</h3>
              <p className="text-gray-900 whitespace-pre-line">{question.text}</p>
            </div>

            {/* Options */}
            {question.options && question.options.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Options:</h3>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-lg border ${
                        option.isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      {option.explanation && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Answer */}
            {question.officialAnswer && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Official Answer:</h3>
                <p className="text-gray-900 whitespace-pre-line">{question.officialAnswer}</p>
              </div>
            )}

            {/* Explanations */}
            {question.explanations && question.explanations.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Explanations:</h3>
                <div className="space-y-2">
                  {question.explanations.map(explanation => (
                    <div key={explanation.id} className="p-3 bg-yellow-50 rounded-lg">
                      <div className="font-medium text-sm text-yellow-800 mb-1">
                        {explanation.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <p className="text-yellow-900">{explanation.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            {question.stats && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Attempts:</span>
                    <span className="font-medium">{question.stats.totalAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Correct Attempts:</span>
                    <span className="font-medium">{question.stats.correctAttempts}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Score:</span>
                    <span className="font-medium">
                      {question.stats.averageScore != null ? `${question.stats.averageScore.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Time:</span>
                    <span className="font-medium">
                      {question.stats.averageTimeSpent != null ? `${Math.round(question.stats.averageTimeSpent)}s` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPreviewModal;
