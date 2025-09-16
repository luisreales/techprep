import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SessionTemplateCreateDto, SessionTemplateDetail } from '@/services/admin/sessionTemplatesApi';
import { apiClient } from '@/services/api';
import type { Topic } from '@/types';
import { challengeAdminApi } from '@/services/challengeApi';
import { questionsApi } from '@/services/admin/questionsApi';
import type { ChallengeListItem } from '@/types/challenges';

type FormValues = SessionTemplateCreateDto;

const defaultValues: FormValues = {
  name: '',
  mode: 'study',
  topics: [],
  levels: [],
  randomOrder: true,
  timeLimitMin: undefined,
  thresholdWritten: 80,
  questions: {
    selection: 'auto',
    auto: { single: 5, multi: 5, written: 5, byLevel: {} },
    manualIds: [],
  },
  challenges: {
    selection: 'auto',
    auto: { total: 0, byLevel: {}, languages: [] },
    manualIds: [],
  },
  status: 'draft',
};

export interface SessionTemplateFormProps {
  initial?: SessionTemplateDetail;
  onSubmit: (values: FormValues) => Promise<void> | void;
  submitLabel?: string;
}

export const SessionTemplateForm: React.FC<SessionTemplateFormProps> = ({ initial, onSubmit, submitLabel = 'Save' }) => {
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({ defaultValues });
  const [activeTab, setActiveTab] = useState<'general' | 'questions' | 'challenges'>('general');
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  const selectedLevels = watch('levels');
  const questionsSelection = watch('questions.selection');
  const challengesSelection = watch('challenges.selection');
  const [questionPool, setQuestionPool] = useState<{ id: string; text: string; topicId: number; level: string; type: string }[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [challengePool, setChallengePool] = useState<ChallengeListItem[]>([]);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<number[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        mode: initial.mode,
        topics: initial.topics,
        levels: initial.levels,
        randomOrder: initial.randomOrder,
        timeLimitMin: initial.timeLimitMin,
        thresholdWritten: initial.thresholdWritten,
        questions: initial.questions,
        challenges: initial.challenges,
        status: initial.status,
      });
    }
  }, [initial, reset]);

  // Load topics for multi-select
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.getTopics();
        if ((res as any)?.success && (res as any)?.data && mounted) {
          setAllTopics((res as any).data as Topic[]);
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Ensure byLevel keys exist for selected levels
  useEffect(() => {
    (selectedLevels || []).forEach((lvl) => {
      const qKey = `questions.auto.byLevel.${lvl}` as const;
      const cKey = `challenges.auto.byLevel.${lvl}` as const;
      const qVal = watch(qKey as any);
      const cVal = watch(cKey as any);
      if (qVal === undefined) setValue(qKey as any, 0 as any);
      if (cVal === undefined) setValue(cKey as any, 0 as any);
    });
  }, [selectedLevels]);

  // Sync manual selections into form values
  useEffect(() => {
    if (questionsSelection === 'manual') {
      setValue('questions.manualIds', selectedQuestionIds as any, { shouldDirty: true });
    }
  }, [questionsSelection, selectedQuestionIds]);
  useEffect(() => {
    if (challengesSelection === 'manual') {
      setValue('challenges.manualIds', selectedChallengeIds as any, { shouldDirty: true });
    }
  }, [challengesSelection, selectedChallengeIds]);

  const fetchQuestions = async () => {
    setQuestionsError(null);
    const topics = (watch('topics') as unknown as number[]) || [];
    if (!topics.length) {
      setQuestionsError('Select at least one topic first');
      setQuestionPool([]);
      return;
    }
    setIsLoadingQuestions(true);
    try {
      const pool: typeof questionPool = [];
      for (const topicId of topics) {
        const res = await questionsApi.list({ topicId, page: 1, limit: 100 });
        if (res?.success && res.data?.questions) {
          for (const q of res.data.questions) {
            pool.push({ id: q.id as string, text: q.text, topicId: q.topicId, level: String(q.level), type: String(q.type) });
          }
        }
      }
      const map = new Map(pool.map(q => [q.id, q]));
      setQuestionPool(Array.from(map.values()));
    } catch (e: any) {
      setQuestionsError(e?.response?.data?.message || 'Failed to load questions');
      setQuestionPool([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const fetchChallenges = async () => {
    const topicIds = (watch('topics') as unknown as number[]) || [];
    try {
      const res = await challengeAdminApi.list({ page: 1, pageSize: 50, topicIds });
      if (res?.success && res.data?.challenges) {
        setChallengePool(res.data.challenges);
      }
    } catch {}
  };

  const ALL_LEVELS = ['basic', 'medium', 'difficult'] as const;

  return (
    <form onSubmit={handleSubmit(async (v) => { await onSubmit(v); })} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {['general','questions','challenges'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t as any)}
              className={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab===t?'border-indigo-600 text-indigo-600':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {t === 'general' ? 'General' : t === 'questions' ? 'Questions' : 'Challenges'}
            </button>
          ))}
        </nav>
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input {...register('name', { required: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mode</label>
            <select {...register('mode')} className="mt-1 w-full px-3 py-2 border rounded-md">
              <option value="study">Study</option>
              <option value="interview">Interview</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
            <input type="number" {...register('timeLimitMin', { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Written Threshold (%)</label>
            <input type="number" {...register('thresholdWritten', { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Random Order</label>
            <input type="checkbox" {...register('randomOrder')} className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Topics</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {allTopics.map((t) => {
                const selected: number[] = (watch('topics') as unknown as number[]) || [];
                const checked = selected.includes(t.id);
                return (
                  <label key={t.id} className="inline-flex items-center gap-2 text-sm bg-gray-50 rounded-md px-3 py-2 border">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set<number>(selected);
                        if (e.target.checked) next.add(t.id); else next.delete(t.id);
                        setValue('topics', Array.from(next) as any, { shouldDirty: true });
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select one or more topics for this session template.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Levels</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ALL_LEVELS.map((lvl) => {
                const selected: string[] = (watch('levels') as unknown as string[]) || [];
                const checked = selected.includes(lvl);
                return (
                  <label key={lvl} className="inline-flex items-center gap-2 text-sm bg-gray-50 rounded-md px-3 py-2 border">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set<string>(selected);
                        if (e.target.checked) next.add(lvl); else next.delete(lvl);
                        setValue('levels', Array.from(next) as any, { shouldDirty: true });
                      }}
                    />
                    <span className="capitalize">{lvl}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="auto" {...register('questions.selection')} /> Auto
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="manual" {...register('questions.selection')} /> Manual
            </label>
          </div>
          {questionsSelection === 'auto' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Single choice</label>
                <input type="number" {...register('questions.auto.single', { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Multi choice</label>
                <input type="number" {...register('questions.auto.multi', { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Written</label>
                <input type="number" {...register('questions.auto.written', { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="md:col-span-3">
                <div className="text-sm font-medium text-gray-700 mb-2">By level</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(selectedLevels || []).map((lvl) => (
                    <div key={lvl}>
                      <label className="block text-xs text-gray-600">{lvl}</label>
                      <input type="number" {...register(`questions.auto.byLevel.${lvl}` as any, { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={fetchQuestions} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={isLoadingQuestions}>
                  {isLoadingQuestions ? 'Loading…' : 'Load questions'}
                </button>
                <span className="text-xs text-gray-500">Loads questions for selected topics</span>
              </div>
              {questionsError && (
                <div className="text-sm text-red-600">{questionsError}</div>
              )}
              <div className="max-h-64 overflow-auto border rounded-md divide-y">
                {questionPool.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No questions loaded</div>) : (
                  questionPool.map(q => {
                    const checked = selectedQuestionIds.includes(q.id);
                    return (
                      <label key={q.id} className="flex items-center gap-2 p-2 text-sm">
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          const next = new Set(selectedQuestionIds);
                          if (e.target.checked) next.add(q.id); else next.delete(q.id);
                          setSelectedQuestionIds(Array.from(next));
                        }} />
                        <span className="text-gray-800 truncate">{q.text}</span>
                        <span className="ml-auto text-xs text-gray-500">{q.level}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="auto" {...register('challenges.selection')} /> Auto
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" value="manual" {...register('challenges.selection')} /> Manual
            </label>
          </div>
          {challengesSelection === 'auto' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total challenges</label>
                <input type="number" {...register('challenges.auto.total', { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-gray-700 mb-2">By level</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(selectedLevels || []).map((lvl) => (
                    <div key={lvl}>
                      <label className="block text-xs text-gray-600">{lvl}</label>
                      <input type="number" {...register(`challenges.auto.byLevel.${lvl}` as any, { valueAsNumber: true })} className="mt-1 w-full px-3 py-2 border rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Languages (comma-separated)</label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  placeholder="js, csharp, python"
                  onBlur={(e) => {
                    const langs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setValue('challenges.auto.languages', langs as any);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={fetchChallenges} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50">Load challenges</button>
                <span className="text-xs text-gray-500">Loads challenges for selected topics</span>
              </div>
              <div className="max-h-64 overflow-auto border rounded-md divide-y">
                {challengePool.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No challenges loaded</div>) : (
                  challengePool.map(c => {
                    const checked = selectedChallengeIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 p-2 text-sm">
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          const next = new Set(selectedChallengeIds);
                          if (e.target.checked) next.add(c.id); else next.delete(c.id);
                          setSelectedChallengeIds(Array.from(next));
                        }} />
                        <span className="text-gray-800 truncate">{c.title}</span>
                        <span className="ml-auto text-xs text-gray-500">{c.language}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">{submitLabel}</button>
      </div>
    </form>
  );
};

export default SessionTemplateForm;
