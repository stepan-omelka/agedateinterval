import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import handler from '../api/index.js';

describe('the Vercel Function', () => {
  // Vercel calls the default export with Node's request and response, as this server does.
  const server = createServer((req, res) => void handler(req, res));

  it('hands a request to the Nest application', async () => {
    const response = await request(server).get('/api/story/13');

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toBe('application/problem+json');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('answers an unknown API path with a 404 in the Problem Details format', async () => {
    const response = await request(server).get('/api/nowhere');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toBe('application/problem+json');
  });
});
