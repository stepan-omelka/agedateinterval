import { describe, expect, it } from 'vitest';
import { GET } from './route';

function getStory(age: string, host = 'localhost') {
  return GET(new Request(`http://${host}/api/story/${age}`), {
    params: Promise.resolve({ age }),
  });
}

describe('GET /api/story/:age', () => {
  it('renders a 1080×1920 PNG', async () => {
    const response = await getStory('25');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=31536000');
    // A PNG's IHDR chunk stores the width and height at bytes 16 and 20.
    const png = new DataView(await response.arrayBuffer());
    expect([png.getUint32(16), png.getUint32(20)]).toEqual([1080, 1920]);
  });

  it.each(['13', '121', '0', '025', '25.5', 'abc'])(
    'rejects %s with Problem Details',
    async age => {
      const response = await getStory(age);

      expect(response.status).toBe(400);
      expect(response.headers.get('content-type')).toBe('application/problem+json');
      expect(await response.json()).toEqual({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'The age must be a whole number from 14 to 120.',
      });
    },
  );
});
