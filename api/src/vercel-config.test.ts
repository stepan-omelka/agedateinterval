import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { datingRange } from '../../shared/dating-range.js';
import { storyImagePath } from './prerender/prerenderer.js';

type Header = { key: string; value: string };
type VercelConfig = {
  rewrites: { source: string; destination: string }[];
  headers: { source: string; headers: Header[] }[];
};

async function vercelConfig() {
  const json = await readFile(new URL('../vercel.json', import.meta.url), 'utf8');
  return JSON.parse(json) as VercelConfig;
}

/** The headers vercel.json sets on `source`, as an object. */
async function headersOn(source: string) {
  const { headers } = await vercelConfig();
  const rule = headers.find(candidate => candidate.source === source);
  return Object.fromEntries((rule?.headers ?? []).map(({ key, value }) => [key, value]));
}

/** The rule in vercel.json that hands a story URL to the file the build drew. */
async function storyRewrite() {
  const [rewrite] = (await vercelConfig()).rewrites;
  const pattern = /^\/api\/story\/:age\((?<ages>.+)\)$/.exec(rewrite?.source ?? '');
  return {
    ages: new RegExp(`^(?:${pattern?.groups?.ages})$`),
    destination: rewrite?.destination ?? '',
  };
}

describe('the story rewrite in vercel.json', () => {
  it('matches exactly the ages that have a range, in their canonical spelling', async () => {
    const { ages } = await storyRewrite();
    const numbers = Array.from({ length: 1001 }, (_, number) => number);

    expect(numbers.filter(number => ages.test(String(number)))).toEqual(
      numbers.filter(number => datingRange(number) !== undefined),
    );
    expect(['025', '25.0', '25.5', '-25', ''].filter(age => ages.test(age))).toEqual([]);
  });

  it('points at the file the build draws for that age', async () => {
    const { destination } = await storyRewrite();

    expect(destination.replace(':age', '30')).toBe(`/${storyImagePath(30)}`);
  });
});

describe('the rewrites in vercel.json', () => {
  it('try the story files first, then send every /api path to the function', async () => {
    const { rewrites } = await vercelConfig();

    expect(rewrites).toHaveLength(2);
    expect(rewrites[0]?.source).toMatch(/^\/api\/story\//);
    expect(rewrites[1]).toEqual({ source: '/api/(.*)', destination: '/api' });
  });
});

describe('the headers in vercel.json', () => {
  it('send the security headers with every response', async () => {
    expect(await headersOn('/(.*)')).toEqual({
      'Content-Security-Policy':
        "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    });
  });

  it('cache for a year the bundle names that copy-web.mjs checks Angular still uses', async () => {
    const script = await readFile(new URL('../scripts/copy-web.mjs', import.meta.url), 'utf8');
    const checked = /const HASHED_BUNDLE = \/\^(?<names>.+)\$\/;/.exec(script)?.groups?.names;

    expect(checked).toBeDefined();
    expect(await headersOn(`/:file(${checked})`)).toEqual({
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  });
});
