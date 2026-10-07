import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ActionForm } from '@/components/admin/ActionForm';
import { EventFields } from '@/components/admin/EventFields';
import { AdminHeader } from '@/components/admin/fields';
import { adminEvent, eventCertificateCount } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { deleteEvent, saveEvent } from '../actions';

export const metadata: Metadata = { title: 'Edit event' };

export default async function EditEventPage({ params, searchParams }: PageProps<'/admin/events/[id]'>) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const event = await adminEvent(id);
  if (!event) notFound();
  const certificates = await eventCertificateCount(id);
  return (
    <section className="py-12">
      <Link href="/admin/events" className="text-link">
        All events
      </Link>
      <div className="mt-6">
        <AdminHeader title={event.title}>
          {event.is_published && (
            <Link href={`/events/${event.slug}`} className="text-link">
              View the public page
            </Link>
          )}
        </AdminHeader>
      </div>
      {created && (
        <p role="status" className="mt-4 text-rc-muted">
          Event created.
        </p>
      )}
      <ActionForm action={saveEvent} className="mt-8">
        <EventFields event={event} />
      </ActionForm>

      <div className="mt-16 max-w-3xl border-t border-rc-line pt-10">
        <h2 className="type-ui text-[17px] text-rc-ink">Delete this event</h2>
        {certificates > 0 ? (
          <p className="mt-2 text-rc-muted">It has {certificates} certificates, so it can’t be deleted. Unpublish it instead.</p>
        ) : (
          <ActionForm action={deleteEvent} submitLabel="Delete event" pendingLabel="Deleting…" destructive confirm={`Delete “${event.title}”? This can’t be undone.`}>
            <input type="hidden" name="id" value={event.id} />
            <p className="mt-2 text-rc-muted">This removes the event and its page. Its photos stay in the gallery, unlinked.</p>
          </ActionForm>
        )}
      </div>
    </section>
  );
}
