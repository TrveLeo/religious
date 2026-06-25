import { describe, it, expect } from 'vitest';
import DEVOTIONALS from '../../docs/content.js';
import TERMO_WORDS from '../../docs/termo-words.js';
import CONEXO_SETS from '../../docs/conexo-words.js';
import TRIVIA_QUESTIONS from '../../docs/trivia-questions.js';

describe('integridade dos dados de conteúdo', () => {
  it('devocionais têm verse, ref, title e text não vazios', () => {
    expect(DEVOTIONALS.length).toBeGreaterThan(0);
    for (const d of DEVOTIONALS) {
      for (const k of ['verse', 'ref', 'title', 'text']) {
        expect(typeof d[k]).toBe('string');
        expect(d[k].length).toBeGreaterThan(0);
      }
    }
  });

  it('palavras do Termo têm exatamente 5 letras e são maiúsculas', () => {
    expect(TERMO_WORDS.length).toBeGreaterThan(0);
    for (const w of TERMO_WORDS) {
      expect(w).toHaveLength(5);
      expect(w).toBe(w.toUpperCase());
    }
  });

  it('cada set de Conexões tem 4 categorias de 4 palavras', () => {
    expect(CONEXO_SETS.length).toBeGreaterThan(0);
    for (const set of CONEXO_SETS) {
      expect(set.categories).toHaveLength(4);
      for (const cat of set.categories) {
        expect(cat.name.length).toBeGreaterThan(0);
        expect(cat.words).toHaveLength(4);
        expect(typeof cat.color).toBe('string');
      }
    }
  });

  it('Conexões: nenhuma palavra repetida dentro do mesmo set', () => {
    for (const set of CONEXO_SETS) {
      const all = set.categories.flatMap(c => c.words);
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it('trivia: correctIndex aponta pra uma opção válida', () => {
    expect(TRIVIA_QUESTIONS.length).toBeGreaterThan(0);
    for (const q of TRIVIA_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.question.length).toBeGreaterThan(0);
    }
  });
});
