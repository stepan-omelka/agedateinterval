import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ImageNode } from '../image/image-node.js';
import { ImageRenderer, type ImageSize } from '../image/image-renderer.js';
import { PrerenderModule } from './prerender.module.js';
import { Prerenderer } from './prerenderer.js';

/** Stands in for the real renderer, which takes half a second per story image. */
const sizeRenderer = {
  render: (_node: ImageNode, { width, height }: ImageSize) =>
    Promise.resolve(Buffer.from(`${width}×${height}`)),
};

describe('Prerenderer', () => {
  let webRoot: string;
  let prerenderer: Prerenderer;

  beforeEach(async () => {
    webRoot = await mkdtemp(join(tmpdir(), 'agedate-prerender-'));
    const module = await Test.createTestingModule({ imports: [PrerenderModule] })
      .overrideProvider(ImageRenderer)
      .useValue(sizeRenderer)
      .compile();
    prerenderer = module.get(Prerenderer);
  });

  afterEach(() => rm(webRoot, { recursive: true }));

  it('writes a story image for every age that has a range', async () => {
    await prerenderer.writeImages(webRoot);

    const stories = await readdir(join(webRoot, 'api/story'));
    expect(stories).toHaveLength(107);
    expect(stories).toContain('14.png');
    expect(stories).toContain('120.png');
    expect(await readFile(join(webRoot, 'api/story/30.png'), 'utf8')).toBe('1080×1920');
  });

  it('writes the link preview image and the home-screen icon into the web root', async () => {
    await prerenderer.writeImages(webRoot);

    expect(await readFile(join(webRoot, 'og-image.png'), 'utf8')).toBe('1200×630');
    expect(await readFile(join(webRoot, 'apple-touch-icon.png'), 'utf8')).toBe('180×180');
  });

  it('returns the path of every image it wrote', async () => {
    const paths = await prerenderer.writeImages(webRoot);

    expect(paths).toHaveLength(109);
    expect(paths).toContain('api/story/30.png');
    expect(paths).toContain('og-image.png');
  });
});
