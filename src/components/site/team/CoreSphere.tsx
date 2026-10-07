'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { InfiniteMenuHandle, SphereItem } from '@/components/reactbits/InfiniteMenu';
import { ButtonLink } from '@/components/site/ButtonLink';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { useMedia } from '@/hooks/use-media';
import { drawSphereTiles } from './sphere-tiles';
import type { CoreItem } from './team-items';

const InfiniteMenu = dynamic(() => import('@/components/reactbits/InfiniteMenu'), { ssr: false });

type Props = {
  members: CoreItem[];
  /** No WebGL2, a lost context or a failed chunk: the page switches to the list. */
  onFail: () => void;
};

/** The next member for an arrow key, Home or End, or null for any other key. */
export function sphereKeyTarget(key: string, active: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (active + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (active - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * The core team on a sphere you turn (InfiniteMenu): the front member's name, role, division and
 * tags beside it, and their profile button under it. Keyboard: focus it and use the arrow keys.
 */
export function CoreSphere({ members, onFail }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<InfiniteMenuHandle>(null);
  const coarse = useMedia('(pointer: coarse)');
  const [items, setItems] = useState<SphereItem[] | null>(null);
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const member = members[active] ?? members[0];

  useEffect(() => {
    let cancelled = false;
    drawSphereTiles(members)
      .then(tiles => !cancelled && setItems(members.map((m, i) => ({ key: m.key, tile: tiles[i] }))))
      .catch(() => !cancelled && onFail());
    return () => {
      cancelled = true;
    };
  }, [members, onFail]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(el);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Say who's in front 400ms after the sphere stops.
  useEffect(() => {
    if (moving || !member) return;
    const timer = window.setTimeout(() => {
      setAnnouncement([member.name, member.role, member.divisionLabel].filter(Boolean).join(', '));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [moving, member]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' && member) {
      event.preventDefault();
      router.push(member.href);
      return;
    }
    const next = sphereKeyTarget(event.key, active, members.length);
    if (next === null) return;
    event.preventDefault();
    menuRef.current?.rotateToItem(next);
  };

  const captionFade = moving ? 'opacity-0 duration-100' : 'opacity-100 delay-[250ms] duration-200';

  return (
    <div>
      <div
        ref={containerRef}
        tabIndex={0}
        role="group"
        aria-roledescription="sphere"
        aria-label="Core team sphere"
        aria-describedby="sphere-help"
        onKeyDown={onKeyDown}
        className="relative -mx-5 h-[560px] sm:-mx-[7vw] lg:h-[640px]"
      >
        {items && (
          <FieldBoundary onError={onFail}>
            <div className="absolute inset-0">
              <InfiniteMenu
                items={items}
                active={onScreen && visible}
                coarse={coarse}
                handleRef={menuRef}
                onActiveChange={setActive}
                onMovingChange={setMoving}
                onFail={onFail}
              />
            </div>
          </FieldBoundary>
        )}
        {member && (
          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 hidden transition-opacity lg:block ${captionFade}`}>
            <div className="absolute left-5 top-1/2 max-w-[30%] -translate-y-1/2 sm:left-[7vw]">
              <p className="text-[clamp(2.25rem,3.6vw,3.5rem)] font-extrabold leading-[1.02] text-rc-ink [font-stretch:125%]">{member.name}</p>
              {member.role && <p className="mt-3 text-lg text-rc-text">{member.role}</p>}
              {member.divisionLabel && <p className="mt-1 text-[15px] text-rc-muted">{member.divisionLabel}</p>}
            </div>
            {member.tags.length > 0 && (
              <ul aria-label="Interests" className="absolute right-5 top-1/2 max-w-[24%] -translate-y-1/2 space-y-1.5 text-[15px] text-rc-muted sm:right-[7vw]">
                {member.tags.map(tag => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {member && (
          <div className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 transition-opacity lg:block ${captionFade} ${moving ? 'pointer-events-none' : ''}`}>
            <ButtonLink href={member.href} tabIndex={moving ? -1 : undefined}>
              View profile<span className="sr-only"> of {member.name}</span>
            </ButtonLink>
          </div>
        )}
      </div>

      {member && (
        <div className={`mt-6 transition-opacity lg:hidden ${captionFade}`}>
          <p aria-hidden="true" className="text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold leading-[1.05] text-rc-ink [font-stretch:125%]">{member.name}</p>
          <p aria-hidden="true" className="mt-2 text-rc-text">{[member.role, member.divisionLabel].filter(Boolean).join(', ')}</p>
          {member.tags.length > 0 && <p aria-hidden="true" className="mt-1 text-rc-muted">{member.tags.join(', ')}</p>}
          <ButtonLink href={member.href} className="mt-5">
            View profile<span className="sr-only"> of {member.name}</span>
          </ButtonLink>
        </div>
      )}

      <p id="sphere-help" className="mt-6 text-rc-muted">
        Drag the sphere to turn it. With the keyboard, focus it and use the arrow keys.
      </p>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <ul className="sr-only">
        {members.map(m => (
          <li key={m.key}>{[m.name, m.role, m.divisionLabel].filter(Boolean).join(', ')}</li>
        ))}
      </ul>
    </div>
  );
}
