import { describe, expect, it } from 'vitest';
import { storyImage } from './story-image.js';

const range = { min: 22, max: 46 };

describe('storyImage', () => {
  it('shows both ends of the range', () => {
    const image = JSON.stringify(storyImage({ range, host: undefined }));

    expect(image).toContain('"22"');
    expect(image).toContain('"46"');
  });

  it('puts the host name under the card', () => {
    const { children } = storyImage({ range, host: 'agedate.vercel.app' }).props;

    expect(children).toHaveLength(3);
    expect(JSON.stringify(children)).toContain('agedate.vercel.app');
  });

  it.each([undefined, ''])('has only the title and the card when the host is %j', host => {
    const { children } = storyImage({ range, host }).props;

    expect(children).toHaveLength(2);
  });
});
