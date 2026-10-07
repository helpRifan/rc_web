'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNearViewport } from '@/hooks/use-near-viewport';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { ik } from '@/lib/photos';
import type { ViewerPhoto } from './PhotoViewer';

const DomeGallery = dynamic(() => import('@/components/reactbits/DomeGallery'), { ssr: false });

const COARSE = '(pointer: coarse)';
const subscribeCoarse = (onChange: () => void) => {
  const mql = window.matchMedia(COARSE);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

type Props = { photos: ViewerPhoto[]; frozen: boolean; onOpen: (index: number, tile: HTMLElement) => void };

/**
 * The club's photos on the inside of a dome, toned in the logo blue. Loads near the viewport,
 * waits until the nine tile images have decoded, then fades in and turns into place once.
 */
export function GalleryDome({ photos, frozen, onOpen }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  const reduce = usePrefersReducedMotion();
  const coarse = useSyncExternalStore(subscribeCoarse, () => window.matchMedia(COARSE).matches, () => false);
  const [decoded, setDecoded] = useState(false);
  const tiles = useMemo(() => photos.map((p, index) => ({ src: ik(p.image_url, 'w-360,h-360,fo-auto,q-70,f-auto'), alt: '', index })), [photos]);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    Promise.all(
      tiles.map(tile => {
        const img = new Image();
        img.src = tile.src;
        return img.decode().catch(() => {});
      }),
    ).then(() => {
      if (!cancelled) setDecoded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [near, tiles]);

  return (
    <div ref={ref} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${decoded ? 'opacity-100' : 'opacity-0'}`}>
      {near && decoded && (
        <DomeGallery
          images={tiles}
          segments={coarse ? 20 : 24}
          fit={0.5}
          fitBasis="auto"
          minRadius={coarse ? 420 : 600}
          maxRadius={coarse ? 600 : 900}
          overlayBlurColor="#0D0D0D"
          maxVerticalRotationDeg={coarse ? 0 : 6}
          dragSensitivity={coarse ? 18 : 20}
          dragDampening={0.7}
          imageBorderRadius="10px"
          tone="duotone"
          inertia={!reduce}
          introSpinDeg={reduce ? 0 : 18}
          frozen={frozen}
          touchPanY={coarse}
          edgeBlur={!coarse}
          onOpen={onOpen}
        />
      )}
    </div>
  );
}
