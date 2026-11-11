import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /og-image.png', () => {
  it('renders a 1200×630 PNG, the size link previews expect', async () => {
    const response = await GET();

    expect(response.headers.get('content-type')).toBe('image/png');
    // A PNG's IHDR chunk stores the width and height at bytes 16 and 20.
    const png = new DataView(await response.arrayBuffer());
    expect([png.getUint32(16), png.getUint32(20)]).toEqual([1200, 630]);
  });
});
