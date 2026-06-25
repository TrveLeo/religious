import { describe, it, expect } from 'vitest';
import { buildHashtags } from '../../scripts/lib/hashtags.js';

describe('buildHashtags', () => {
  it('retorna string com várias tags, todas com #', () => {
    const out = buildHashtags('devotional', 100);
    const tags = out.split(' ');
    expect(tags.length).toBeGreaterThanOrEqual(15);
    expect(tags.every(t => t.startsWith('#'))).toBe(true);
  });

  it('inclui as tags de identidade sempre', () => {
    const out = buildHashtags('quote', 0);
    expect(out).toContain('#devocional');
    expect(out).toContain('#biblia');
    expect(out).toContain('#fe');
  });

  it('inclui tags específicas da categoria', () => {
    expect(buildHashtags('quote', 0)).toContain('#citacaobiblica');
    expect(buildHashtags('game', 0)).toContain('#jogosbiblicos');
    expect(buildHashtags('trivia', 0)).toContain('#triviabiblica');
    expect(buildHashtags('reel', 0)).toContain('#reels');
  });

  it('não tem tags duplicadas', () => {
    const tags = buildHashtags('devotional', 50).split(' ');
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('rotaciona: dias diferentes geram conjuntos diferentes', () => {
    expect(buildHashtags('quote', 0)).not.toBe(buildHashtags('quote', 3));
  });

  it('categoria desconhecida ainda retorna tags base', () => {
    const out = buildHashtags('inexistente', 10);
    expect(out).toContain('#biblia');
  });
});
