import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIXTURE_PHOTOS } from '@/lib/data/fixtures';
import { WALL_POOL, wallLayout } from './wall-photos';

const TILE = { width: 240, height: 160, gap: 16 };

describe('wallLayout', () => {
  it('never puts a photo on the wall twice, and puts the gallery first', () => {
    const { photos } = wallLayout(FIXTURE_PHOTOS, { width: 1920, height: 700 }, TILE);
    expect(new Set(photos.map(p => p.id)).size).toBe(photos.length);
    expect(photos.slice(0, FIXTURE_PHOTOS.length).map(p => p.id)).toEqual(FIXTURE_PHOTOS.map(p => p.id));
  });

  it('gives every column a loop taller than the wall, so no column shows a photo twice', () => {
    const size = { width: 1920, height: 700 };
    const { columns, photos } = wallLayout(FIXTURE_PHOTOS, size, TILE);
    const perColumn = Math.floor(photos.length / columns);
    expect(perColumn * (TILE.height + TILE.gap)).toBeGreaterThan(size.height);
  });

  it('adds columns for a wider wall, and keeps at least three', () => {
    const narrow = wallLayout(FIXTURE_PHOTOS, { width: 900, height: 700 }, TILE);
    const wide = wallLayout(FIXTURE_PHOTOS, { width: 1920, height: 700 }, TILE);
    expect(wide.columns).toBeGreaterThan(narrow.columns);
    expect(wallLayout([], { width: 300, height: 5000 }, TILE).columns).toBe(3);
  });

  it('needs none of the club pool once the gallery has enough photos', () => {
    const gallery = Array.from({ length: 80 }, (_, i) => ({ ...FIXTURE_PHOTOS[0], id: `g-${i}` }));
    const { photos } = wallLayout(gallery, { width: 1920, height: 700 }, TILE);
    expect(photos.every(p => p.id.startsWith('g-'))).toBe(true);
  });
});

describe('the club pool', () => {
  it('ships every tile and large copy', () => {
    for (const photo of WALL_POOL) {
      for (const file of [photo.thumb!, photo.image_url]) expect(existsSync(join(process.cwd(), 'public', file)), file).toBe(true);
    }
  });
});
