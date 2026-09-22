import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CLUB_NAV_ITEMS } from '../../nav';
import { ClubTab } from '../../types';
import { buildSearchIndex, filterSearchIndex } from './searchIndex';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: ClubTab) => void;
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const trimmedQuery = query.trim().toLowerCase();
  const navResults = trimmedQuery
    ? CLUB_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(trimmedQuery))
    : CLUB_NAV_ITEMS;
  const searchResults = trimmedQuery ? filterSearchIndex(query, searchIndex) : [];

  type FlatResult = { key: string; label: string; targetTab: ClubTab };
  const flatResults: FlatResult[] = [
    ...navResults.map((item) => ({ key: `nav-${item.id}`, label: item.label, targetTab: item.id })),
    ...searchResults.map((entry) => ({ key: entry.id, label: entry.title, targetTab: entry.targetTab })),
  ];

  function activate(targetTab: ClubTab) {
    onNavigate(targetTab);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      const selected = flatResults[selectedIndex];
      if (selected) activate(selected.targetTab);
    }
  }

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, damping: 28, stiffness: 320 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={transition}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xl bg-bg-elevated border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search or jump to..."
                className="flex-1 bg-transparent text-fg-primary placeholder:text-fg-dim outline-none text-sm"
              />
              <span className="font-mono text-xs text-fg-dim border border-border-subtle rounded px-1.5 py-0.5">
                Esc
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {navResults.length > 0 && (
                <div className="px-2 pb-2">
                  <p className="font-display text-xs text-fg-dim px-2 py-1">Navigate</p>
                  {navResults.map((item) => {
                    const flatIdx = flatResults.findIndex((r) => r.key === `nav-${item.id}`);
                    return (
                      <button
                        key={item.id}
                        onClick={() => activate(item.id)}
                        className={[
                          'w-full text-left px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                          flatIdx === selectedIndex
                            ? 'bg-bg-card text-fg-primary'
                            : 'text-fg-muted hover:bg-bg-card hover:text-fg-primary',
                        ].join(' ')}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="px-2 pb-2">
                  <p className="font-display text-xs text-fg-dim px-2 py-1">Search</p>
                  {searchResults.map((entry) => {
                    const flatIdx = flatResults.findIndex((r) => r.key === entry.id);
                    return (
                      <button
                        key={entry.id}
                        onClick={() => activate(entry.targetTab)}
                        className={[
                          'w-full text-left px-2 py-2 rounded-lg text-sm transition-colors cursor-pointer flex flex-col',
                          flatIdx === selectedIndex
                            ? 'bg-bg-card text-fg-primary'
                            : 'text-fg-muted hover:bg-bg-card hover:text-fg-primary',
                        ].join(' ')}
                      >
                        <span>{entry.title}</span>
                        <span className="text-xs text-fg-dim">{entry.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {trimmedQuery && flatResults.length === 0 && (
                <p className="text-sm text-fg-dim px-4 py-6 text-center">No results for "{query}"</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
