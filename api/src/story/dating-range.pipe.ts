import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { type DatingRange, MAX_AGE, MIN_AGE, datingRange } from '../../../shared/dating-range.js';

/**
 * Only canonical numbers ("25", not "025" or "25.0"): each age has one URL, the one the build
 * draws an image for.
 */
const AGE_PATTERN = /^[1-9]\d{0,2}$/;

/** Turns the `:age` path parameter into its dating range, or rejects the request with a 400. */
@Injectable()
export class DatingRangePipe implements PipeTransform<string, DatingRange> {
  transform(age: string): DatingRange {
    const range = AGE_PATTERN.test(age) ? datingRange(Number(age)) : undefined;
    if (!range) {
      throw new BadRequestException(
        `The age must be a whole number from ${MIN_AGE} to ${MAX_AGE}.`,
      );
    }
    return range;
  }
}
