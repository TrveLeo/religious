import { describe, it, expect } from 'vitest';
import { SIZE, PALETTE, baseBackground, drawHeader, drawFooter, drawEngagementBadge, stripEmoji, wrapText } from '../../scripts/lib/card-canvas.js';

// ctx falso que registra as chamadas, evitando depender do canvas nativo.
function fakeCtx() {
  const calls = [];
  const rec = name => (...args) => calls.push([name, ...args]);
  return {
    calls,
    fillStyle: '', strokeStyle: '', lineWidth: 0, font: '', textAlign: '',
    createLinearGradient: () => ({ addColorStop: rec('addColorStop') }),
    fillRect: rec('fillRect'),
    strokeRect: rec('strokeRect'),
    fillText: rec('fillText'),
    measureText: (t) => ({ width: t.length * 10 })
  };
}

describe('card-canvas', () => {
  it('SIZE é 1080 e PALETTE tem cores', () => {
    expect(SIZE).toBe(1080);
    expect(PALETTE.border).toMatch(/^#/);
  });

  it('baseBackground pinta fundo e bordas', () => {
    const ctx = fakeCtx();
    baseBackground(ctx);
    expect(ctx.calls.some(c => c[0] === 'fillRect')).toBe(true);
    expect(ctx.calls.filter(c => c[0] === 'strokeRect').length).toBeGreaterThanOrEqual(2);
  });

  it('drawHeader escreve título e subtítulo', () => {
    const ctx = fakeCtx();
    drawHeader(ctx, 'Título', 'Sub');
    const texts = ctx.calls.filter(c => c[0] === 'fillText').map(c => c[1]);
    expect(texts).toContain('Título');
    expect(texts).toContain('Sub');
  });

  it('drawFooter escreve o texto', () => {
    const ctx = fakeCtx();
    drawFooter(ctx, 'rodapé');
    expect(ctx.calls.some(c => c[0] === 'fillText' && c[1] === 'rodapé')).toBe(true);
  });

  it('stripEmoji remove emojis e normaliza espaços', () => {
    expect(stripEmoji('Marca quem precisa ler isso agora 👇')).toBe('Marca quem precisa ler isso agora');
    expect(stripEmoji('Comenta 🙏 se quer oração')).toBe('Comenta se quer oração');
    expect(stripEmoji('sem emoji')).toBe('sem emoji');
  });

  it('drawEngagementBadge escreve as chamadas sem emoji', () => {
    const ctx = fakeCtx();
    drawEngagementBadge(ctx, 'Comenta aqui 👇', 'Salva esse post');
    const texts = ctx.calls.filter(c => c[0] === 'fillText').map(c => c[1]);
    expect(texts).toContain('Comenta aqui');
    expect(texts).toContain('Salva esse post');
  });

  it('wrapText quebra texto longo em múltiplas linhas', () => {
    const ctx = fakeCtx();
    const lines = wrapText(ctx, 'uma frase bem longa que deve quebrar em varias linhas mesmo', 100);
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBeGreaterThan(1);
  });
});
