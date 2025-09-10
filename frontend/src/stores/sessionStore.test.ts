import { describe, it, expect } from 'vitest';
import { useSessionStore } from './sessionStore';

describe('sessionStore', () => {
  it('starts session with parameters', () => {
    useSessionStore.getState().start({ mode: 'study', topicId: 1, level: 'basic' });
    const state = useSessionStore.getState();
    expect(state.topicId).toBe(1);
    expect(state.level).toBe('basic');
    expect(state.index).toBe(0);
  });

  it('stores answers and moves next', () => {
    const { answer, next } = useSessionStore.getState();
    answer(1, { questionId: '1', isCorrect: true });
    next();
    const state = useSessionStore.getState();
    expect(state.answers[1]).toBeTruthy();
    expect(state.index).toBe(1);
  });
});
