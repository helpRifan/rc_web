import { useEffect, useRef, useState } from 'react';
import { ClubTab } from '../../types';

const G_CHORD_MAP: Record<string, ClubTab> = {
  h: 'home',
  a: 'about',
  w: 'achievements',
  d: 'departments',
  m: 'members',
  e: 'activities',
  c: 'certificates',
  x: 'admin',
};

const G_CHORD_WINDOW_MS = 600;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

export function useCommandPaletteHotkeys(onNavigate: (tab: ClubTab) => void) {
  const [open, setOpen] = useState(false);
  const awaitingChordRef = useRef(false);
  const chordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    function clearChordWindow() {
      awaitingChordRef.current = false;
      if (chordTimeoutRef.current) {
        clearTimeout(chordTimeoutRef.current);
        chordTimeoutRef.current = null;
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        clearChordWindow();
        return;
      }

      if (isTypingTarget(e.target)) return;

      const isModifierCombo = e.metaKey || e.ctrlKey || e.altKey;
      if (isModifierCombo) return;

      if (awaitingChordRef.current) {
        const target = G_CHORD_MAP[e.key.toLowerCase()];
        clearChordWindow();
        if (target) {
          e.preventDefault();
          onNavigateRef.current(target);
        }
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        awaitingChordRef.current = true;
        chordTimeoutRef.current = setTimeout(clearChordWindow, G_CHORD_WINDOW_MS);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearChordWindow();
    };
  }, []);

  return { open, setOpen };
}
