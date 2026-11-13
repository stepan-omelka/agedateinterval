import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageRenderer } from '../image/image-renderer.js';
import { APPLE_TOUCH_ICON_SIZE, appleTouchIcon } from '../site-images/apple-touch-icon.js';
import { OG_IMAGE_SIZE, ogImage } from '../site-images/og-image.js';
import { STORIES, StoryService } from '../story/story.service.js';

/** The file of a story image in the web root. vercel.json rewrites `/api/story/<age>` to it. */
export const storyImagePath = (age: number) => `api/story/${age}.png`;

/** Draws every image the site serves, once, as files for the CDN. */
@Injectable()
export class Prerenderer {
  constructor(
    private readonly stories: StoryService,
    private readonly renderer: ImageRenderer,
  ) {}

  /** Writes the images into `webRoot` and returns their paths in it. */
  async writeImages(webRoot: string): Promise<string[]> {
    const images = [
      { path: 'og-image.png', png: this.renderer.render(ogImage(), OG_IMAGE_SIZE) },
      {
        path: 'apple-touch-icon.png',
        png: this.renderer.render(appleTouchIcon(), APPLE_TOUCH_ICON_SIZE),
      },
      ...STORIES.map(({ age, range }) => ({
        path: storyImagePath(age),
        png: this.stories.render(range),
      })),
    ];
    await mkdir(join(webRoot, 'api/story'), { recursive: true });
    await Promise.all(
      images.map(async ({ path, png }) => writeFile(join(webRoot, path), await png)),
    );
    return images.map(({ path }) => path);
  }
}
