// The core sphere's disc art (team brief 5.11): 512px squares, of which the disc shows the inscribed
// circle. A photo when there is one, otherwise the member's glyph print with their first name
// (not the initial: five core members start with A).
import { firstName } from '@/lib/members/display';
import { badgeFamily, drawGlyphWindow, loadImage } from './badge/badge-art';
import type { CoreItem } from './team-items';

const SIZE = 512;

function drawTile(item: CoreItem, family: string, photo: HTMLImageElement | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (photo) {
    const scale = Math.max(SIZE / photo.naturalWidth, SIZE / photo.naturalHeight);
    const sw = SIZE / scale;
    const sh = SIZE / scale;
    ctx.drawImage(photo, (photo.naturalWidth - sw) / 2, (photo.naturalHeight - sh) / 2, sw, sh, 0, 0, SIZE, SIZE);
  } else {
    // The print across the tile, then the first name, fitted to 62% of the width (44 to 84px).
    drawGlyphWindow(ctx, family, item.key, '', 0, 0, SIZE, SIZE, { cols: 10, strokeWidth: 0 });
    const name = firstName(item.name);
    ctx.font = `800 expanded 100px ${family}`;
    if ('fontStretch' in ctx) (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'expanded';
    const px = Math.min(Math.max(((SIZE * 0.62) / (ctx.measureText(name).width || 1)) * 100, 44), 84);
    ctx.font = `800 expanded ${px}px ${family}`;
    if ('fontStretch' in ctx) (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'expanded';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = px * 0.22;
    ctx.strokeStyle = '#0D0D0D';
    ctx.strokeText(name, SIZE / 2, SIZE / 2, SIZE * 0.8);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(name, SIZE / 2, SIZE / 2, SIZE * 0.8);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, 250, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(191, 199, 206, 0.25)';
  ctx.stroke();
  return canvas;
}

export async function drawSphereTiles(items: CoreItem[]): Promise<HTMLCanvasElement[]> {
  const family = await badgeFamily();
  const photos = await Promise.all(items.map(item => (item.spherePhoto ? loadImage(item.spherePhoto) : Promise.resolve(null))));
  return items.map((item, i) => drawTile(item, family, photos[i]));
}
