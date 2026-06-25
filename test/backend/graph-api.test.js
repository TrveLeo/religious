import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { graphRequest, sleep, waitUntilReady } from '../../scripts/lib/graph-api.js';

// Resposta controlável por teste.
let nextResponse = { statusCode: 200, body: '{}' };

function mockRequest(url, options, cb) {
  const res = new EventEmitter();
  res.statusCode = nextResponse.statusCode;
  cb(res);
  const req = new EventEmitter();
  req.write = () => {};
  req.end = () => {
    setImmediate(() => {
      res.emit('data', nextResponse.body);
      res.emit('end');
    });
  };
  return req;
}

describe('graph-api', () => {
  let spy;
  beforeEach(() => {
    nextResponse = { statusCode: 200, body: '{}' };
    spy = vi.spyOn(https, 'request').mockImplementation(mockRequest);
  });
  afterEach(() => spy.mockRestore());

  it('graphRequest resolve com JSON em sucesso', async () => {
    nextResponse = { statusCode: 200, body: '{"id":"123"}' };
    await expect(graphRequest('GET', 'me', { access_token: 'x' })).resolves.toEqual({ id: '123' });
  });

  it('graphRequest rejeita em status >= 400', async () => {
    nextResponse = { statusCode: 400, body: '{"error":"nope"}' };
    await expect(graphRequest('POST', 'media', { a: 'b' })).rejects.toThrow(/Graph API error/);
  });

  it('sleep resolve após o tempo', async () => {
    const t0 = Date.now();
    await sleep(10);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(8);
  });

  it('waitUntilReady retorna quando status FINISHED', async () => {
    nextResponse = { statusCode: 200, body: '{"status_code":"FINISHED"}' };
    await expect(waitUntilReady('m1', 'tok', 3, 1)).resolves.toBeUndefined();
  });

  it('waitUntilReady lança em status ERROR', async () => {
    nextResponse = { statusCode: 200, body: '{"status_code":"ERROR"}' };
    await expect(waitUntilReady('m1', 'tok', 3, 1)).rejects.toThrow(/falhou/);
  });
});
