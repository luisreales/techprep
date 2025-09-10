import { create } from 'zustand';
import type { QuestionAnswer } from '@/types';

interface SessionState {
  mode: 'study' | 'interview';
  topicId: number | null;
  level: 'basic' | 'medium' | 'hard' | null;
  index: number;
  answers: Record<number, QuestionAnswer>;
  startTime: number | null;
}

interface SessionActions {
  start: (payload: { mode: 'study' | 'interview'; topicId: number; level: 'basic' | 'medium' | 'hard' }) => void;
  answer: (questionId: number, answer: QuestionAnswer) => void;
  next: () => void;
  reset: () => void;
}

const initialState: SessionState = {
  mode: 'study',
  topicId: null,
  level: null,
  index: 0,
  answers: {},
  startTime: null,
};

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  ...initialState,
  start: ({ mode, topicId, level }) =>
    set({ mode, topicId, level, index: 0, answers: {}, startTime: Date.now() }),
  answer: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  next: () => set((state) => ({ index: state.index + 1 })),
  reset: () => set(initialState),
}));
