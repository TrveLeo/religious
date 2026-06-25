import { describe, it, expect } from 'vitest';
import { dayOfYear, setOfTheDay, shuffle } from '../../docs/conexo.js';

const sets = [
  { categories: [{ name: 'A', words: ['a1', 'a2'] }] },
  { categories: [{ name: 'B', words: ['b1', 'b2'] }] }
];

describe('conexo - lógica pura', () => {
  it('dayOfYear cresce ao longo do ano', () => {
    expect(dayOfYear(new Date(2026, 2, 1))).toBe(60);
  });

  it('setOfTheDay: determinístico e dentro da lista', () => {
    const d = new Date(2026, 0, 2);
    expect(setOfTheDay(sets, d)).toBe(setOfTheDay(sets, d));
    expect(sets).toContain(setOfTheDay(sets, d));
  });

  it('shuffle preserva todos os elementos', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const out = shuffle(arr);
    expect(out).toHaveLength(arr.length);
    expect([...out].sort()).toEqual([...arr].sort());
  });

  it('shuffle não muta o array original', () => {
    const arr = ['a', 'b', 'c'];
    shuffle(arr);
    expect(arr).toEqual(['a', 'b', 'c']);
  });
});
