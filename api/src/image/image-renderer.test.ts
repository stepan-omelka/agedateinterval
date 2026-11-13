import { describe, expect, it } from 'vitest';
import { h } from './image-node.js';
import { ImageRenderer } from './image-renderer.js';
import { pngSize } from './png.js';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('ImageRenderer', () => {
  const renderer = new ImageRenderer();

  it('draws a tree with text as a PNG of the size asked for', async () => {
    const card = h(
      'div',
      { style: { display: 'flex', fontFamily: 'Inter', fontWeight: 700, fontSize: 48 } },
      'Agedate',
    );

    const png = await renderer.render(card, { width: 320, height: 200 });

    expect(png.subarray(0, 8)).toEqual(PNG_SIGNATURE);
    expect(pngSize(png)).toEqual({ width: 320, height: 200 });
  });

  it('draws different trees as different pictures', async () => {
    const size = { width: 64, height: 64 };
    const box = (background: string) => h('div', { style: { width: 64, height: 64, background } });

    const [pink, violet] = await Promise.all([
      renderer.render(box('#ec4899'), size),
      renderer.render(box('#8b5cf6'), size),
    ]);

    expect(pink.equals(violet)).toBe(false);
  });
});
