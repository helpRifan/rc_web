import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

// Spec 9.3 item 7. Fonts are self-hosted by next/font, so no Google Fonts origin is needed.
// 'wasm-unsafe-eval' lets the Team badges' physics engine (Rapier) compile its WebAssembly. It
// allows WebAssembly compilation only, not JavaScript eval.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://ik.imagekit.io",
  "font-src 'self'",
  `connect-src 'self' ${supabase} https://upload.imagekit.io`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // ImageKit resizes and picks formats, so photos skip Vercel's image optimiser (and its quota).
  images: { loader: 'custom', loaderFile: './src/lib/imagekit-loader.ts' },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      // "Your certificates" carries its magic-link token in the URL: never send it on as a Referer.
      // Later rules win for the same header, so this overrides the site-wide policy above.
      {
        source: '/certificates/mine',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
      },
    ];
  },
};

export default nextConfig;
