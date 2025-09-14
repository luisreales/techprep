import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Code2 } from 'lucide-react';
import type { ChallengeDetail, ChallengeCreate, ChallengeUpdate, Tag } from '@/types/challenges';

// Form validation schema
const challengeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  language: z.string().min(1, 'Language is required'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  officialSolution: z.string().optional(),
  testsJson: z.string().optional(),
  tags: z.array(z.string()).optional(),
  topicIds: z.array(z.number()).optional(),
});

type ChallengeFormData = z.infer<typeof challengeFormSchema>;

interface ChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  challenge?: ChallengeDetail | null;
  onSubmit: (data: ChallengeCreate | ChallengeUpdate) => Promise<void>;
  availableTags?: Tag[];
  loading?: boolean;
}

interface TestCaseFormData {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
}

export const ChallengeForm: React.FC<ChallengeFormProps> = ({
  isOpen,
  onClose,
  challenge,
  onSubmit,
  availableTags = [],
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'solution' | 'tests'>('basic');
  const [testCases, setTestCases] = useState<TestCaseFormData[]>([]);

  const isEditing = !!challenge;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      title: challenge?.title || '',
      language: challenge?.language || '',
      difficulty: challenge?.difficulty || '',
      prompt: challenge?.prompt || '',
      officialSolution: challenge?.officialSolution || '',
      testsJson: challenge?.testsJson || '',
      tags: challenge?.tags || [],
      topicIds: challenge?.topicIds || [],
    },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags',
  });

  const watchedTestsJson = watch('testsJson');

  // Parse test cases from JSON
  React.useEffect(() => {
    if (watchedTestsJson) {
      try {
        const parsed = JSON.parse(watchedTestsJson);
        if (Array.isArray(parsed)) {
          setTestCases(parsed);
        }
      } catch {
        // Invalid JSON, keep current test cases
      }
    }
  }, [watchedTestsJson]);

  // Update form when challenge changes
  React.useEffect(() => {
    if (challenge) {
      reset({
        title: challenge.title,
        language: challenge.language,
        difficulty: challenge.difficulty,
        prompt: challenge.prompt,
        officialSolution: challenge.officialSolution || '',
        testsJson: challenge.testsJson || '',
        tags: challenge.tags || [],
        topicIds: challenge.topicIds || [],
      });
    } else {
      reset({
        title: '',
        language: '',
        difficulty: '',
        prompt: '',
        officialSolution: '',
        testsJson: '',
        tags: [],
        topicIds: [],
      });
    }
  }, [challenge, reset]);

  const handleFormSubmit = async (data: ChallengeFormData) => {
    // Update testsJson with current test cases
    const testsJsonString = testCases.length > 0 ? JSON.stringify(testCases, null, 2) : '';
    
    const formData = {
      ...data,
      testsJson: testsJsonString || undefined,
    };

    await onSubmit(formData);
    onClose();
  };

  const addTestCase = () => {
    const newTestCase: TestCaseFormData = {
      id: `test_${Date.now()}`,
      input: '',
      expectedOutput: '',
      isHidden: false,
      description: '',
    };
    setTestCases([...testCases, newTestCase]);
  };

  const updateTestCase = (index: number, field: keyof TestCaseFormData, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
    setValue('testsJson', JSON.stringify(updated, null, 2));
  };

  const removeTestCase = (index: number) => {
    const updated = testCases.filter((_, i) => i !== index);
    setTestCases(updated);
    setValue('testsJson', JSON.stringify(updated, null, 2));
  };

  const addTagFromInput = (tagName: string) => {
    if (tagName && !tagFields.some(field => field.value === tagName)) {
      appendTag(tagName);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
        
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                {isEditing ? 'Edit Challenge' : 'Create New Challenge'}
              </h3>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                      activeTab === 'basic'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Basic Info
                  </button>
                  <button
                    onClick={() => setActiveTab('solution')}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                      activeTab === 'solution'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Code2 className="h-4 w-4 inline mr-1" />
                    Solution
                  </button>
                  <button
                    onClick={() => setActiveTab('tests')}
                    className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                      activeTab === 'tests'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Test Cases
                  </button>
                </nav>
              </div>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        {...register('title')}
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Challenge title..."
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                          Language *
                        </label>
                        <select
                          {...register('language')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select language...</option>
                          <option value="C#">C#</option>
                          <option value="JavaScript">JavaScript</option>
                          <option value="TypeScript">TypeScript</option>
                          <option value="Python">Python</option>
                          <option value="Java">Java</option>
                          <option value="Go">Go</option>
                          <option value="Rust">Rust</option>
                        </select>
                        {errors.language && (
                          <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                          Difficulty *
                        </label>
                        <select
                          {...register('difficulty')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select difficulty...</option>
                          <option value="Basic">Basic</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                        {errors.difficulty && (
                          <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                        Problem Description *
                      </label>
                      <textarea
                        {...register('prompt')}
                        rows={8}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Describe the problem in detail..."
                      />
                      {errors.prompt && (
                        <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {tagFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                            >
                              <span>{field.value}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableTags
                            .filter(tag => !tagFields.some(field => field.value === tag.name))
                            .map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => addTagFromInput(tag.name)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                + {tag.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solution Tab */}
                {activeTab === 'solution' && (
                  <div>
                    <label htmlFor="officialSolution" className="block text-sm font-medium text-gray-700">
                      Official Solution (Optional)
                    </label>
                    <textarea
                      {...register('officialSolution')}
                      rows={15}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                      placeholder="Provide an official solution for this challenge..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      The official solution will be shown to users after they complete the challenge.
                    </p>
                  </div>
                )}

                {/* Test Cases Tab */}
                {activeTab === 'tests' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Test Cases</h4>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Test Case
                      </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {testCases.map((testCase, index) => (
                        <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-900">
                              Test Case {index + 1}
                            </h5>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center text-sm text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={testCase.isHidden}
                                  onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                Hidden
                              </label>
                              <button
                                type="button"
                                onClick={() => removeTestCase(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Input
                              </label>
                              <textarea
                                value={testCase.input}
                                onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                rows={3}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                placeholder="Test input..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Expected Output
                              </label>
                              <textarea
                                value={testCase.expectedOutput}
                                onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                                rows={3}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                placeholder="Expected output..."
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description (Optional)
                            </label>
                            <input
                              type="text"
                              value={testCase.description || ''}
                              onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Test case description..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {testCases.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">No test cases added yet.</p>
                        <button
                          type="button"
                          onClick={addTestCase}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Add your first test case
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && (
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    )}
                    {isEditing ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};