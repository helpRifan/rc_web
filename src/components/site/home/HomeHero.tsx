'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TechText, { type TechTextControl } from '@/components/reactbits/TechText';
import { ButtonLink } from '@/components/site/ButtonLink';
import { useMedia } from '@/hooks/use-media';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { PALETTE } from '@/lib/palette';
import { HeroField } from './HeroField';

export const HERO = {
  title: 'Robotics Club',
  body: 'Students at VIT Chennai who design, wire and program robots, then take them to competitions. New members start with beginner workshops.',
} as const;

/**
 * The club reel, in full HD from the owner's footage: a time-lapse of the lab and the arena build,
 * robo soccer, robo sumo and the race track at TechnoVIT '26, and a soldering bench. Each comes as
 * AV1 (about half the bytes) and H.264 for browsers without smooth AV1.
 */
export const REEL = {
  wide: { src: '/home/reel-wide.mp4', av1: '/home/reel-wide.av1.mp4', poster: '/home/reel-wide.webp', width: 1920, height: 1080 },
  tall: { src: '/home/reel-tall.mp4', av1: '/home/reel-tall.av1.mp4', poster: '/home/reel-tall.webp', width: 1080, height: 1920 },
} as const;

const AV1 = 'video/mp4; codecs="av01.0.08M.08"';

/** AV1 only where the browser says it decodes this size smoothly; H.264 everywhere else. */
async function reelSource(reel: (typeof REEL)[keyof typeof REEL]): Promise<string> {
  try {
    const info = await navigator.mediaCapabilities?.decodingInfo({
      type: 'file',
      video: { contentType: AV1, width: reel.width, height: reel.height, bitrate: 2_000_000, framerate: 30 },
    });
    if (info?.supported && info.smooth) return reel.av1;
  } catch {
    // No Media Capabilities, or it refused the query: fall back to H.264.
  }
  return reel.src;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * The title, ROBOTICS CLUB, drawn by Tech Text over the glyph field. With motion allowed the hero is
 * a tall track: scrolling pulls the letters into an exploded view while the club reel grows out of
 * the middle of the screen to fill it. Reduced motion, and the server HTML, get one still screen.
 */
export function HomeHero() {
  const still = usePrefersReducedMotion();
  const narrow = useMedia('(width < 40rem)');
  const coarse = useMedia('(pointer: coarse)');
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const control = useRef<TechTextControl | null>(null);
  const pausedByUser = useRef(false);
  const [ready, setReady] = useState(false);
  const [covered, setCovered] = useState(false);
  const [toggle, setToggle] = useState<'hidden' | 'pause' | 'play'>('hidden');
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (still) return undefined;
    const track = trackRef.current;
    const stage = stageRef.current;
    const copy = copyRef.current;
    const letters = lettersRef.current;
    const reel = reelRef.current;
    const video = videoRef.current;
    if (!track || !stage || !copy || !letters || !reel || !video) return undefined;

    const source = window.matchMedia('(orientation: portrait)').matches ? REEL.tall : REEL.wide;
    video.poster = source.poster;
    let disposed = false;
    reelSource(source).then(src => {
      if (!disposed) video.src = src;
    });
    const small = window.matchMedia('(width < 40rem)').matches;
    // The reel starts as a framed window in the middle of the stage (percent of the stage).
    const startW = small ? 66 : 34;
    const startH = small ? 30 : 36;
    let raf = 0;
    let wasCovered = false;
    let toggleShown = false;

    const apply = () => {
      raf = 0;
      const span = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = clamp(-track.getBoundingClientRect().top / span);

      control.current?.setExplode(smooth(0.02, 0.44, p));

      const fade = smooth(0, 0.14, p);
      copy.style.opacity = String(1 - fade);
      copy.style.transform = `translate3d(0, ${(-32 * fade).toFixed(1)}px, 0)`;
      copy.style.pointerEvents = fade > 0.5 ? 'none' : '';

      const grow = smooth(0.1, 0.86, p);
      const w = startW + (100 - startW) * grow;
      const h = startH + (100 - startH) * grow;
      const ix = ((100 - w) / 2).toFixed(2);
      const iy = ((100 - h) / 2).toFixed(2);
      reel.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${(18 * (1 - grow)).toFixed(1)}px)`;
      reel.style.opacity = String(smooth(0.03, 0.12, p));
      reel.style.setProperty('--reel-foot', smooth(0.7, 1, p).toFixed(3));
      video.style.transform = `scale(${(1.22 - 0.22 * grow).toFixed(4)})`;
      letters.style.opacity = String(1 - smooth(0.62, 0.88, p));

      const nowCovered = p > 0.9;
      if (nowCovered !== wasCovered) {
        wasCovered = nowCovered;
        setCovered(nowCovered);
        control.current?.setAsleep(nowCovered);
      }

      const onScreen = stage.getBoundingClientRect().bottom > 0;
      const showing = p > 0.03 && onScreen;
      if (showing && video.paused && !pausedByUser.current) video.play().catch(() => {});
      if (!showing && !video.paused) video.pause();
      const showToggle = p > 0.5 && onScreen;
      if (showToggle !== toggleShown) {
        toggleShown = showToggle;
        setToggle(showToggle ? (pausedByUser.current ? 'play' : 'pause') : 'hidden');
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (!video.paused) video.pause();
    };
  }, [still]);

  // The copy fades out as the stage scrolls; a keyboard user tabbing to it brings it back.
  const showCopy = () => {
    const track = trackRef.current;
    if (!track || still || track.getBoundingClientRect().top >= 0) return;
    window.scrollTo({ top: window.scrollY + track.getBoundingClientRect().top, behavior: 'instant' });
  };

  const toggleReel = () => {
    const video = videoRef.current;
    if (!video) return;
    pausedByUser.current = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    setToggle(pausedByUser.current ? 'play' : 'pause');
  };

  return (
    <section ref={trackRef} aria-labelledby="home-title" className={still ? undefined : 'hero-track'}>
      <div ref={stageRef} className="hero-stage relative isolate overflow-hidden">
        <HeroField covered={covered} />
        <div ref={lettersRef} className="absolute inset-0 z-10">
          <TechText
            text={narrow ? 'ROBOTICS\nCLUB' : 'ROBOTICS CLUB'}
            anchor={titleRef}
            eventSource={stageRef}
            controlRef={control}
            onReady={onReady}
            fontWeight={800}
            fontStretch="expanded"
            letterSpacing={-0.02}
            lineGap={0.18}
            color={PALETTE.ink}
            accentColor={PALETTE.accent}
            draggable={!coarse}
            className="absolute inset-0"
          />
        </div>
        <div className="site-gutter relative z-20 flex min-h-svh flex-col justify-center pb-18 pt-28">
          <h1 id="home-title" ref={titleRef} className="hero-title select-none" data-ready={ready || undefined}>
            <span className="sr-only">{HERO.title}</span>
            <span aria-hidden="true" className="hero-title-text">
              {narrow ? (
                <>
                  ROBOTICS
                  <br />
                  CLUB
                </>
              ) : (
                'ROBOTICS CLUB'
              )}
            </span>
          </h1>
          <div ref={copyRef} className="hero-scrim mt-7 max-w-full sm:mt-9" onFocus={showCopy}>
            <p className="max-w-[34em] text-base leading-[1.55] text-rc-text sm:text-lg">{HERO.body}</p>
            <div className="mt-8 flex flex-wrap gap-3 sm:mt-9">
              <ButtonLink href="/events">See upcoming events</ButtonLink>
              <ButtonLink href="/join" variant="secondary">
                Join the club
              </ButtonLink>
            </div>
          </div>
        </div>
        {!still && (
          <div ref={reelRef} aria-hidden="true" className="hero-reel">
            <video ref={videoRef} muted loop playsInline preload="metadata" />
          </div>
        )}
        {!still && toggle !== 'hidden' && (
          <button type="button" onClick={toggleReel} className="hero-reel-toggle type-ui">
            {toggle === 'pause' ? 'Pause video' : 'Play video'}
          </button>
        )}
      </div>
    </section>
  );
}
