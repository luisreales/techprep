import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceSchema, ResourceFormData, resourceDefaults, formatDuration, parseDuration } from '@/schemas/resourceSchema';
import { ResourceKind, ResourceDifficulty, ResourceDetail } from '@/types/resources';
import { Topic } from '@/services/admin/topicsApi';
import { X, Save, Book, Video, FileText, Star } from 'lucide-react';

interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: ResourceDetail | null;
  topics: Topic[];
  onSubmit: (data: ResourceFormData) => Promise<void>;
  loading?: boolean;
  viewMode?: boolean;
}

const kindIcons = {
  [ResourceKind.Book]: Book,
  [ResourceKind.Video]: Video,
  [ResourceKind.Article]: FileText,
};

const kindLabels = {
  [ResourceKind.Book]: 'Book',
  [ResourceKind.Video]: 'Video',
  [ResourceKind.Article]: 'Article',
};

const difficultyLabels = {
  [ResourceDifficulty.Basic]: 'Basic',
  [ResourceDifficulty.Medium]: 'Medium',
  [ResourceDifficulty.Hard]: 'Hard',
};

export const ResourceForm: React.FC<ResourceFormProps> = ({
  isOpen,
  onClose,
  resource,
  topics,
  onSubmit,
  loading = false,
  viewMode = false,
}) => {
  const isEditing = !!resource;
  const title = viewMode ? 'View Resource Details' : isEditing ? 'Edit Resource' : 'New Resource';

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: resourceDefaults,
  });

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = form;

  const watchedKind = watch('kind');
  const watchedRating = watch('rating');

  // Reset form when resource changes
  React.useEffect(() => {
    if (resource) {
      const formData: ResourceFormData = {
        id: resource.id,
        kind: resource.kind as ResourceKind,
        title: resource.title,
        url: resource.url,
        author: resource.author || '',
        duration: formatDuration(resource.duration) || '',
        rating: resource.rating,
        description: resource.description || '',
        difficulty: resource.difficulty as ResourceDifficulty || ResourceDifficulty.Basic,
        questionIds: resource.questionIds || [],
        topicIds: topics.filter(t => resource.topics.includes(t.name)).map(t => t.id),
      };
      reset(formData);
    } else {
      reset(resourceDefaults);
    }
  }, [resource, reset, topics]);

  const handleFormSubmit = async (data: ResourceFormData) => {
    try {
      const processedData = {
        ...data,
        duration: parseDuration(data.duration || ''),
        rating: data.rating === undefined ? null : data.rating,
      };
      
      await onSubmit(processedData);
      onClose();
    } catch (error) {
      console.error('Failed to submit resource:', error);
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
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
              
              {/* Resource Kind */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ResourceKind).map((kind) => {
                    const IconComponent = kindIcons[kind];
                    return (
                      <label
                        key={kind}
                        className={`relative flex items-center justify-center px-3 py-3 text-sm font-medium border rounded-md cursor-pointer transition-all ${
                          watchedKind === kind
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          value={kind}
                          className="sr-only"
                          {...register('kind')}
                        />
                        <IconComponent className="h-4 w-4 mr-2" />
                        {kindLabels[kind]}
                      </label>
                    );
                  })}
                </div>
                {errors.kind && (
                  <p className="mt-1 text-sm text-red-600">{errors.kind.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter resource title..."
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/resource"
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.url ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  {...register('url')}
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                )}
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  placeholder="Author or creator name"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('author')}
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="HH:MM:SS (e.g., 01:30:00)"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register('duration')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: HH:MM:SS or leave empty
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="0-5"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register('rating', { valueAsNumber: true })}
                    />
                    {watchedRating !== undefined && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(watchedRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                  )}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ResourceDifficulty).map((difficulty) => (
                    <label
                      key={difficulty}
                      className={`relative flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md cursor-pointer transition-all ${
                        watch('difficulty') === difficulty
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={difficulty}
                        className="sr-only"
                        {...register('difficulty')}
                      />
                      {difficultyLabels[difficulty]}
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Brief description of the resource..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  {...register('description')}
                />
              </div>
            </div>

            {/* Topics Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Topics</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Topics
                </label>
                <select
                  multiple
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('topicIds', { 
                    setValueAs: (value) => Array.from(value).map(v => parseInt(v as string)) 
                  })}
                  style={{ minHeight: '120px' }}
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple topics
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {viewMode ? 'Close' : 'Cancel'}
            </button>
            {!viewMode && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update' : 'Create'} Resource
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};