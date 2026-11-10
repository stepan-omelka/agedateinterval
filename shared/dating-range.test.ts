import { describe, expect, it } from 'vitest';
import { datingRange, isAge } from './dating-range';

describe('datingRange', () => {
  it.each([
    [14, 14, 14],
    [15, 14.5, 16],
    [21, 17.5, 28],
    [25, 19.5, 36],
    [26, 20, 38],
    // 27 / 2 + 7 = 20.5: rounded up, because 20 would be below the minimum
    [27, 21, 40],
    [40, 27, 66],
    [63, 39, 112],
    // (70 - 7) * 2 = 126, capped at 120
    [70, 42, 120],
    [120, 67, 120],
  ])('age %i → %d–%d', (age, min, max) => {
    expect(datingRange(age)).toEqual({ min, max });
  });

  it.each([13, 1])('has no range below 14 (age %i)', age => {
    expect(datingRange(age)).toBeUndefined();
  });

  it.each([0, -1, 121, 25.5, Number.NaN])('rejects %d', age => {
    expect(datingRange(age)).toBeUndefined();
  });
});

describe('isAge', () => {
  it('accepts whole numbers from 1 to 120', () => {
    expect([1, 14, 120].every(isAge)).toBe(true);
  });

  it.each([0, 121, 2.5, Number.NaN, '25', null])('rejects %s', value => {
    expect(isAge(value)).toBe(false);
  });
});
