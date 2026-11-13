import { Controller, Get, type INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ProblemDetailsFilter } from './problem-details.filter.js';

@Controller()
class BrokenController {
  @Get('broken')
  fail(): never {
    throw new Error('the database password is hunter2');
  }
}

describe('ProblemDetailsFilter', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BrokenController],
      providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('answers an unknown path with a 404 in the Problem Details format', async () => {
    const response = await request(app.getHttpServer()).get('/nowhere');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toBe('application/problem+json');
    expect(JSON.parse(response.text)).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'Cannot GET /nowhere',
    });
  });

  it('logs an unexpected error and answers 500 without its message', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await request(app.getHttpServer()).get('/broken');

    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toBe('application/problem+json');
    expect(JSON.parse(response.text)).toEqual({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
    });
    expect(logged).toHaveBeenCalledWith(new Error('the database password is hunter2'));
  });
});
