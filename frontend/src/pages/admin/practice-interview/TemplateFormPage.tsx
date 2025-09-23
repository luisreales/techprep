import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Save, ArrowLeft, Info, Clock, Shield, Award, CreditCard } from 'lucide-react';
import { useTemplate, useCreateTemplate, useUpdateTemplate } from '@/hooks/usePracticeInterview';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateKind,
  VisibilityType,
  FeedbackMode,
  NavigationMode
} from '@/types/practiceInterview';
import { useTopicsQuery } from '@/hooks/useTopicsQuery';

interface FormData {
  name: string;
  kind: TemplateKind;
  visibilityDefault: VisibilityType;
  topics: number[];
  levels: string[];
  countSingle: number;
  countMulti: number;
  countWritten: number;
  totalSec?: number;
  perQuestionSec?: number;
  navigationMode: NavigationMode;
  allowPause: boolean;
  maxBacktracks?: number;
  feedbackMode: FeedbackMode;
  showHints: boolean;
  showSources: boolean;
  showGlossary: boolean;
  maxAttempts: number;
  cooldownHours: number;
  requireFullscreen: boolean;
  blockCopyPaste: boolean;
  trackFocusLoss: boolean;
  proctoring: boolean;
  certificationEnabled: boolean;
  interviewCost: number;
}

export const TemplateFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const templateId = id && !isNaN(parseInt(id)) ? parseInt(id) : 0;
  const { data: template, isLoading, error } = useTemplate(templateId);
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const { data: topicsData = [], isLoading: topicsLoading } = useTopicsQuery();

  const [activeTab, setActiveTab] = useState('basic');
  const [submitError, setSubmitError] = useState<string | null>(null);


  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      kind: TemplateKind.Practice,
      visibilityDefault: VisibilityType.Public,
      topics: [],
      levels: ['basic', 'intermediate'],
      countSingle: 5,
      countMulti: 3,
      countWritten: 2,
      totalSec: 3600, // 1 hour
      perQuestionSec: 180, // 3 minutes
      navigationMode: NavigationMode.Linear,
      allowPause: true,
      maxBacktracks: 3,
      feedbackMode: FeedbackMode.Immediate,
      showHints: true,
      showSources: true,
      showGlossary: true,
      maxAttempts: 3,
      cooldownHours: 24,
      requireFullscreen: false,
      blockCopyPaste: false,
      trackFocusLoss: false,
      proctoring: false,
      certificationEnabled: false,
      interviewCost: 1
    }
  });

  const watchedKind = watch('kind');

  // Populate form when editing
  useEffect(() => {
    if (template?.data && isEditing) {
      const t = template.data;

      // Use reset to populate all form fields at once
      reset({
        name: t.name,
        kind: t.kind,
        visibilityDefault: t.visibilityDefault,
        topics: t.selection.byTopics || [],
        levels: t.selection.levels || [],
        countSingle: t.selection.countSingle ?? 0,
        countMulti: t.selection.countMulti ?? 0,
        countWritten: t.selection.countWritten ?? 0,
        totalSec: t.timers.totalSec,
        perQuestionSec: t.timers.perQuestionSec,
        navigationMode: t.navigation.mode,
        allowPause: t.navigation.allowPause,
        maxBacktracks: t.navigation.maxBacktracks,
        feedbackMode: t.feedback.mode,
        showHints: t.aids.showHints,
        showSources: t.aids.showSources,
        showGlossary: t.aids.showGlossary,
        maxAttempts: t.attempts.max,
        cooldownHours: t.attempts.cooldownHours,
        requireFullscreen: t.integrity.requireFullscreen,
        blockCopyPaste: t.integrity.blockCopyPaste,
        trackFocusLoss: t.integrity.trackFocusLoss,
        proctoring: t.integrity.proctoring,
        certificationEnabled: t.certification.enabled,
        interviewCost: t.credits.interviewCost
      });
    }
  }, [template, isEditing, reset]);

  // Apply Interview mode restrictions
  useEffect(() => {
    if (watchedKind === TemplateKind.Interview) {
      setValue('feedbackMode', FeedbackMode.End);
      setValue('allowPause', false);
      setValue('showHints', false);
      setValue('showSources', false);
      setValue('showGlossary', false);
    }
  }, [watchedKind, setValue]);

  // Clear error message when form data changes
  useEffect(() => {
    if (submitError) {
      setSubmitError(null);
    }
  }, [watch()]); // Watch all form data

  // Watch for mutation errors and set submitError
  useEffect(() => {
    const mutationError = updateMutation.error || createMutation.error;
    if (mutationError) {
      handleError(mutationError);
    }
  }, [updateMutation.error, createMutation.error]);

  const handleError = (error: any) => {
    console.error('Failed to save template:', error);

    // Extract error message from the API response
    let errorMessage = 'Failed to save template. Please try again.';

    // Handle different error response formats
    if (error?.response?.data?.error?.message) {
      // API error format: { error: { message: "..." } }
      errorMessage = error.response.data.error.message;
    } else if (error?.response?.data?.message) {
      // Direct message format: { message: "..." }
      errorMessage = error.response.data.message;
    } else if (error?.data?.error?.message) {
      // React Query wrapped error format
      errorMessage = error.data.error.message;
    } else if (error?.data?.message) {
      // React Query wrapped message format
      errorMessage = error.data.message;
    } else if (error?.message) {
      // Standard error object
      errorMessage = error.message;
    }

    console.error('Error details:', {
      error,
      extractedMessage: errorMessage,
      errorResponse: error?.response?.data,
      errorData: error?.data
    });

    setSubmitError(errorMessage);
  };

  const onSubmit = (data: FormData) => {
    setSubmitError(null); // Clear any previous errors

    const payload: CreateTemplateDto | UpdateTemplateDto = {
      name: data.name,
      kind: data.kind,
      visibilityDefault: data.visibilityDefault,
      selection: {
        byTopics: data.topics,
        levels: data.levels,
        countSingle: Number(data.countSingle ?? 0),
        countMulti: Number(data.countMulti ?? 0),
        countWritten: Number(data.countWritten ?? 0)
      },
      timers: {
        totalSec: data.totalSec,
        perQuestionSec: data.perQuestionSec
      },
      navigation: {
        mode: data.navigationMode,
        allowPause: data.allowPause,
        maxBacktracks: data.maxBacktracks
      },
      feedback: {
        mode: data.feedbackMode
      },
      aids: {
        showHints: data.showHints,
        showSources: data.showSources,
        showGlossary: data.showGlossary
      },
      attempts: {
        max: Number(data.maxAttempts ?? 0),
        cooldownHours: Number(data.cooldownHours ?? 0)
      },
      integrity: {
        requireFullscreen: data.requireFullscreen,
        blockCopyPaste: data.blockCopyPaste,
        trackFocusLoss: data.trackFocusLoss,
        proctoring: data.proctoring
      },
      certification: {
        enabled: data.certificationEnabled
      },
      credits: {
        interviewCost: Number(data.interviewCost ?? 0)
      }
    };

    if (isEditing && templateId) {
      updateMutation.mutate(
        { id: templateId, data: payload },
        {
          onSuccess: () => {
            navigate('/admin/practice-interview/templates');
          },
          onError: (error) => {
            handleError(error);
          }
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate('/admin/practice-interview/templates');
        },
        onError: (error) => {
          handleError(error);
        }
      });
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'selection', label: 'Question Selection', icon: Info },
    { id: 'timers', label: 'Timers & Navigation', icon: Clock },
    { id: 'features', label: 'Features & Aids', icon: Info },
    { id: 'integrity', label: 'Security & Integrity', icon: Shield },
    { id: 'completion', label: 'Completion & Credits', icon: Award }
  ];

  if (isLoading && isEditing) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-2 text-center text-gray-600">Loading template {templateId}...</p>
      </div>
    );
  }

  if (error && isEditing) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load template: {error.message}</p>
          <button
            onClick={() => navigate('/admin/practice-interview/templates')}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/practice-interview/templates')}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-gray-600 mt-1">
            Configure settings for practice sessions or interviews
          </p>
        </div>
      </div>

      {/* Error Message Display */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error saving template</h3>
              <p className="mt-1 text-sm text-red-700">{submitError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-4 w-4 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., JavaScript Fundamentals"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <Controller
                    name="kind"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={TemplateKind.Practice}>Practice (with immediate feedback)</option>
                        <option value={TemplateKind.Interview}>Interview (no aids, end feedback)</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Visibility
                  </label>
                  <Controller
                    name="visibilityDefault"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={VisibilityType.Public}>Public (all users)</option>
                        <option value={VisibilityType.Group}>Group (specific groups)</option>
                        <option value={VisibilityType.Private}>Private (specific users)</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {watchedKind === TemplateKind.Interview && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Interview Mode:</strong> This template will automatically disable aids (hints, sources, glossary),
                    set feedback to end-only, and disable pause functionality to maintain interview integrity.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'selection' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Question Selection Criteria</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topics
                  </label>
                  {topicsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      Loading topics...
                    </div>
                  ) : topicsData.length === 0 ? (
                    <p className="text-sm text-gray-500">No topics available yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {topicsData.map((topic) => (
                        <Controller
                          key={topic.id}
                          name="topics"
                          control={control}
                          render={({ field: { value, onChange } }) => {
                            const checked = value.includes(topic.id);
                            return (
                              <label className="flex items-center rounded-md border border-gray-200 px-3 py-2 shadow-sm hover:border-blue-300">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      onChange([...value, topic.id]);
                                    } else {
                                      onChange(value.filter((id: number) => id !== topic.id));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{topic.name}</span>
                              </label>
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Select one or more topics. Leave all unchecked to allow any topic.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Levels
                  </label>
                  <div className="space-y-2">
                    {['basic', 'intermediate', 'advanced'].map((level) => (
                      <Controller
                        key={level}
                        name="levels"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value.includes(level)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  onChange([...value, level]);
                                } else {
                                  onChange(value.filter((l: string) => l !== level));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                          </label>
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Select at least one level. Empty = allow all.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Single Choice Questions
                  </label>
                  <Controller
                    name="countSingle"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Multiple Choice Questions
                  </label>
                  <Controller
                    name="countMulti"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Written Questions
                  </label>
                  <Controller
                    name="countWritten"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timers' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Timers & Navigation</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Time Limit (seconds)
                  </label>
                  <Controller
                    name="totalSec"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="60"
                        placeholder="3600"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">3600 = 1 hour</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Question Time Limit (seconds)
                  </label>
                  <Controller
                    name="perQuestionSec"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="30"
                        placeholder="180"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">180 = 3 minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Navigation Mode
                  </label>
                  <Controller
                    name="navigationMode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={NavigationMode.Linear}>Linear (sequential only)</option>
                        <option value={NavigationMode.Free}>Free (jump between questions)</option>
                        <option value={NavigationMode.Restricted}>Restricted (limited navigation)</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Backtracks
                  </label>
                  <Controller
                    name="maxBacktracks"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">Number of times users can go back</p>
                </div>

                <div className="md:col-span-2">
                  <Controller
                    name="allowPause"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={onChange}
                          disabled={watchedKind === TemplateKind.Interview}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Allow users to pause the session
                          {watchedKind === TemplateKind.Interview && (
                            <span className="text-gray-500"> (disabled for interviews)</span>
                          )}
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Features & Learning Aids</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Mode
                  </label>
                  <Controller
                    name="feedbackMode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={watchedKind === TemplateKind.Interview}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value={FeedbackMode.Immediate}>Immediate (after each question)</option>
                        <option value={FeedbackMode.End}>End (after completion)</option>
                        <option value={FeedbackMode.None}>None</option>
                      </select>
                    )}
                  />
                  {watchedKind === TemplateKind.Interview && (
                    <p className="mt-1 text-sm text-gray-500">Fixed to "End" for interviews</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts
                  </label>
                  <Controller
                    name="maxAttempts"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown Period (hours)
                  </label>
                  <Controller
                    name="cooldownHours"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="24"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">Time between attempts</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Learning Aids
                    {watchedKind === TemplateKind.Interview && (
                      <span className="text-gray-500"> (disabled for interviews)</span>
                    )}
                  </label>
                  <div className="space-y-3">
                    {[
                      { name: 'showHints', label: 'Show hints for questions' },
                      { name: 'showSources', label: 'Show reference sources' },
                      { name: 'showGlossary', label: 'Show glossary terms' }
                    ].map((aid) => (
                      <Controller
                        key={aid.name}
                        name={aid.name as keyof FormData}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value as boolean}
                              onChange={onChange}
                              disabled={watchedKind === TemplateKind.Interview}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">{aid.label}</span>
                          </label>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security & Integrity</h3>

              <div className="space-y-4">
                {[
                  { name: 'requireFullscreen', label: 'Require fullscreen mode', description: 'Force users to stay in fullscreen' },
                  { name: 'blockCopyPaste', label: 'Block copy/paste', description: 'Prevent copying text from questions' },
                  { name: 'trackFocusLoss', label: 'Track focus loss', description: 'Monitor when user leaves the window' },
                  { name: 'proctoring', label: 'Enable proctoring', description: 'Advanced monitoring and detection' }
                ].map((integrity) => (
                  <div key={integrity.name} className="border border-gray-200 rounded-lg p-4">
                    <Controller
                      name={integrity.name as keyof FormData}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <div>
                          <label className="flex items-start">
                            <input
                              type="checkbox"
                              checked={value as boolean}
                              onChange={onChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-700">{integrity.label}</span>
                              <p className="text-sm text-gray-500">{integrity.description}</p>
                            </div>
                          </label>
                        </div>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Integrity features help maintain fairness and prevent cheating,
                  especially important for interview templates. Enable based on your security requirements.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'completion' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Completion & Credits</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Controller
                    name="certificationEnabled"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={onChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-700">Enable certification</span>
                            <p className="text-sm text-gray-500">Generate certificates for successful completion</p>
                          </div>
                        </label>
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Cost (for interviews)
                  </label>
                  <Controller
                    name="interviewCost"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="1"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">Credits consumed when starting an interview</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-green-800 font-medium mb-2">Template Summary</h4>
                <div className="text-green-700 text-sm space-y-1">
                  <p>• Type: {watchedKind}</p>
                  <p>• Max Questions: {watch('maxQuestions') || 'Unlimited'}</p>
                  <p>• Time Limit: {watch('totalSec') ? `${Math.round(watch('totalSec')! / 60)} minutes` : 'None'}</p>
                  <p>• Cost: {watch('interviewCost')} credits</p>
                  <p>• Certification: {watch('certificationEnabled') ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/practice-interview/templates')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
{createMutation.isPending || updateMutation.isPending
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Template' : 'Create Template')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateFormPage;
