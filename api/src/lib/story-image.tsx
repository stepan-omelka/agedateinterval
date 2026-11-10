import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DatingRange } from '@shared/dating-range';

/** Instagram and Facebook stories are 9:16. */
export const STORY_SIZE = { width: 1080, height: 1920 } as const;

const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));

/** Inter (SIL Open Font License, see assets/fonts/OFL.txt), loaded once per server instance. */
export const storyFonts = Promise.all([
  font('inter-500.woff').then(data => ({ name: 'Inter', data, weight: 500 as const })),
  font('inter-700.woff').then(data => ({ name: 'Inter', data, weight: 700 as const })),
  font('inter-900.woff').then(data => ({ name: 'Inter', data, weight: 900 as const })),
]);

const colors = {
  accent: '#db2777',
  ink: '#1e293b',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#e2e8f0',
};

type StoryImageProps = {
  range: DatingRange;
  /** Shown under the card so people can find the app; `undefined` hides it. */
  host: string | undefined;
};

/**
 * The story image, rendered to PNG by `ImageResponse` (Satori). Satori supports a subset
 * of CSS: every element with more than one child needs `display: flex`.
 */
export function StoryImage({ range, host }: StoryImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(160deg, #ec4899 0%, #8b5cf6 100%)',
        fontFamily: 'Inter',
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -2, color: 'white' }}>
        Agedate
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 920,
          marginTop: 64,
          padding: '96px 48px',
          borderRadius: 72,
          background: 'white',
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 6, color: colors.accent }}>
          MY DATING RANGE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 72 }}>
          <Bound label="MIN" value={range.min} />
          <div
            style={{
              width: 6,
              height: 200,
              margin: '0 56px',
              borderRadius: 3,
              background: colors.line,
            }}
          />
          <Bound label="MAX" value={range.max} />
        </div>
        <div style={{ marginTop: 72, fontSize: 34, fontWeight: 500, color: colors.muted }}>
          Half your age plus seven
        </div>
      </div>
      {host && (
        <div
          style={{
            marginTop: 72,
            fontSize: 36,
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {host}
        </div>
      )}
    </div>
  );
}

function Bound({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          fontSize: 180,
          fontWeight: 900,
          letterSpacing: -6,
          lineHeight: 1,
          color: colors.ink,
        }}
      >
        {String(value)}
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          color: colors.faint,
        }}
      >
        {label}
      </div>
    </div>
  );
}
