'use client';

import { useSyncExternalStore } from 'react';
import ProfileCard from '@/components/reactbits/ProfileCard';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { ik } from '@/lib/photos';

const FINE = '(pointer: fine)';
const subscribeFine = (onChange: () => void) => {
  const mql = window.matchMedia(FINE);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

type Props = { name: string; role: string; photoUrl: string };

/**
 * The faculty coordinator's holographic ProfileCard, lit with the club blues, his photo in its own
 * colours (owner, 2026-10-08: no monochrome). Decorative: the name,
 * role and profile link are always in the HTML beside it, so the card prints neither. Tilt only on
 * fine pointers, never under reduced motion.
 */
export function FacultyCard({ name, role, photoUrl }: Props) {
  const reduce = usePrefersReducedMotion();
  const fine = useSyncExternalStore(subscribeFine, () => window.matchMedia(FINE).matches, () => false);
  return (
    <div aria-hidden="true" className="w-fit max-w-full shrink-0">
      <ProfileCard
        // At most 400px tall (287px wide), and never wider than a phone's content column.
        cardMaxHeight="min(400px, calc((100vw - 2.5rem) / 0.718))"
        // The photo is a 354px square, so crop it to the card's 0.718 shape to fill the card edge to edge.
        avatarUrl={ik(photoUrl, 'w-254,h-354')}
        iconUrl=""
        grainUrl=""
        name={name}
        title={role}
        showDetails={false}
        trueColour
        showUserInfo={false}
        enableTilt={fine && !reduce}
        enableMobileTilt={false}
        behindGlowEnabled
        behindGlowColor="rgba(97, 154, 195, 0.5)"
        innerGradient="linear-gradient(145deg, rgba(74, 141, 183, 0.35), rgba(13, 13, 13, 0.9))"
      />
    </div>
  );
}
