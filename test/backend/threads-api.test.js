import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { graphRequest } from '../../scripts/lib/threads-api.js';

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

describe('threads-api', () => {
  let spy;
  beforeEach(() => {
    nextResponse = { statusCode: 200, body: '{}' };
    spy = vi.spyOn(https, 'request').mockImplementation(mockRequest);
  });
  afterEach(() => spy.mockRestore());

  it('graphRequest resolve com JSON em sucesso', async () => {
    nextResponse = { statusCode: 200, body: '{"id":"abc"}' };
    await expect(graphRequest('POST', 'threads', { text: 'oi' })).resolves.toEqual({ id: 'abc' });
  });

  it('graphRequest rejeita em erro', async () => {
    nextResponse = { statusCode: 500, body: '{"error":"x"}' };
    await expect(graphRequest('GET', 'me', {})).rejects.toThrow(/Threads API error/);
  });
});
