'use client';

import { Dialog } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, CircleAlert, X } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { formatDay } from '@/lib/dates';
import { altText, aspectOf, ik } from '@/lib/photos';

export type ViewerPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  taken_on: string | null;
  width: number | null;
  height: number | null;
  event: { slug: string; title: string } | null;
};

/** Where a photo flies from (a dome tile or a grid thumbnail). `el` gives its current rect on close. */
export type ViewerOrigin = { rect: DOMRect; tone: 'duotone' | 'colour'; el?: HTMLElement | null };

type Props = {
  photos: ViewerPhoto[];
  /** null means closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** FLIP source; without one the viewer fades. */
  origin?: ViewerOrigin | null;
  showEventLink?: boolean;
  /** Where focus goes when the viewer closes. */
  finalFocus?: RefObject<HTMLElement | null>;
};

const FLIGHT_MS = 320;
const RETURN_MS = 240;
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/** The keyframe that places the final frame F exactly over the origin rect O (gallery brief 5.7). */
function flightFrom(frame: DOMRect, origin: DOMRect): Keyframe {
  const s = Math.max(origin.width / frame.width, origin.height / frame.height);
  const tx = origin.x + origin.width / 2 - frame.x - (frame.width * s) / 2;
  const ty = origin.y + origin.height / 2 - frame.y - (frame.height * s) / 2;
  const ix = (frame.width - origin.width / s) / 2;
  const iy = (frame.height - origin.height / s) / 2;
  return { transform: `translate(${tx}px, ${ty}px) scale(${s})`, clipPath: `inset(${iy}px ${ix}px ${iy}px ${ix}px round ${10 / s}px)` };
}
const LANDED: Keyframe = { transform: 'none', clipPath: 'inset(0 round 10px)' };

export function PhotoViewer({ photos, index, onIndexChange, origin = null, showEventLink = true, finalFocus }: Props) {
  const reduce = usePrefersReducedMotion();
  const photo = index === null ? null : photos[index] ?? null;
  const frameRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const flewFor = useRef<string | null>(null);
  const closing = useRef(false);
  const [landed, setLanded] = useState(true);
  // The photo this open started on: later photos (previous and next) cross-fade instead of flying.
  const [openedId, setOpenedId] = useState<string | null>(null);
  if (photo && openedId === null) setOpenedId(photo.id);
  if (!photo && openedId !== null) setOpenedId(null);

  // Fly in from the origin once per open (previous and next cross-fade instead).
  useLayoutEffect(() => {
    if (!photo) {
      flewFor.current = null;
      closing.current = false;
      return;
    }
    const frame = frameRef.current;
    if (flewFor.current || !origin || reduce || !frame || typeof frame.animate !== 'function') {
      flewFor.current ??= photo.id;
      setLanded(true);
      return;
    }
    flewFor.current = photo.id;
    setLanded(false);
    const flight = frame.animate([flightFrom(frame.getBoundingClientRect(), origin.rect), LANDED], { duration: FLIGHT_MS, easing: EASE });
    if (origin.tone === 'duotone' && tintRef.current) {
      tintRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FLIGHT_MS, delay: 80, easing: EASE, fill: 'backwards' });
    }
    flight.onfinish = () => setLanded(true);
    return () => flight.cancel();
  }, [photo, origin, reduce]);

  const close = () => {
    if (closing.current) return;
    const frame = frameRef.current;
    const target = origin?.el?.getBoundingClientRect() ?? origin?.rect;
    if (!frame || !target || reduce || typeof frame.animate !== 'function') {
      onIndexChange(null);
      return;
    }
    closing.current = true;
    const back = frame.animate([LANDED, flightFrom(frame.getBoundingClientRect(), target)], { duration: RETURN_MS, easing: EASE, fill: 'forwards' });
    back.onfinish = () => onIndexChange(null);
  };

  const go = (delta: number) => {
    if (index === null) return;
    const next = index + delta;
    if (next >= 0 && next < photos.length) onIndexChange(next);
  };

  const n = photos.length;
  const i = index === null ? 0 : index + 1;
  const flying = !landed && !reduce;

  return (
    <Dialog.Root
      open={photo !== null}
      onOpenChange={open => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-rc-bg/[0.98] transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          initialFocus={closeRef}
          finalFocus={finalFocus}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') go(-1);
            if (event.key === 'ArrowRight') go(1);
          }}
          className={`fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-4 outline-none sm:p-8 ${origin ? '' : 'transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none'}`}
        >
          <Dialog.Title className="sr-only">{`Photo ${i} of ${n}`}</Dialog.Title>
          <div className="flex items-center justify-end">
            <p className="type-ui mr-auto hidden text-rc-muted md:block">{`${i} of ${n}`}</p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="inline-flex size-11 items-center justify-center rounded-md text-rc-ink transition-colors hover:bg-rc-surface"
            >
              <X aria-hidden="true" />
              <span className="sr-only">Close photo</span>
            </button>
          </div>

          <div className="relative grid min-h-0 place-items-center [--chrome-x:2rem] md:px-20 md:[--chrome-x:14rem]">
            {photo && (
              <ViewerImage
                key={photo.id}
                photo={photo}
                frameRef={frameRef}
                tintRef={tintRef}
                tinted={origin?.tone === 'duotone'}
                crossFade={openedId !== null && openedId !== photo.id}
                caption={
                  photo.caption || photo.taken_on || (showEventLink && photo.event) ? (
                    <div className={`space-y-1 transition-opacity duration-150 motion-reduce:transition-none ${flying ? 'opacity-0' : 'opacity-100'}`}>
                      {photo.caption && <p className="max-w-[60ch] text-[17px] text-rc-text">{photo.caption}</p>}
                      {photo.taken_on && <p className="text-[15px] text-rc-muted">Taken on {formatDay(photo.taken_on)}</p>}
                      {showEventLink && photo.event && (
                        <Link href={`/events/${photo.event.slug}`} className="text-link">
                          See the {photo.event.title} event
                        </Link>
                      )}
                    </div>
                  ) : null
                }
                onSwipeStart={(x, y) => (swipeStart.current = { x, y })}
                onSwipeEnd={(x, y) => {
                  const start = swipeStart.current;
                  swipeStart.current = null;
                  if (!start) return;
                  const dx = x - start.x;
                  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(y - start.y)) go(dx < 0 ? 1 : -1);
                }}
              />
            )}
            <NavButton side="left" label="Previous photo" disabled={index === 0} onClick={() => go(-1)} className="absolute left-0 top-1/2 hidden -translate-y-1/2 md:inline-flex" />
            <NavButton side="right" label="Next photo" disabled={index === n - 1} onClick={() => go(1)} className="absolute right-0 top-1/2 hidden -translate-y-1/2 md:inline-flex" />
          </div>

          <div className="flex items-center justify-between md:hidden">
            <NavButton side="left" label="Previous photo" disabled={index === 0} onClick={() => go(-1)} className="inline-flex" />
            <p className="type-ui text-rc-muted">{`${i} of ${n}`}</p>
            <NavButton side="right" label="Next photo" disabled={index === n - 1} onClick={() => go(1)} className="inline-flex" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NavButton({ side, label, disabled, onClick, className }: { side: 'left' | 'right'; label: string; disabled: boolean; onClick: () => void; className: string }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`size-12 items-center justify-center rounded-full border border-rc-line text-rc-ink transition-colors hover:border-rc-muted disabled:opacity-40 ${className}`}
    >
      <Icon aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

type ImageProps = {
  photo: ViewerPhoto;
  frameRef: RefObject<HTMLDivElement | null>;
  tintRef: RefObject<HTMLDivElement | null>;
  tinted: boolean;
  crossFade: boolean;
  caption: ReactNode;
  onSwipeStart: (x: number, y: number) => void;
  onSwipeEnd: (x: number, y: number) => void;
};

/**
 * One photo, true colour, with its caption aligned to the photo's left edge (the figcaption's
 * w-0 min-w-full makes it wrap within the photo's width instead of widening the figure).
 * Keyed by photo, so its load-error state resets per photo.
 */
function ViewerImage({ photo, frameRef, tintRef, tinted, crossFade, caption, onSwipeStart, onSwipeEnd }: ImageProps) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ratio = aspectOf(photo);
  const retry = attempt ? `&r=${attempt}` : '';
  const src = `${ik(photo.image_url, `w-${Math.min(1600, photo.width ?? 1600)},q-82,f-auto`)}${retry}`;
  const srcSet = [800, 1200, 1600].map(w => `${ik(photo.image_url, `w-${w},q-82,f-auto`)}${retry} ${w}w`).join(', ');

  if (failed) {
    return (
      <div className="flex max-w-[40ch] flex-col items-start gap-4 text-rc-text">
        <p className="flex items-start gap-3">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          This photo didn’t load. Check your connection, then try again.
        </p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setAttempt(a => a + 1);
          }}
          className="type-ui inline-flex min-h-12 items-center rounded-md border border-rc-line px-6 text-rc-ink hover:border-rc-muted"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <figure className={`flex max-w-full flex-col ${crossFade ? 'animate-in fade-in duration-150 motion-reduce:animate-none' : ''}`}>
      <div
        ref={frameRef}
        onPointerDown={e => onSwipeStart(e.clientX, e.clientY)}
        onPointerUp={e => onSwipeEnd(e.clientX, e.clientY)}
        className="relative max-w-full origin-top-left overflow-hidden rounded-[10px]"
        // As tall as fits under the controls, never wider than the space beside the nav buttons.
        style={{ aspectRatio: ratio, height: `min(64svh, 1100px, calc((100vw - var(--chrome-x)) / ${ratio}))` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- srcset from ImageKit directly; next/image's loader can't swap from the cached grid size */}
        <img src={src} srcSet={srcSet} sizes="92vw" alt={altText(photo)} onError={() => setFailed(true)} className="h-full w-full object-cover" draggable={false} />
        {tinted && <div ref={tintRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-rc-accent-deep opacity-0 mix-blend-color" />}
      </div>
      {caption && <figcaption className="mt-4 w-0 min-w-full">{caption}</figcaption>}
    </figure>
  );
}
