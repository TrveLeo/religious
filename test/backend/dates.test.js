import { describe, it, expect } from 'vitest';
import { dayOfYear, dateKey, capitalize } from '../../scripts/lib/dates.js';

describe('dates', () => {
  it('dayOfYear: 1 de janeiro = 1', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  it('dayOfYear: cresce ao longo do ano', () => {
    expect(dayOfYear(new Date(2026, 1, 1))).toBe(32);
  });

  it('dateKey: formata YYYY-MM-DD em UTC', () => {
    expect(dateKey(new Date('2026-06-24T12:00:00Z'))).toBe('2026-06-24');
  });

  it('capitalize: sobe a primeira letra', () => {
    expect(capitalize('junho')).toBe('Junho');
  });

  it('capitalize: string vazia não quebra', () => {
    expect(capitalize('')).toBe('');
  });
});
