import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker, { normalize, pickReply, hashString, handleWebhookEvent, TRIGGER_WORDS, REPLIES } from '../../webhook/src/index.js';

describe('webhook - funções puras', () => {
  it('normalize: minúsculo e sem acento', () => {
    expect(normalize('AMÉM')).toBe('amem');
    expect(normalize('Améns!')).toContain('amens');
  });

  it('TRIGGER_WORDS casam com variações de "amém"', () => {
    for (const t of ['amém', 'amem', 'amen']) {
      const n = normalize(t);
      expect(TRIGGER_WORDS.some(w => n.includes(w))).toBe(true);
    }
  });

  it('hashString é determinístico', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
  });

  it('pickReply retorna sempre uma das respostas fixas', () => {
    for (let s = -5; s < 5; s++) {
      expect(REPLIES).toContain(pickReply(s));
    }
  });
});

describe('webhook - fetch handler', () => {
  let fetchSpy;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, text: async () => '' });
  });
  afterEach(() => fetchSpy.mockRestore());

  const ctx = { waitUntil: (p) => p };

  it('GET com verify_token correto devolve o challenge', async () => {
    const req = new Request('https://w/?hub.mode=subscribe&hub.verify_token=tok&hub.challenge=42');
    const res = await worker.fetch(req, { VERIFY_TOKEN: 'tok' }, ctx);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('42');
  });

  it('GET com token errado devolve 403', async () => {
    const req = new Request('https://w/?hub.mode=subscribe&hub.verify_token=ruim');
    const res = await worker.fetch(req, { VERIFY_TOKEN: 'tok' }, ctx);
    expect(res.status).toBe(403);
  });

  it('POST com payload inválido devolve 400', async () => {
    const req = new Request('https://w/', { method: 'POST', body: 'nao-json' });
    const res = await worker.fetch(req, {}, ctx);
    expect(res.status).toBe(400);
  });

  it('método não suportado devolve 405', async () => {
    const res = await worker.fetch(new Request('https://w/', { method: 'DELETE' }), {}, ctx);
    expect(res.status).toBe(405);
  });

  it('comentário "amém" dispara resposta via Graph API', async () => {
    const payload = { entry: [{ changes: [{ field: 'comments', value: { id: 'c1', text: 'Amém! 🙏' } }] }] };
    await handleWebhookEvent(payload, { IG_ACCESS_TOKEN: 'tok' }, ctx);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy.mock.calls[0][0]).toContain('/c1/replies');
  });

  it('comentário sem gatilho não responde', async () => {
    const payload = { entry: [{ changes: [{ field: 'comments', value: { id: 'c2', text: 'oi tudo bem' } }] }] };
    await handleWebhookEvent(payload, { IG_ACCESS_TOKEN: 'tok' }, ctx);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
