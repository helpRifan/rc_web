import Link from 'next/link';
import { adminCounts } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { emailReady } from '@/lib/email/send';

export default async function AdminHomePage() {
  // Every admin page checks for itself: the layout's check doesn't guard what a page renders.
  await requireAdmin();
  const counts = await adminCounts();
  const sections = [
    { href: '/admin/events', title: 'Events', line: `${counts.eventsPublished} of ${counts.events} published` },
    { href: '/admin/gallery', title: 'Gallery', line: `${counts.photosPublished} of ${counts.photos} photos published` },
    { href: '/admin/members', title: 'Members', line: `${counts.membersPublished} of ${counts.members} published` },
    { href: '/admin/partners', title: 'Partners', line: `${counts.partners} in all` },
    { href: '/admin/waitlist', title: 'Waitlist', line: counts.waitlist === 1 ? '1 person' : `${counts.waitlist} people` },
    { href: '/admin/settings', title: 'Settings', line: 'Recruitment and the division sentences' },
  ];
  return (
    <section className="py-12">
      <h1 className="type-display text-rc-ink">Admin</h1>
      <ul role="list" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(section => (
          <li key={section.href}>
            <Link href={section.href} className="block rounded-2xl bg-rc-surface p-6 transition-colors hover:bg-[rgba(191,199,206,0.09)]">
              <span className="block text-xl font-bold text-rc-ink [font-stretch:110%]">{section.title}</span>
              <span className="mt-2 block text-rc-muted">{section.line}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12 max-w-[60ch] space-y-3 text-rc-text">
        <p>{counts.certificates === 1 ? '1 certificate is' : `${counts.certificates} certificates are`} in the database. Certificates come in through the import script.</p>
        <p>
          {emailReady()
            ? 'Email is on: “Find my certificates” sends links.'
            : 'Email is off: “Find my certificates” says lookup opens soon. It turns on once the sending domain is verified and EMAIL_ENABLED=1 is set with the Resend key.'}
        </p>
      </div>
    </section>
  );
}
