import { describe, it, expect } from 'vitest';
import { HOOKS, CTAS, COMMENT_BAIT, SAVE_BAIT, pickByDay } from '../../scripts/lib/engagement.js';

describe('engagement', () => {
  it('HOOKS e CTAS não estão vazios', () => {
    expect(HOOKS.length).toBeGreaterThan(0);
    expect(CTAS.length).toBeGreaterThan(0);
  });

  it('COMMENT_BAIT e SAVE_BAIT não estão vazios', () => {
    expect(COMMENT_BAIT.length).toBeGreaterThan(0);
    expect(SAVE_BAIT.length).toBeGreaterThan(0);
  });

  it('pickByDay é determinístico e circular', () => {
    expect(pickByDay(HOOKS, 0)).toBe(HOOKS[0]);
    expect(pickByDay(HOOKS, HOOKS.length)).toBe(HOOKS[0]);
    expect(pickByDay(HOOKS, HOOKS.length + 2)).toBe(HOOKS[2]);
  });

  it('sempre retorna um item da lista', () => {
    for (let d = 0; d < 30; d++) {
      expect(CTAS).toContain(pickByDay(CTAS, d));
    }
  });
});
