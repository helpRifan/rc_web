'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { SectionHeader } from '@/components/site/SectionHeader';
import { GalleryDome } from './GalleryDome';
import { GalleryGrid } from './GalleryGrid';
import { PhotoViewer, type ViewerOrigin, type ViewerPhoto } from './PhotoViewer';

export const GALLERY_LEDE = 'Photos from club workshops, competitions and events.';
const DOME_HINT = 'Drag to look around. Click or tap a photo to open it.';
const GRID_HINT = 'Click or tap a photo to open it.';

type Props = { photos: ViewerPhoto[]; mode: 'dome' | 'grid' };

/** Dome (5 or more photos) or grid only; one viewer for both, with Back closing a photo. */
export function GalleryView({ photos, mode }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const finalFocus = useRef<HTMLElement | null>(null);
  const hiddenTile = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);
  const [index, setIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<ViewerOrigin | null>(null);
  const [domeFailed, setDomeFailed] = useState(false);
  const n = photos.length;

  const reveal = () => {
    if (hiddenTile.current) hiddenTile.current.style.visibility = '';
    hiddenTile.current = null;
  };

  const open = useCallback(
    (i: number, from: ViewerOrigin | null) => {
      setOrigin(from);
      setIndex(i);
      window.history.pushState({ photo: photos[i].id }, '', `?photo=${encodeURIComponent(photos[i].id)}`);
      pushed.current = true;
    },
    [photos],
  );

  const change = (next: number | null) => {
    if (next === null) {
      reveal();
      setIndex(null);
      setOrigin(null);
      if (pushed.current) {
        pushed.current = false;
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return;
    }
    setIndex(next);
    window.history.replaceState({ photo: photos[next].id }, '', `?photo=${encodeURIComponent(photos[next].id)}`);
  };

  // Back closes the photo instead of leaving the page. A shared ?photo= link opens that photo.
  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      if (!(event.state as { photo?: string } | null)?.photo) {
        pushed.current = false;
        reveal();
        setIndex(null);
        setOrigin(null);
      }
    };
    window.addEventListener('popstate', onPop);
    const id = new URLSearchParams(window.location.search).get('photo');
    if (id) {
      const i = photos.findIndex(p => p.id === id);
      if (i >= 0) {
        finalFocus.current = heroRef.current;
        // Opening from a shared link: a fade, no flight.
        queueMicrotask(() => {
          setOrigin(null);
          setIndex(i);
        });
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    return () => window.removeEventListener('popstate', onPop);
  }, [photos]);

  const openFromDome = (i: number, tile: HTMLElement) => {
    tile.style.visibility = 'hidden';
    hiddenTile.current = tile;
    finalFocus.current = heroRef.current; // dome tiles aren't focusable
    open(i, { rect: tile.getBoundingClientRect(), tone: 'duotone', el: tile });
  };
  const openFromGrid = (i: number, el: HTMLElement) => {
    finalFocus.current = el;
    open(i, { rect: el.getBoundingClientRect(), tone: 'colour', el });
  };

  const viewer = <PhotoViewer photos={photos} index={index} onIndexChange={change} origin={origin} finalFocus={finalFocus} />;

  if (mode === 'grid') {
    return (
      <section ref={heroRef} tabIndex={-1} aria-labelledby="gallery-title" className="site-gutter pb-20 pt-28 focus:outline-none sm:pb-24 lg:pb-28">
        <div className="max-w-[80rem]">
          <ScrambleHeading as="h1" id="gallery-title" text="The club in photos" className="type-display max-w-[14ch] text-balance text-rc-ink" />
          <p className="mt-6 max-w-[34em] text-lg text-rc-text">
            {GALLERY_LEDE} {GRID_HINT}
          </p>
          <div className="mt-12">
            <GalleryGrid photos={photos} large onOpen={openFromGrid} />
          </div>
        </div>
        {viewer}
      </section>
    );
  }

  return (
    <>
      <section
        ref={heroRef}
        tabIndex={-1}
        aria-labelledby="gallery-title"
        data-dome={domeFailed ? 'failed' : undefined}
        className="group/dome relative isolate focus:outline-none md:h-svh md:min-h-[640px] md:overflow-hidden data-[dome=failed]:md:h-auto"
      >
        <div className="site-gutter relative z-10 pt-28 md:absolute md:bottom-0 md:left-0 md:pb-14 md:pt-0 group-data-[dome=failed]/dome:md:static group-data-[dome=failed]/dome:md:pt-28">
          <ScrambleHeading as="h1" id="gallery-title" text="The club in photos" className="type-display max-w-[11em] text-balance text-rc-ink" />
          <p className="mt-6 max-w-[34em] text-lg text-rc-text">
            {GALLERY_LEDE} <span className="group-data-[dome=failed]/dome:hidden">{DOME_HINT}</span>
            <span className="hidden group-data-[dome=failed]/dome:inline">{GRID_HINT}</span>
          </p>
          <a href="#all-photos" className="text-link mt-6 hidden md:inline-flex group-data-[dome=failed]/dome:md:hidden">
            Show all {n} photos
          </a>
        </div>
        <div className="relative mt-8 h-[62svh] min-h-[420px] md:absolute md:inset-0 md:mt-0 md:h-auto md:min-h-0 group-data-[dome=failed]/dome:hidden">
          <div aria-hidden="true" className="field-poster absolute inset-0" />
          <FieldBoundary onError={() => setDomeFailed(true)}>
            <GalleryDome photos={photos} frozen={index !== null} onOpen={openFromDome} />
          </FieldBoundary>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[72%] bg-[linear-gradient(to_top,rgba(13,13,13,0.94)_0%,rgba(13,13,13,0.86)_38%,rgba(13,13,13,0)_100%)] md:block"
          />
        </div>
        <div className="site-gutter mt-6 md:hidden group-data-[dome=failed]/dome:hidden">
          <a href="#all-photos" className="text-link">
            Show all {n} photos
          </a>
        </div>
      </section>

      <section id="all-photos" aria-labelledby="all-photos-title" className="site-gutter scroll-mt-24 py-20 sm:py-24 lg:py-28">
        <div className="max-w-[80rem]">
          <SectionHeader id="all-photos-title" title={`All ${n} photos`} />
          <div className="mt-10 lg:mt-12">
            <GalleryGrid photos={photos} onOpen={openFromGrid} />
          </div>
        </div>
      </section>
      {viewer}
    </>
  );
}
