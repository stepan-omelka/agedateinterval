/**
 * The "half your age plus seven" rule. The Angular app (numbers on screen) and the
 * NestJS API (story images) both import this file, so they always agree.
 */

/** Youngest age the rule works for: at 14 the range is 14–14, below that it's empty. */
export const MIN_AGE = 14;

/** Oldest age the app accepts. The oldest partner age is capped here too. */
export const MAX_AGE = 120;

export type DatingRange = {
  /** Youngest partner age the rule allows. Ends in .5 for odd ages up to 25. */
  readonly min: number;
  /** Oldest partner age the rule allows. */
  readonly max: number;
};

/** Whether `value` is an age the app accepts: a whole number from 1 to {@link MAX_AGE}. */
export function isAge(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_AGE;
}

/**
 * The dating range for `age`, or `undefined` if the rule gives no range: the age is below
 * {@link MIN_AGE} or isn't one {@link isAge} accepts.
 */
export function datingRange(age: number): DatingRange | undefined {
  if (!isAge(age) || age < MIN_AGE) {
    return undefined;
  }
  const exactMin = age / 2 + 7;
  return {
    // Half a year matters when you're young (17.5 is not 18), so keep it up to 25.
    // Above that, round up to the youngest whole age the rule still allows.
    min: age <= 25 ? exactMin : Math.ceil(exactMin),
    max: Math.min((age - 7) * 2, MAX_AGE),
  };
}
