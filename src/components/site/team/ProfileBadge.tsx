'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { useAfterIdle } from '@/hooks/use-after-idle';
import { useFieldMode } from '@/hooks/use-field-mode';
import { useHydrated, useMedia } from '@/hooks/use-media';
import { BadgeStatic } from './badge/BadgeStatic';
import type { BadgeData } from './badge/badge-face';
import { type BadgePrints, printBadges } from './badge/print-badges';
import { stageLayout } from './badge/stage-layout';

const Lanyard = dynamic(() => import('@/components/reactbits/Lanyard'), { ssr: false });

const LIVE_TIMEOUT_MS = 4000;
/** The badge's bottom edge rests this share of the stage height above the stage's bottom. */
const REST = 0.1;

/**
 * A member's own badge on its own stage (member-profile brief 5): larger, swaying gently, and
 * grabbable on wide screens with a fine pointer. Everyone else (phones, touch, reduced motion, no
 * WebGL, no JavaScript) sees the same badge as HTML, hanging in the same place.
 */
export function ProfileBadge({ badge }: { badge: BadgeData }) {
  const stageRef = useRef<HTMLDivElement>(null);
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
  const [visible, setVisible] = useState(true);

  const gaveUp = failed || (timedOut && !ready);
  const eligible = hydrated && wide && !coarse && webgl && !gaveUp;
  const mode = !hydrated ? 'pending' : !eligible ? 'static-row' : ready ? 'live' : 'pending';

  useEffect(() => {
    if (!eligible || ready) return;
    const timer = window.setTimeout(() => setTimedOut(true), LIVE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [eligible, ready]);

  useEffect(() => {
    if (!eligible || !idle || prints) return;
    let cancelled = false;
    printBadges([badge])
      .then(result => !cancelled && setPrints(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [eligible, idle, prints, badge]);

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
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [eligible]);

  const layout = useMemo(() => {
    if (!size) return null;
    const result = stageLayout({ ...size, count: 1, textFraction: 0, cardMin: 340, cardMax: 420, rail: 0, restGap: size.height * REST });
    return { ...result, key: `${result.ropeLength.toFixed(2)}-${result.anchors[0][0].toFixed(1)}` };
  }, [size]);
  const badges = useMemo(() => (layout ? [{ key: badge.slug, anchor: layout.anchors[0], startSide: 1 as const }] : []), [layout, badge.slug]);

  return (
    <div ref={stageRef} aria-hidden="true" data-board-stage="" data-mode={mode} className="profile-stage relative">
      {eligible && prints && layout && (
        <FieldBoundary onError={() => setFailed(true)}>
          <Lanyard
            badges={badges}
            atlases={prints.atlases}
            strap={prints.strap}
            cameraZ={layout.cameraZ}
            ropeLength={layout.ropeLength}
            layoutKey={layout.key}
            active={visible}
            coarse={false}
            eventSource={stageRef}
            sway
            onReady={() => setReady(true)}
            onFail={() => setFailed(true)}
          />
        </FieldBoundary>
      )}
      <span className="badge-static-art profile-badge relative block">
        <span className="badge-strap" />
        <span className="badge-clip" />
        <BadgeStatic badge={badge} priority sizes="(min-width: 768px) 300px, 240px" />
      </span>
    </div>
  );
}
