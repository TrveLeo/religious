import { describe, it, expect } from 'vitest';
import { drawDonationCard } from '../../scripts/lib/donation-card.js';

describe('donation-card', () => {
  it('desenha um card e retorna canvas exportável em PNG', async () => {
    const canvas = await drawDonationCard();
    const buf = canvas.toBuffer('image/png');
    expect(buf.length).toBeGreaterThan(0);
    // Assinatura de arquivo PNG.
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
  });
});
