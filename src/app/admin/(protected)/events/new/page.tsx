import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm } from '@/components/admin/ActionForm';
import { EventFields } from '@/components/admin/EventFields';
import { AdminHeader } from '@/components/admin/fields';
import { requireAdmin } from '@/lib/auth/admin';
import { saveEvent } from '../actions';

export const metadata: Metadata = { title: 'New event' };

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <section className="py-12">
      <Link href="/admin/events" className="text-link">
        All events
      </Link>
      <div className="mt-6">
        <AdminHeader title="New event" />
      </div>
      <ActionForm action={saveEvent} submitLabel="Create event" pendingLabel="Creating…" className="mt-8">
        <EventFields />
      </ActionForm>
    </section>
  );
}
