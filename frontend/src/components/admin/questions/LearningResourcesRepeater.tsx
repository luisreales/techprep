import React from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { QuestionFormData } from '@/schemas/questionSchema';
import { X, Plus, ExternalLink } from 'lucide-react';

interface LearningResourcesRepeaterProps {
  control: Control<QuestionFormData>;
  errors?: any;
}

export const LearningResourcesRepeater: React.FC<LearningResourcesRepeaterProps> = ({
  control,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'learningResources',
  });

  const addResource = () => {
    append({
      id: crypto.randomUUID(),
      title: '',
      url: '',
      description: '',
      createdAt: new Date().toISOString(),
    });
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Let required validation handle empty URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Learning Resources
        </label>
        <button
          type="button"
          onClick={addResource}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Resource
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">No learning resources added yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add helpful resources like documentation, tutorials, or articles
          </p>
          <button
            type="button"
            onClick={addResource}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add First Resource
          </button>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Resource {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Remove resource"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., React Documentation - Hooks"
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors?.learningResources?.[index]?.title
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...control.register(`learningResources.${index}.title`)}
                />
                {errors?.learningResources?.[index]?.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.learningResources[index].title.message}
                  </p>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className={`block w-full px-3 py-2 pr-8 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors?.learningResources?.[index]?.url
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...control.register(`learningResources.${index}.url`, {
                      validate: validateUrl,
                    })}
                  />
                  <ExternalLink className="absolute right-2 top-2.5 h-3 w-3 text-gray-400" />
                </div>
                {errors?.learningResources?.[index]?.url && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.learningResources[index].url.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of what this resource covers..."
                  className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors?.learningResources?.[index]?.description
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...control.register(`learningResources.${index}.description`)}
                />
                {errors?.learningResources?.[index]?.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.learningResources[index].description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        <p>
          Add helpful resources like documentation, tutorials, articles, or videos that can help
          users understand the topic better.
        </p>
        <p className="mt-1">
          Resources will be shown to users after they answer questions for additional learning.
        </p>
      </div>
    </div>
  );
};