import { crc32, deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

type Chunk = { readonly type: string; readonly data: Buffer };

/** A PNG is its signature and then chunks: a length, a four-letter type, the data and a CRC. */
function readChunks(png: Buffer, offset = SIGNATURE.length): Chunk[] {
  if (offset >= png.length) {
    return [];
  }
  const end = offset + 8 + png.readUInt32BE(offset);
  const chunk = {
    type: png.toString('latin1', offset + 4, offset + 8),
    data: png.subarray(offset + 8, end),
  };
  return [chunk, ...readChunks(png, end + 4)];
}

function writeChunk({ type, data }: Chunk): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

/**
 * The same picture in fewer bytes. resvg compresses its PNGs lightly to be quick; deflating the
 * pixel data (the IDAT chunks) again with zlib's default level takes about 40% off a story image.
 */
export function recompressPng(png: Buffer): Buffer {
  const chunks = readChunks(png);
  const isPixels = ({ type }: Chunk) => type === 'IDAT';
  const pixels = inflateSync(Buffer.concat(chunks.filter(isPixels).map(({ data }) => data)));
  return Buffer.concat([
    SIGNATURE,
    // IHDR is the first chunk and IEND the last; the pixel data goes anywhere in between.
    ...chunks.filter(chunk => !isPixels(chunk) && chunk.type !== 'IEND').map(writeChunk),
    writeChunk({ type: 'IDAT', data: deflateSync(pixels) }),
    writeChunk({ type: 'IEND', data: Buffer.alloc(0) }),
  ]);
}

/** The width and height of a PNG, which its first chunk (IHDR) starts with. */
export function pngSize(png: Buffer): { width: number; height: number } {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}
