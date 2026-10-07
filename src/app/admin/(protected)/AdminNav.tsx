'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/waitlist', label: 'Waitlist' },
] as const;

/** The dashboard is current only on /admin itself; a section stays current on its sub-pages. */
const current = (pathname: string, href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex flex-wrap gap-x-6">
        {ITEMS.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current(pathname, item.href) ? 'page' : undefined}
              className="inline-flex min-h-11 items-center font-medium text-rc-muted transition-colors hover:text-rc-ink aria-[current=page]:text-rc-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
