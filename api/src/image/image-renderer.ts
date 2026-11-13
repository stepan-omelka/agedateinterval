import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import type { ImageNode } from './image-node.js';
import { recompressPng } from './png.js';

export type ImageSize = { readonly width: number; readonly height: number };

const INTER_WEIGHTS = [500, 700, 900] as const;

/**
 * Satori, resvg and Inter (SIL Open Font License, see fonts/OFL.txt; WOFF, because Satori cannot
 * read WOFF2). Imported on demand, so a request that draws nothing never loads resvg's binary.
 */
async function loadTools() {
  const [{ default: satori }, { renderAsync }, fonts] = await Promise.all([
    import('satori'),
    import('@resvg/resvg-js'),
    Promise.all(
      INTER_WEIGHTS.map(async weight => ({
        name: 'Inter',
        weight,
        data: await readFile(new URL(`./fonts/inter-${weight}.woff`, import.meta.url)),
      })),
    ),
  ]);
  return { satori, renderAsync, fonts };
}

/** Draws an {@link ImageNode} tree as a PNG. Only the Inter weights above exist in the images. */
@Injectable()
export class ImageRenderer {
  /** Loaded once per process, by the first image. */
  private tools?: ReturnType<typeof loadTools>;

  async render(node: ImageNode, size: ImageSize): Promise<Buffer> {
    const { satori, renderAsync, fonts } = await (this.tools ??= loadTools());
    // Satori lays the tree out with flexbox and returns an SVG with the text as paths,
    // so resvg needs no fonts of its own to turn it into pixels, off the main thread.
    const svg = await satori(node, { ...size, fonts });
    const image = await renderAsync(svg, {
      fitTo: { mode: 'width', value: size.width },
      font: { loadSystemFonts: false },
    });
    return recompressPng(image.asPng());
  }
}
