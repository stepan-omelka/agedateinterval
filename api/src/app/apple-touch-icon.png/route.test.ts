import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /apple-touch-icon.png', () => {
  it('renders a 180×180 PNG, the size iOS asks for', async () => {
    const response = GET();

    expect(response.headers.get('content-type')).toBe('image/png');
    // A PNG's IHDR chunk stores the width and height at bytes 16 and 20.
    const png = new DataView(await response.arrayBuffer());
    expect([png.getUint32(16), png.getUint32(20)]).toEqual([180, 180]);
  });
});
