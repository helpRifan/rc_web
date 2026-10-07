import type { Metadata } from 'next';
import Link from 'next/link';
import { STATUS_OPTIONS } from '@/components/admin/EventFields';
import { AdminHeader, BUTTON_LINK, TABLE } from '@/components/admin/fields';
import { adminEvents } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { formatDay } from '@/lib/dates';

export const metadata: Metadata = { title: 'Events' };

const statusLabel = (status: string) => STATUS_OPTIONS.find(o => o.value === status)?.label ?? status;

export default async function AdminEventsPage({ searchParams }: PageProps<'/admin/events'>) {
  await requireAdmin();
  const [events, { deleted }] = await Promise.all([adminEvents(), searchParams]);
  return (
    <section className="py-12">
      <AdminHeader title="Events">
        <Link href="/admin/events/new" className={BUTTON_LINK}>
          New event
        </Link>
      </AdminHeader>
      {deleted && (
        <p role="status" className="mt-4 text-rc-muted">
          Event deleted.
        </p>
      )}
      {events.length ? (
        <table className={TABLE}>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
              <th scope="col">Public</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>
                  <Link href={`/admin/events/${event.id}`} className="font-semibold text-rc-ink underline decoration-rc-accent decoration-2 underline-offset-4 hover:decoration-rc-ink">
                    {event.title}
                  </Link>
                  {event.series && <span className="block text-[15px] text-rc-muted">{event.series}</span>}
                </td>
                <td className="text-rc-text">{statusLabel(event.status)}</td>
                <td className="text-rc-text">{event.starts_on ? formatDay(event.starts_on) : (event.date_label ?? 'Not set')}</td>
                <td className="text-rc-text">{event.is_published ? 'Published' : 'Hidden'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-8 text-rc-text">No events yet. Create the first one.</p>
      )}
    </section>
  );
}
