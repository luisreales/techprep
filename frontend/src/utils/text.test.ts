import { describe, it, expect } from 'vitest';
import { percentMatch } from './text';

describe('percentMatch', () => {
  it('returns 1 for identical strings', () => {
    expect(percentMatch('Hello', 'Hello')).toBe(1);
  });

  it('normalizes diacritics and case', () => {
    expect(percentMatch('Café', 'cafe')).toBe(1);
  });

  it('returns 0 for completely different strings', () => {
    expect(percentMatch('abc', 'xyz')).toBe(0);
  });
});
