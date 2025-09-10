import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PracticeCard } from './PracticeCard';
import type { Question } from '@/types';

const baseQuestion: Question = {
  id: '1',
  topicId: 1,
  level: 'basic',
  type: 'single',
  text: 'Select one',
  options: [
    { id: 'a', text: 'A', isCorrect: true },
    { id: 'b', text: 'B' },
  ],
};

describe('PracticeCard', () => {
  it('renders radio inputs for single choice', () => {
    render(<PracticeCard question={baseQuestion} onSubmit={vi.fn()} />);
    expect(screen.getAllByRole('radio').length).toBe(2);
  });

  it('renders textarea for written questions', () => {
    const q: Question = { ...baseQuestion, type: 'written', options: [], officialAnswer: 'hello' };
    render(<PracticeCard question={q} onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
