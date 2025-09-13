import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Question, QuestionFormData, questionSchemaRefined, questionDefaults } from '@/schemas/questionSchema';
import { QuestionType, DifficultyLevel, questionTypeLabels, difficultyLevelLabels } from '@/utils/enums';
import { OptionsRepeater } from '@/components/admin/questions/OptionsRepeater';
import { LearningResourcesRepeater } from '@/components/admin/questions/LearningResourcesRepeater';
import { Topic } from '@/services/admin/topicsApi';
import { X, Save, AlertCircle } from 'lucide-react';

interface QuestionFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  topics: Topic[];
  onSubmit: (data: QuestionFormData) => Promise<void>;
  loading?: boolean;
}

export const QuestionFormDrawer: React.FC<QuestionFormDrawerProps> = ({
  isOpen,
  onClose,
  question,
  topics,
  onSubmit,
  loading = false,
}) => {
  const isEditing = !!question;
  const title = isEditing ? 'Edit Question' : 'New Question';

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchemaRefined),
    defaultValues: question || questionDefaults,
  });

  const { register, handleSubmit, watch, control, formState: { errors }, reset, setValue } = form;

  const watchedType = watch('type');
  const watchedTopicId = watch('topicId');

  // Update topicName when topicId changes
  React.useEffect(() => {
    const selectedTopic = topics.find(t => t.id === watchedTopicId);
    if (selectedTopic) {
      setValue('topicName', selectedTopic.name);
    }
  }, [watchedTopicId, topics, setValue]);

  // Reset form when question changes
  React.useEffect(() => {
    if (question) {
      // Ensure the question data is properly formatted for the form
      const formData = {
        ...question,
        // Ensure type and level are numbers
        type: typeof question.type === 'string' ? parseInt(question.type) : question.type,
        level: typeof question.level === 'string' ? parseInt(question.level) : question.level,
        // Ensure arrays exist
        options: question.options || [],
        learningResources: question.learningResources || [],
      };
      reset(formData);
    } else {
      reset(questionDefaults);
    }
  }, [question, reset]);

  const handleFormSubmit = async (data: QuestionFormData) => {
    try {
      // Update orderIndex for options
      const processedData = {
        ...data,
        options: data.options.map((option, index) => ({
          ...option,
          orderIndex: index + 1,
        })),
      };
      
      await onSubmit(processedData);
      onClose();
    } catch (error) {
      console.error('Failed to submit question:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 space-y-8">
            {/* Basics Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Basics</h3>
              
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic *
                </label>
                <select
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.topicId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  {...register('topicId', { valueAsNumber: true })}
                >
                  <option value={0}>Select a topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {errors.topicId && (
                  <p className="mt-1 text-sm text-red-600">{errors.topicId.message}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(QuestionType).map((type) => (
                    <label
                      key={type}
                      className={`relative flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md cursor-pointer transition-all ${
                        watchedType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type}
                        className="sr-only"
                        {...register('type', { valueAsNumber: true })}
                      />
                      {questionTypeLabels[type]}
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(DifficultyLevel).map((level) => (
                    <label
                      key={level}
                      className={`relative flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md cursor-pointer transition-all ${
                        watch('level') === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={level}
                        className="sr-only"
                        {...register('level', { valueAsNumber: true })}
                      />
                      {difficultyLevelLabels[level]}
                    </label>
                  ))}
                </div>
                {errors.level && (
                  <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter the question prompt or statement..."
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.text ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  {...register('text')}
                />
                {errors.text && (
                  <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Content</h3>

              {/* Written Question - Official Answer */}
              {watchedType === QuestionType.Written && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Official Answer *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter the expected answer for evaluation..."
                    className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.officialAnswer ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    {...register('officialAnswer')}
                  />
                  <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      This answer is validated by ≥80% word matching in Study mode; 100% in Interview mode (future feature).
                    </p>
                  </div>
                  {errors.officialAnswer && (
                    <p className="mt-1 text-sm text-red-600">{errors.officialAnswer.message}</p>
                  )}
                </div>
              )}

              {/* Choice Questions - Options */}
              {(watchedType === QuestionType.SingleChoice || watchedType === QuestionType.MultiChoice) && (
                <OptionsRepeater
                  control={control}
                  questionType={watchedType}
                  errors={errors}
                  setValue={setValue}
                />
              )}
            </div>

            {/* Learning Resources Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Learning Resources</h3>
              <LearningResourcesRepeater control={control} errors={errors} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update' : 'Create'} Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};