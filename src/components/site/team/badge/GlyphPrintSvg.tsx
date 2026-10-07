import { glyphSquares } from './glyph-print';

// The window is 84 by 72.6 card-width hundredths; one viewBox unit is a thousandth of the card width.
const VIEW_W = 840;

/**
 * The glyph print and initials as one SVG: every lit sub-square is one subpath of a single <path>,
 * so a badge costs no per-glyph DOM nodes (team brief 5.6).
 */
export function GlyphPrintSvg({ seed, initials, height }: { seed: string; initials: string; height: number }) {
  const squares = glyphSquares(seed, 12, VIEW_W, height);
  const r = (n: number) => Math.round(n * 10) / 10;
  const d = squares.map(([x, y, s]) => `M${r(x)} ${r(y)}h${r(s)}v${r(s)}h-${r(s)}z`).join('');
  const gradient = `glyph-${seed}`;
  const fontSize = initials.length > 1 ? Math.min(VIEW_W * 0.7 * 0.62, height * 0.5) : height * 0.55;
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${height}`} preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#619AC3" stopOpacity="0.95" />
          <stop offset="1" stopColor="#619AC3" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gradient})`} />
      {initials && (
        <text
          x={VIEW_W / 2}
          y={height * 0.88}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={800}
          fill="#FFFFFF"
          stroke="#0D0D0D"
          strokeWidth={40}
          strokeLinejoin="round"
          paintOrder="stroke"
          style={{ fontFamily: 'var(--font-archivo)', fontStretch: '125%' }}
        >
          {initials}
        </text>
      )}
    </svg>
  );
}
