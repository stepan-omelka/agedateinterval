import { describe, expect, it } from 'vitest';
import { STORIES } from './story.service.js';

describe('STORIES', () => {
  it('lists every age that has a range, so the build draws them all', () => {
    const ages = STORIES.map(({ age }) => age);

    expect(ages).toHaveLength(107);
    expect(ages.at(0)).toBe(14);
    expect(ages.at(-1)).toBe(120);
  });

  it('pairs each age with its range', () => {
    expect(STORIES.find(({ age }) => age === 30)).toEqual({ age: 30, range: { min: 22, max: 46 } });
  });
});
