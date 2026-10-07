import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site';

// A plain string title would reset the root template for every page below, leaving "Sign in"
// with no site name. "Admin" in the template also keeps admin tabs apart from public pages.
export const metadata: Metadata = {
  title: { default: `Admin | ${SITE.name}`, template: `%s | Admin | ${SITE.name}` },
  robots: { index: false, follow: false },
};

// Admin chrome: the logo and "Admin", no site nav. The logo goes back to the public site.
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-rc-bg focus:px-4 focus:py-3 focus:text-rc-ink">
        Skip to content
      </a>
      <header className="border-b border-rc-line">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-3 font-bold text-rc-muted transition-colors hover:text-rc-ink [font-stretch:112%]">
            <Image src="/logo.png" alt="" width={34} height={34} loading="eager" />
            <span>{SITE.shortName}</span>
          </Link>
          <span aria-hidden="true" className="h-5 border-l border-rc-line" />
          <span className="font-semibold text-rc-ink [font-stretch:104%]">Admin</span>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-8">
        {children}
      </main>
    </div>
  );
}
