import { describe, it, expect } from 'vitest';
import worker, { todayKey, incrementCounter, SITE_URL, PIX_URL } from '../../webhook-redirect/src/index.js';

// KV em memória pro teste.
function fakeKV() {
  const store = new Map();
  return {
    store,
    get: async (k) => (store.has(k) ? store.get(k) : null),
    put: async (k, v) => { store.set(k, v); }
  };
}

const ctx = { waitUntil: (p) => p };

describe('dd-link worker', () => {
  it('PIX_URL aponta para a página de doação dedicada', () => {
    expect(PIX_URL).toContain('doar.html');
    expect(SITE_URL).toContain('trveleo.github.io');
  });

  it('todayKey no formato YYYY-MM-DD', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('incrementCounter cria e incrementa o contador do dia', async () => {
    const kv = fakeKV();
    await incrementCounter(kv, 'pix');
    await incrementCounter(kv, 'pix');
    const key = `clicks:pix:${todayKey()}`;
    expect(kv.store.get(key)).toBe('2');
  });

  it('/bio redireciona pro site e conta clique', async () => {
    const kv = fakeKV();
    const res = await worker.fetch(new Request('https://l/bio'), { CLICKS: kv }, ctx);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(SITE_URL);
    expect(kv.store.get(`clicks:bio:${todayKey()}`)).toBe('1');
  });

  it('/pix redireciona pra página de doação', async () => {
    const kv = fakeKV();
    const res = await worker.fetch(new Request('https://l/pix'), { CLICKS: kv }, ctx);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(PIX_URL);
  });

  it('rota desconhecida devolve 404', async () => {
    const res = await worker.fetch(new Request('https://l/nada'), { CLICKS: fakeKV() }, ctx);
    expect(res.status).toBe(404);
  });

  it('método não-GET devolve 405', async () => {
    const res = await worker.fetch(new Request('https://l/pix', { method: 'POST' }), { CLICKS: fakeKV() }, ctx);
    expect(res.status).toBe(405);
  });
});
