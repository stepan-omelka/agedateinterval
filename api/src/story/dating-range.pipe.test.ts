import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { DatingRangePipe } from './dating-range.pipe.js';

describe('DatingRangePipe', () => {
  const pipe = new DatingRangePipe();

  it('turns an age into its dating range', () => {
    expect(pipe.transform('30')).toEqual({ min: 22, max: 46 });
  });

  it.each(['14', '120'])('accepts the edge age %s', age => {
    expect(pipe.transform(age)).toBeDefined();
  });

  it.each(['13', '121', '0', '-30', '025', '25.0', '25.5', ' 25', '1e2', 'abc', ''])(
    'rejects "%s" as a bad request',
    age => {
      expect(() => pipe.transform(age)).toThrow(
        new BadRequestException('The age must be a whole number from 14 to 120.'),
      );
    },
  );
});
