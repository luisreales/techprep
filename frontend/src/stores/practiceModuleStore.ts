import { create } from 'zustand';
import { PracticeDifficulty, PracticeQuestionType } from '@/types/practice';

interface PracticeModuleStore {
  // Filters
  topicIds: number[];
  difficulties: PracticeDifficulty[];
  questionTypes: PracticeQuestionType[];
  searchTerm: string;

  // Pagination
  page: number;
  limit: number;

  // Selected question
  selectedQuestionId: string | null;

  // Filter actions
  setFilters: (filters: {
    topicIds?: number[];
    difficulties?: PracticeDifficulty[];
    questionTypes?: PracticeQuestionType[];
  }) => void;
  setSearchTerm: (searchTerm: string) => void;
  resetFilters: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Selection actions
  setSelectedQuestionId: (id: string | null) => void;
}

export const usePracticeModuleStore = create<PracticeModuleStore>((set) => ({
  // Initial state
  topicIds: [],
  difficulties: [],
  questionTypes: [],
  searchTerm: '',
  page: 1,
  limit: 12,
  selectedQuestionId: null,

  // Filter actions
  setFilters: (filters) => set((state) => ({
    ...state,
    ...filters,
    page: 1, // Reset to first page when filters change
  })),

  setSearchTerm: (searchTerm) => set((state) => ({
    ...state,
    searchTerm,
    page: 1, // Reset to first page when search changes
  })),

  resetFilters: () => set({
    topicIds: [],
    difficulties: [],
    questionTypes: [],
    searchTerm: '',
    page: 1,
  }),

  // Pagination actions
  setPage: (page) => set((state) => ({ ...state, page })),
  setLimit: (limit) => set((state) => ({ ...state, limit, page: 1 })),

  // Selection actions
  setSelectedQuestionId: (selectedQuestionId) => set((state) => ({
    ...state,
    selectedQuestionId,
  })),
}));