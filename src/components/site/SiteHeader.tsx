'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { isActive, navItems, SITE } from '@/lib/site';

// md: the width where the desktop nav takes over from the menu button.
const DESKTOP_QUERY = '(min-width: 48rem)';

const LINK =
  'inline-flex items-center font-medium text-rc-muted transition-colors hover:text-rc-ink aria-[current=page]:text-rc-ink';

function onScroll(change: () => void) {
  window.addEventListener('scroll', change, { passive: true });
  return () => window.removeEventListener('scroll', change);
}

/** Whether the page has scrolled under the header; false on the server and at the top. */
const useScrolled = () => useSyncExternalStore(onScroll, () => window.scrollY > 12, () => false);

export function SiteHeader({ showPartners = false }: { showPartners?: boolean }) {
  const items = navItems(showPartners);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrolled = useScrolled();

  // Close the menu on navigation (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // While the menu is open it covers the page, so the page behind mustn't scroll. Escape closes it
  // and returns focus to the button; growing to the desktop nav closes it too.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onDesktop = (event: { matches: boolean }) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onDesktop);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [open]);

  return (
    // At the top of a page a soft fade is enough; once content scrolls under the header it gets a
    // solid, blurred bar, so headings never show through the logo and links.
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-[background-color,border-color] duration-200 ${open ? 'bg-rc-bg' : scrolled ? 'border-b border-rc-line/60 bg-rc-bg/85 backdrop-blur-md' : 'border-b border-transparent'}`}
    >
      {!scrolled && !open && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-rc-bg/90 via-rc-bg/60 to-transparent" />}
      <div className="site-gutter relative flex items-center justify-between gap-6 py-3">
        <Link href="/" className="inline-flex min-h-11 items-center gap-3 font-bold text-rc-muted transition-colors hover:text-rc-ink [font-stretch:112%]">
          <Image src="/logo.png" alt="" width={34} height={34} loading="eager" />
          <span>{SITE.shortName}</span>
        </Link>

        {/* px-2 on each link plus gap-2 keeps 24px between the words while every target is at least 44px wide. */}
        <nav aria-label="Main" className="-mr-2 hidden md:block">
          <ul className="flex items-center gap-2 text-[15px]">
            {items.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className={`${LINK} min-h-11 min-w-11 justify-center px-2`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="-mr-2 inline-flex size-11 items-center justify-center text-rc-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(value => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open && (
        // Fills the viewport under the 68px bar, so the page underneath never reads as part of the menu.
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="site-gutter fixed inset-x-0 top-17 bottom-0 overflow-y-auto overscroll-contain border-t border-rc-line bg-rc-bg pt-4 pb-10 md:hidden"
        >
          <ul className="flex flex-col text-lg">
            {items.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className={`${LINK} min-h-12 w-full`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
