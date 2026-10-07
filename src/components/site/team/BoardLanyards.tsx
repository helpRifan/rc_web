'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { type CSSProperties, type FocusEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LanyardBadge } from '@/components/reactbits/Lanyard';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { useAfterIdle } from '@/hooks/use-after-idle';
import { useFieldMode } from '@/hooks/use-field-mode';
import { useHydrated, useMedia } from '@/hooks/use-media';
import type { BadgeData } from './badge/badge-face';
import { type BadgePrints, printBadges } from './badge/print-badges';
import { stageLayout, teamStageParams } from './badge/stage-layout';

const Lanyard = dynamic(() => import('@/components/reactbits/Lanyard'), { ssr: false });

/** pending: waiting for the live board; live: the WebGL board; static-row and static-rail: the HTML badges. */
export type BoardMode = 'pending' | 'live' | 'static-row' | 'static-rail';

/** The live board gets 4s from hydration to draw its first frame, or the static row takes over. */
const LIVE_TIMEOUT_MS = 4000;

/** The board's mode, from where the page is and what's happened so far (team brief 5.1). */
export function resolveBoardMode(s: { hydrated: boolean; wide: boolean; webgl: boolean; gaveUp: boolean; ready: boolean }): BoardMode {
  if (!s.hydrated) return 'pending';
  if (!s.wide) return 'static-rail';
  if (!s.webgl || s.gaveUp) return 'static-row';
  return s.ready ? 'live' : 'pending';
}

type Props = {
  badges: BadgeData[];
  /** The h1 and intro (server-rendered). */
  intro: ReactNode;
  /** The static badge units (server-rendered <li>s), which are also the board's links. */
  children: ReactNode;
};

/**
 * The Team board: the Board's ID badges hanging from the site header on one WebGL canvas, with the
 * labels underneath as the real links. Phones get a rail of HTML badges; reduced motion, no WebGL
 * or a slow start get the same HTML badges hanging in the live rest positions.
 */
export function BoardLanyards({ badges, intro, children }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const hydrated = useHydrated();
  const wide = useMedia('(min-width: 48rem)');
  const coarse = useMedia('(pointer: coarse)');
  const webgl = useFieldMode() === 'webgl';
  const idle = useAfterIdle();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [prints, setPrints] = useState<BadgePrints | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [visible, setVisible] = useState(true);
  const [nudge, setNudge] = useState<{ key: string; at: number } | null>(null);

  const gaveUp = failed || (timedOut && !ready);
  const mode = resolveBoardMode({ hydrated, wide, webgl, gaveUp, ready });
  const eligible = hydrated && wide && webgl && !gaveUp;

  useEffect(() => {
    if (!eligible || ready) return;
    const timer = window.setTimeout(() => setTimedOut(true), LIVE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [eligible, ready]);

  useEffect(() => {
    if (!eligible || !idle || prints) return;
    let cancelled = false;
    printBadges(badges)
      .then(result => !cancelled && setPrints(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [eligible, idle, prints, badges]);

  // The stage's size drives the layout; resizes settle for 150ms first.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !eligible) return;
    let timer: number | undefined;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [eligible]);

  // No frames while the stage is off-screen or the tab is hidden.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !eligible) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [eligible]);

  const layout = useMemo(() => {
    if (!size) return null;
    const params = teamStageParams(size.width);
    const result = stageLayout({ ...size, count: badges.length, ...params });
    const key = `${params.textFraction}-${result.ropeLength.toFixed(2)}-${result.anchors.map(a => a[0].toFixed(1)).join(',')}`;
    return { ...result, key };
  }, [size, badges.length]);

  const lanyardBadges = useMemo<LanyardBadge[]>(
    () => (layout ? badges.map((badge, i) => ({ key: badge.slug, anchor: layout.anchors[i], startSide: i % 2 ? -1 : 1 })) : []),
    [layout, badges],
  );

  const open = useCallback((slug: string) => router.push(`/team/${slug}`), [router]);
  const prefetch = useCallback((slug: string) => router.prefetch(`/team/${slug}`), [router]);
  const onLabelFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const slug = (event.target as HTMLElement).closest<HTMLElement>('[data-slug]')?.dataset.slug;
      if (slug && mode === 'live') setNudge({ key: slug, at: event.timeStamp });
    },
    [mode],
  );

  const hint = mode !== 'live' ? null : coarse ? 'Drag a badge sideways to swing it. Tap one to open a profile.' : 'Grab a badge and swing it. Click one to open a profile.';

  return (
    <section ref={stageRef} aria-labelledby="team-title" data-board-stage="" data-mode={mode} className="board-stage relative w-full">
      {eligible && prints && layout && (
        <div aria-hidden="true" className="absolute inset-0">
          <FieldBoundary onError={() => setFailed(true)}>
            <Lanyard
              badges={lanyardBadges}
              atlases={prints.atlases}
              strap={prints.strap}
              cameraZ={layout.cameraZ}
              ropeLength={layout.ropeLength}
              layoutKey={layout.key}
              active={onScreen && visible}
              coarse={coarse}
              eventSource={stageRef}
              onOpen={open}
              onHover={prefetch}
              nudge={nudge}
              onReady={() => setReady(true)}
              onFail={() => setFailed(true)}
            />
          </FieldBoundary>
        </div>
      )}

      <div className="board-copy site-gutter relative pt-28">
        {intro}
        <div className="board-heading mt-12">
          <h2 id="board-heading" className="type-section text-rc-ink">
            The board
          </h2>
          {hint && <p className="mt-3 max-w-[30ch] text-rc-muted">{hint}</p>}
        </div>
      </div>

      <ul role="list" aria-labelledby="board-heading" className="board-units" style={{ '--n': badges.length } as CSSProperties} onFocus={onLabelFocus}>
        {children}
      </ul>
    </section>
  );
}
