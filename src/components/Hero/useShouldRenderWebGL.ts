const MOBILE_BREAKPOINT_PX = 768;

export function useShouldRenderWebGL(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return false;

  if (window.innerWidth < MOBILE_BREAKPOINT_PX) return false;

  return true;
}
