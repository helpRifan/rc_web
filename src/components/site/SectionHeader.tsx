import Link from 'next/link';

type Props = {
  id: string;
  title: string;
  /** Shown beside the title from 640px; render <SectionLinkMobile> after the section's content for small screens. */
  link?: { href: string; label: string };
};

export function SectionHeader({ id, title, link }: Props) {
  return (
    <div className="flex items-end justify-between gap-x-8">
      <h2 id={id} className="type-section text-balance text-rc-ink">
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="text-link hidden shrink-0 sm:inline-flex">
          {link.label}
        </Link>
      )}
    </div>
  );
}

/** The section link under the content on small screens, so the heading row never wraps awkwardly. */
export function SectionLinkMobile({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-link mt-8 sm:hidden">
      {label}
    </Link>
  );
}
