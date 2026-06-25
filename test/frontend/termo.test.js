import { describe, it, expect } from 'vitest';
import { dayOfYear, wordOfTheDay, evaluateGuess } from '../../docs/termo.js';

describe('termo - lógica pura', () => {
  it('dayOfYear: 1 de janeiro = 1', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  it('wordOfTheDay: determinístico para a mesma data e lista', () => {
    const words = ['GRACA', 'FILHO', 'REINO'];
    const d = new Date(2026, 0, 1);
    expect(wordOfTheDay(words, d)).toBe(wordOfTheDay(words, d));
    expect(words).toContain(wordOfTheDay(words, d));
  });

  it('evaluateGuess: acerto total = tudo correct', () => {
    expect(evaluateGuess('REINO', 'REINO')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('evaluateGuess: letra na posição errada = present', () => {
    // alvo CASA, palpite SACA -> S(present) A(present) C(present) A(correct)
    const r = evaluateGuess('SACA', 'CASA');
    expect(r[3]).toBe('correct');
    expect(r).toContain('present');
  });

  it('evaluateGuess: letra ausente = absent', () => {
    const r = evaluateGuess('XYZWK', 'REINO');
    expect(r.every(x => x === 'absent')).toBe(true);
  });

  it('evaluateGuess: não conta letra repetida além do disponível', () => {
    // alvo CALMA (1 A em pos 2 e 1 em pos 5), palpite AAAAA
    const r = evaluateGuess('AAAAA', 'CALMA');
    const marcadas = r.filter(x => x !== 'absent').length;
    expect(marcadas).toBe(2);
  });
});
