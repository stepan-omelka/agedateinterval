import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { datingRange } from '../../shared/dating-range.js';
import { storyImagePath } from './prerender/prerenderer.js';

type VercelConfig = { rewrites: { source: string; destination: string }[] };

/** The rule in vercel.json that hands a story URL to the file the build drew. */
async function storyRewrite() {
  const config = JSON.parse(
    await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
  ) as VercelConfig;
  const [rewrite] = config.rewrites;
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
