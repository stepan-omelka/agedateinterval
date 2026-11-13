import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../app.module.js';
import { pngSize } from '../image/png.js';

describe('GET /api/story/:age', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => vi.unstubAllEnvs());

  afterAll(() => app.close());

  function getStory(age: string) {
    return request(app.getHttpServer()).get(`/api/story/${age}`);
  }

  it('renders a 1080×1920 PNG that browsers check again on each use', async () => {
    const response = await getStory('25');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(response.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
    expect(pngSize(response.body as Buffer)).toEqual({ width: 1080, height: 1920 });
  });

  it.each(['14', '120'])('renders the edge age %s', async age => {
    const response = await getStory(age);

    expect(response.status).toBe(200);
    expect(pngSize(response.body as Buffer)).toEqual({ width: 1080, height: 1920 });
  });

  it('puts the production host name under the card on Vercel', async () => {
    const withoutHost = (await getStory('25')).body as Buffer;
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'agedate.vercel.app');

    const response = await getStory('25');

    expect(response.status).toBe(200);
    expect((response.body as Buffer).equals(withoutHost)).toBe(false);
  });

  it.each(['13', '121', '0', '025', '25.5', 'abc'])(
    'rejects %s with Problem Details',
    async age => {
      const response = await getStory(age);

      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toBe('application/problem+json');
      expect(JSON.parse(response.text)).toEqual({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'The age must be a whole number from 14 to 120.',
      });
    },
  );
});
