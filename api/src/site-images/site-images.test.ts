import { describe, expect, it } from 'vitest';
import { ImageRenderer } from '../image/image-renderer.js';
import { pngSize } from '../image/png.js';
import { APPLE_TOUCH_ICON_SIZE, appleTouchIcon } from './apple-touch-icon.js';
import { OG_IMAGE_SIZE, ogImage } from './og-image.js';

describe('the site images', () => {
  const renderer = new ImageRenderer();

  it('draws og-image.png as a 1200×630 PNG, the size link previews expect', async () => {
    const png = await renderer.render(ogImage(), OG_IMAGE_SIZE);

    expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
  });

  it('draws apple-touch-icon.png as a 180×180 PNG, the size iOS asks for', async () => {
    const png = await renderer.render(appleTouchIcon(), APPLE_TOUCH_ICON_SIZE);

    expect(pngSize(png)).toEqual({ width: 180, height: 180 });
  });
});
