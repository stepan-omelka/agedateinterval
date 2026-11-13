import { Injectable } from '@nestjs/common';
import { type DatingRange, MAX_AGE, datingRange } from '../../../shared/dating-range.js';
import { ImageRenderer } from '../image/image-renderer.js';
import { STORY_SIZE, storyImage } from './story-image.js';

/** Every age that has a range, with it: the story images the build draws, 107 of them. */
export const STORIES: readonly { age: number; range: DatingRange }[] = Array.from(
  { length: MAX_AGE },
  (_, index) => index + 1,
).flatMap(age => {
  const range = datingRange(age);
  return range ? [{ age, range }] : [];
});

@Injectable()
export class StoryService {
  constructor(private readonly renderer: ImageRenderer) {}

  /** The 1080×1920 story image of `range`, as a PNG. */
  render(range: DatingRange): Promise<Buffer> {
    // Not the request's host: the build draws the images, and it has no request. Vercel sets
    // this on every deployment (previews too); locally the footer is left out.
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    return this.renderer.render(storyImage({ range, host }), STORY_SIZE);
  }
}
