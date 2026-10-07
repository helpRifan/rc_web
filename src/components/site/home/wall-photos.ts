import type { PublicPhoto } from '@/lib/data/types';

/** A Drift Wall photo: a gallery photo, or one of the club's own that ships with the site. */
export type WallPhoto = PublicPhoto & { thumb?: string };

// The club's own photos (owner's folders, 2025 and 2026), exported by the media script into
// public/home/wall as a 520px 3:2 tile and a 1600px copy for the viewer. They fill the wall when
// the gallery is short of photos, so it never has to repeat one; gallery photos always come first.
const POOL: [name: string, width: number, height: number, caption: string][] = [
  ['workshop-talk', 1200, 1600, 'RevUp, the Arduino workshop: a talk on the Uno’s pins.'],
  ['race-platform', 1024, 576, 'A robot climbing the platform on the race track.'],
  ['stall-props', 1600, 1200, 'The club stall at a campus fest.'],
  ['project-chassis', 1600, 1067, 'A robot chassis with an Arduino, a display and a relay.'],
  ['workshop-selfie', 1600, 900, 'A RevUp table, mid-build.'],
  ['arena-team', 1280, 720, 'Members around the robo soccer arena.'],
  ['workshop-wiring', 900, 1600, 'Wiring a circuit at RevUp.'],
  ['project-drones', 1600, 1200, 'Drone frames and parts on the bench.'],
  ['stall-mask', 1200, 1600, 'At the club stall’s photo frame.'],
  ['race-ramp', 1024, 576, 'A robot over the ramp on the race track.'],
  ['workshop-pair', 900, 1600, 'Coding a board at RevUp.'],
  ['expo-table', 1600, 1200, 'Projects on show at an expo.'],
  ['workshop-matrix', 900, 1600, 'An LED matrix lit from a laptop at RevUp.'],
  ['project-drill', 1600, 1067, 'Drilling parts for a build.'],
  ['club-outdoors', 1600, 1200, 'The club, outdoors.'],
  ['workshop-kits', 1200, 1600, 'Arduino kits laid out for a RevUp session.'],
  ['stall-robots', 900, 1600, 'Robots on show at the club stall.'],
  ['workshop-stage', 1600, 1200, 'The team behind RevUp Arduino Level 1.'],
  ['project-lidar', 1600, 900, 'A project demo, mapping on a laptop.'],
  ['workshop-bench', 1600, 1200, 'Building at a RevUp bench.'],
  ['stall-crew', 1600, 1200, 'The crew at the club stall.'],
  ['race-cones', 1024, 576, 'A robot through the cones.'],
  ['workshop-leds', 900, 1600, 'Coding an LED matrix at RevUp.'],
  ['project-parts', 1600, 1067, 'Hands on a robot’s parts.'],
  ['club-evening', 1600, 901, 'The club, group photo.'],
  ['workshop-build', 900, 1600, 'Building circuits at RevUp.'],
  ['expo-demo', 1600, 1200, 'A project demo for visitors.'],
  ['stall-wrench', 900, 1600, 'With the club stall’s giant wrench.'],
  ['workshop-host', 900, 1600, 'Hosting a RevUp session.'],
  ['project-build', 1600, 1067, 'Working on a build outdoors.'],
  ['workshop-circuit', 900, 1600, 'A breadboard circuit at RevUp.'],
  ['stall-cutout', 727, 1600, 'The club’s sign at its stall.'],
  ['workshop-hands-up', 900, 1600, 'Hands up at a RevUp session.'],
  ['project-fix', 1067, 1600, 'Fixing a robot before a run.'],
  ['workshop-group', 1600, 1200, 'RevUp participants, group photo.'],
  ['expo-hall', 1200, 1600, 'Members at an expo.'],
  ['workshop-matrix-close', 900, 1600, 'An LED matrix and its wiring, close up.'],
  ['project-night', 1200, 1600, 'A late build session.'],
  ['stall-frame', 727, 1600, 'The club stall’s photo frame.'],
  ['workshop-code', 900, 1600, 'Code on screen, board on the desk.'],
  ['club-steps', 1600, 1200, 'The club at its stall.'],
  ['workshop-table', 900, 1600, 'Working through a RevUp exercise.'],
];

export const WALL_POOL: WallPhoto[] = POOL.map(([name, width, height, caption], i) => ({
  id: `club-${name}`,
  image_url: `/home/wall/${name}-lg.webp`,
  thumb: `/home/wall/${name}.webp`,
  caption,
  taken_on: null,
  sort_order: 10_000 + i,
  width,
  height,
  created_at: '2026-10-07T00:00:00.000Z',
  event: null,
}));

export type WallLayout = { columns: number; photos: WallPhoto[] };

/**
 * How many columns the wall needs to run edge to edge, and which photos fill them: each column
 * gets enough photos that its loop is taller than the wall, so no photo ever shows twice. Gallery
 * photos come first; the club's pool tops them up. Never fewer than three columns.
 */
export function wallLayout(gallery: PublicPhoto[], size: { width: number; height: number }, tile: { width: number; height: number; gap: number }): WallLayout {
  const unit = tile.height + tile.gap;
  const perColumn = Math.ceil((size.height * 1.3) / unit) + 1;
  const wanted = Math.ceil(size.width / (tile.width + tile.gap)) + 1;
  const seen = new Set<string>();
  const pool = [...gallery, ...WALL_POOL].filter(photo => !seen.has(photo.id) && seen.add(photo.id));
  const columns = Math.max(3, Math.min(wanted, 9, Math.floor(pool.length / perColumn)));
  return { columns, photos: pool.slice(0, columns * perColumn) };
}
