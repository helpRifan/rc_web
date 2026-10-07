import Link from 'next/link';
import { SITE } from '@/lib/site';

const LINK = 'inline-flex min-h-11 items-center hover:text-rc-ink';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-rc-line">
      <div className="site-gutter flex flex-col gap-4 py-10 text-rc-muted sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link className={LINK} href="/about">
              About the club
            </Link>
          </li>
          <li>
            <a className={LINK} href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </li>
          <li>
            <a className={LINK} href={SITE.instagram} rel="noopener noreferrer" target="_blank">
              Instagram<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a className={LINK} href={SITE.linkedin} rel="noopener noreferrer" target="_blank">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
        <p>© {year} {SITE.name}</p>
      </div>
    </footer>
  );
}
