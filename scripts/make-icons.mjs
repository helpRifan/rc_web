// Generates the header logo and the app icons from the club logo.
// Run: node scripts/make-icons.mjs (from the repo root)
import sharp from 'sharp';

const SOURCE = 'D:/RC-web/public/logo-nobg.png';
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const BG = '#0D0D0D';

// The source is 1254px square with about 18% empty margin on every side. Trim it so the
// mark fills the frame and stays legible at 34px in the header and 16px in a browser tab.
const mark = await sharp(SOURCE).trim().toBuffer();

/** The trimmed mark centred on a square canvas, with `pad` (a fraction of `size`) on each side. */
async function square(size, pad, background) {
  const inner = Math.round(size * (1 - 2 * pad));
  const art = await sharp(mark).resize(inner, inner, { fit: 'contain', background: CLEAR }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** A rounded-square mask, so the favicon reads on light and dark tab strips alike. */
function roundedMask(size, radius) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#FFFFFF"/></svg>`,
  );
}

// Header logo: transparent, sits on the page's own black.
await sharp(await square(256, 0.02, CLEAR)).toFile('public/logo.png');

// Favicon: the mark on a black rounded square (the white R would vanish on a light tab strip).
await sharp(await square(512, 0.1, BG))
  .composite([{ input: roundedMask(512, 112), blend: 'dest-in' }])
  .png({ compressionLevel: 9, palette: true })
  .toFile('src/app/icon.png');

// Apple touch icon: opaque and full-bleed, because iOS applies its own corner mask.
await sharp(await square(180, 0.12, BG)).flatten({ background: BG }).png({ compressionLevel: 9 }).toFile('src/app/apple-icon.png');

console.log('icons written');
