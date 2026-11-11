import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));

/**
 * Inter (SIL Open Font License, see assets/fonts/OFL.txt) for `ImageResponse`, loaded once per
 * process. Only these weights exist in the images.
 */
export const interFonts = Promise.all([
  font('inter-500.woff').then(data => ({ name: 'Inter', data, weight: 500 as const })),
  font('inter-700.woff').then(data => ({ name: 'Inter', data, weight: 700 as const })),
  font('inter-900.woff').then(data => ({ name: 'Inter', data, weight: 900 as const })),
]);

/** The pink-to-violet background of every image, as in web/public/favicon.svg. */
export const BRAND_GRADIENT = 'linear-gradient(160deg, #ec4899 0%, #8b5cf6 100%)';

/** The heart from the web app's age field and favicon. */
export function Heart({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656z"
      />
    </svg>
  );
}
