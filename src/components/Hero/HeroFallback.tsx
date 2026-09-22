const GEAR_X_POSITIONS = [30, 45, 60];
const NODE_POSITIONS: [number, number][] = [
  [30, 50],
  [45, 40],
  [60, 55],
  [37, 48],
  [52, 47],
];

export function HeroFallback() {
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 90 100"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="hero-vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#141416" />
          <stop offset="100%" stopColor="#0D0D0D" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="90" height="100" fill="url(#hero-vignette)" />

      {GEAR_X_POSITIONS.map((x, i) => (
        <circle
          key={x}
          data-hero-gear
          cx={x}
          cy={50}
          r={8 + (i % 2) * 3}
          fill="none"
          stroke="#BFC7CE"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          style={{
            transformOrigin: `${x}px 50px`,
            animation: `hero-gear-spin ${6 + i * 2}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
          }}
        />
      ))}

      {NODE_POSITIONS.map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          data-hero-node
          cx={x}
          cy={y}
          r="0.8"
          fill="#4A8DB7"
          style={{ animation: `hero-node-pulse 2.4s ease-in-out infinite ${i * 0.3}s` }}
        />
      ))}

      <style>
        {`
          @keyframes hero-gear-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes hero-node-pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </svg>
  );
}
