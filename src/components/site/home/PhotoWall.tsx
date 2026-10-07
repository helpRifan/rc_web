'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import DriftWall, { type DriftWallItem } from '@/components/reactbits/DriftWall';
import { PhotoViewer, type ViewerOrigin } from '@/components/site/gallery/PhotoViewer';
import { SectionHeader, SectionLinkMobile } from '@/components/site/SectionHeader';
import { useMedia } from '@/hooks/use-media';
import type { PublicPhoto } from '@/lib/data/types';
import { ik, openLabel } from '@/lib/photos';
import { wallLayout, type WallPhoto } from './wall-photos';

const LINK = { href: '/gallery', label: 'See the gallery' };
const WIDE = { width: 280, height: 187, gap: 18 };
const NARROW = { width: 150, height: 100, gap: 12 };

export const WALL_HINT = 'Select a photo to open it.';

const captionOf = (photo: PublicPhoto) => photo.caption ?? (photo.event ? `From ${photo.event.title}.` : WALL_HINT);
const thumbOf = (photo: WallPhoto) => photo.thumb ?? ik(photo.image_url, 'w-520,ar-3-2,fo-auto');

/**
 * The newest photos on a Drift Wall that runs edge to edge: tilted columns drifting past each
 * other, each photo on it once. The photo under the pointer lifts out with its caption above the
 * wall, and a photo opens the viewer in place.
 */
export function PhotoWall({ photos }: { photos: PublicPhoto[] }) {
  const wide = useMedia('(width >= 48rem)');
  const tile = wide ? WIDE : NARROW;
  const [size, setSize] = useState({ width: 1440, height: 640 });
  const [active, setActive] = useState<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<ViewerOrigin | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const finalFocus = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = wallRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize({ width: Math.round(width), height: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => wallLayout(photos, size, tile), [photos, size, tile]);
  const items = useMemo<DriftWallItem[]>(() => layout.photos.map(photo => ({ key: photo.id, image: thumbOf(photo), label: openLabel(photo) })), [layout]);

  const open = (i: number, el: HTMLElement) => {
    // Focus comes back to the photo's own button, wherever on the wall the click landed.
    finalFocus.current = wallRef.current?.querySelector<HTMLElement>(`button[data-index="${i}"]`) ?? el;
    setOrigin({ rect: el.getBoundingClientRect(), tone: 'colour', el });
    setIndex(i);
  };

  return (
    <>
      <div className="max-w-[80rem]">
        <SectionHeader id="home-photos" title="Latest photos" link={LINK} />
        <p className="mt-4 line-clamp-2 min-h-[3.1em] max-w-[52ch] text-rc-muted">{active === null ? WALL_HINT : captionOf(layout.photos[active])}</p>
      </div>
      <div ref={wallRef} className="photo-wall -mx-5 mt-6 sm:-mx-[7vw]">
        <DriftWall
          items={items}
          columns={layout.columns}
          tileWidth={tile.width}
          tileHeight={tile.height}
          gap={tile.gap}
          dim={0.82}
          fade={0.5}
          label="Latest photos"
          onOpen={open}
          onActiveChange={setActive}
        />
      </div>
      <SectionLinkMobile {...LINK} />
      <PhotoViewer photos={layout.photos} index={index} onIndexChange={setIndex} origin={origin} finalFocus={finalFocus} />
    </>
  );
}
