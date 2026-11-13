import { describe, expect, it } from 'vitest';
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import { pngSize, recompressPng } from './png.js';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function chunk(type: string, data: Buffer) {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

/** An 8-bit grayscale PNG, 64×32 and all black, with its pixel data stored uncompressed. */
function uncompressedPng() {
  const header = Buffer.from([0, 0, 0, 64, 0, 0, 0, 32, 8, 0, 0, 0, 0]);
  const rows = Buffer.alloc(32 * (1 + 64));
  const stored = deflateSync(rows, { level: 0 });
  return {
    rows,
    png: Buffer.concat([
      SIGNATURE,
      chunk('IHDR', header),
      // Split in two, as encoders may do.
      chunk('IDAT', stored.subarray(0, 100)),
      chunk('IDAT', stored.subarray(100)),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  };
}

describe('recompressPng', () => {
  it('makes the file smaller and keeps every pixel', () => {
    const { png, rows } = uncompressedPng();

    const smaller = recompressPng(png);

    expect(smaller.length).toBeLessThan(png.length);
    expect(smaller.subarray(0, 8)).toEqual(SIGNATURE);
    expect(pngSize(smaller)).toEqual({ width: 64, height: 32 });
    // What is left after the signature and IHDR (8 + 25 bytes): one IDAT chunk, then IEND.
    const pixels = smaller.subarray(33 + 8, smaller.length - 12 - 4);
    expect(smaller.toString('latin1', 33 + 4, 33 + 8)).toBe('IDAT');
    expect(inflateSync(pixels)).toEqual(rows);
    expect(smaller.subarray(-12)).toEqual(chunk('IEND', Buffer.alloc(0)));
  });
});

describe('pngSize', () => {
  it('reads the width and height from the header', () => {
    expect(pngSize(uncompressedPng().png)).toEqual({ width: 64, height: 32 });
  });
});
