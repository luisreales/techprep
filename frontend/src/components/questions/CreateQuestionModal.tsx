import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { EnhancedQuestion, questionBankApi } from '@/services/questionBankApi';

interface CreateQuestionModalProps {
  onClose: () => void;
  onQuestionCreated?: (question: EnhancedQuestion) => void;
  onQuestionUpdated?: (question: EnhancedQuestion) => void;
  question?: EnhancedQuestion | null;
}

const createDefaultOptions = () => ([
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false }
]);

const typeToEnumValue: Record<'single_choice' | 'multi_choice' | 'written', number> = {
  single_choice: 1,
  multi_choice: 2,
  written: 3
};

const levelToEnumValue: Record<'basic' | 'intermediate' | 'advanced', number> = {
  basic: 1,
  intermediate: 2,
  advanced: 3
};

const normalizeType = (type: number | string): 'single_choice' | 'multi_choice' | 'written' => {
  if (type === 1 || type === 'SingleChoice') return 'single_choice';
  if (type === 2 || type === 'MultiChoice') return 'multi_choice';
  if (type === 3 || type === 'Written') return 'written';
  return (type as 'single_choice' | 'multi_choice' | 'written') ?? 'single_choice';
};

const normalizeLevel = (level: number | string): 'basic' | 'intermediate' | 'advanced' => {
  if (level === 1 || level === 'Basic') return 'basic';
  if (level === 2 || level === 'Intermediate') return 'intermediate';
  if (level === 3 || level === 'Advanced') return 'advanced';
  return (level as 'basic' | 'intermediate' | 'advanced') ?? 'intermediate';
};

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  onClose,
  onQuestionCreated,
  onQuestionUpdated,
  question
}) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!question;
  const [formData, setFormData] = useState(() => {
    if (!question) {
      return {
        text: '',
        topicId: 0,
        type: 'single_choice' as const,
        level: 'intermediate' as const,
        officialAnswer: '',
        estimatedTimeMinutes: 5,
        bloomsTaxonomy: 'understand' as const,
        cognitiveLoad: 'medium' as const,
        options: createDefaultOptions()
      };
    }

    return {
      text: question.text,
      topicId: question.topicId ?? 0,
      type: normalizeType(question.type as any),
      level: normalizeLevel(question.level as any),
      officialAnswer: question.officialAnswer || '',
      estimatedTimeMinutes: question.estimatedTimeMinutes,
      bloomsTaxonomy: question.bloomsTaxonomy,
      cognitiveLoad: question.cognitiveLoad,
      options: question.options && question.options.length > 0
        ? question.options.map(option => ({
            text: option.text,
            isCorrect: option.isCorrect
          }))
        : createDefaultOptions()
    };
  });

  useEffect(() => {
    if (!question) {
      setFormData({
        text: '',
        topicId: 0,
        type: 'single_choice',
        level: 'intermediate',
        officialAnswer: '',
        estimatedTimeMinutes: 5,
        bloomsTaxonomy: 'understand',
        cognitiveLoad: 'medium',
        options: createDefaultOptions()
      });
      return;
    }

    setFormData({
      text: question.text,
      topicId: question.topicId ?? 0,
      type: normalizeType(question.type as any),
      level: normalizeLevel(question.level as any),
      officialAnswer: question.officialAnswer || '',
      estimatedTimeMinutes: question.estimatedTimeMinutes,
      bloomsTaxonomy: question.bloomsTaxonomy,
      cognitiveLoad: question.cognitiveLoad,
      options: question.options && question.options.length > 0
        ? question.options.map(option => ({
            text: option.text,
            isCorrect: option.isCorrect
          }))
        : createDefaultOptions()
    });
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.topicId || formData.topicId <= 0) {
        alert('Please provide a valid topic ID before saving.');
        return;
      }

      const optionsPayload =
        formData.type === 'written'
          ? []
          : formData.options.map((option, index) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              orderIndex: index + 1
            }));

      const questionData = {
        topicId: formData.topicId,
        text: formData.text,
        type: typeToEnumValue[formData.type],
        level: levelToEnumValue[formData.level],
        officialAnswer: formData.officialAnswer,
        options: optionsPayload,
        learningResources: []
      };

      if (isEditing && question) {
        const response = await questionBankApi.updateQuestion(question.id, questionData as any);
        if (response.success && response.data) {
          onQuestionUpdated?.(response.data);
          onClose();
        }
      } else {
        const response = await questionBankApi.createQuestion(questionData as any);
        if (response.success && response.data) {
          onQuestionCreated?.(response.data);
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to save question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Question' : 'Create New Question'}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter the question text..."
                required
              />
            </div>

            {/* Topic ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic ID *
              </label>
              <input
                type="number"
                min="1"
                value={formData.topicId}
                onChange={(e) => setFormData(prev => ({ ...prev, topicId: parseInt(e.target.value, 10) || 0 }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Type and Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="single_choice">Single Choice</option>
                  <option value="multi_choice">Multiple Choice</option>
                  <option value="written">Written</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.estimatedTimeMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTimeMinutes: parseInt(e.target.value) || 5 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Options (for choice questions) */}
            {(formData.type === 'single_choice' || formData.type === 'multi_choice') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options *
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type={formData.type === 'single_choice' ? 'radio' : 'checkbox'}
                        name="correct-answer"
                        checked={option.isCorrect}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          if (formData.type === 'single_choice') {
                            // For single choice, only one can be correct
                            newOptions.forEach((opt, i) => {
                              opt.isCorrect = i === index && e.target.checked;
                            });
                          } else {
                            newOptions[index].isCorrect = e.target.checked;
                          }
                          setFormData(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index].text = e.target.value;
                          setFormData(prev => ({ ...prev, options: newOptions }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = formData.options.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          options: [...prev.options, { text: '', isCorrect: false }]
                        }));
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Plus size={16} />
                      Add Option
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Official Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Official Answer/Explanation *
              </label>
              <textarea
                value={formData.officialAnswer}
                onChange={(e) => setFormData(prev => ({ ...prev, officialAnswer: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Provide the official answer or explanation..."
                required
              />
            </div>

            {/* Bloom's Taxonomy and Cognitive Load */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bloom's Taxonomy Level
                </label>
                <select
                  value={formData.bloomsTaxonomy}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloomsTaxonomy: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="remember">Remember</option>
                  <option value="understand">Understand</option>
                  <option value="apply">Apply</option>
                  <option value="analyze">Analyze</option>
                  <option value="evaluate">Evaluate</option>
                  <option value="create">Create</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cognitive Load
                </label>
                <select
                  value={formData.cognitiveLoad}
                  onChange={(e) => setFormData(prev => ({ ...prev, cognitiveLoad: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isEditing ? (loading ? 'Saving...' : 'Save Changes') : (loading ? 'Creating...' : 'Create Question')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionModal;
