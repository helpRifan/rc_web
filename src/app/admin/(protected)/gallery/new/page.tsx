import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm } from '@/components/admin/ActionForm';
import { AdminHeader } from '@/components/admin/fields';
import { PhotoFields } from '@/components/admin/PhotoFields';
import { adminEvents } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { savePhoto } from '../actions';

export const metadata: Metadata = { title: 'Add a photo' };

export default async function NewPhotoPage() {
  await requireAdmin();
  const events = await adminEvents();
  return (
    <section className="py-12">
      <Link href="/admin/gallery" className="text-link">
        All photos
      </Link>
      <div className="mt-6">
        <AdminHeader title="Add a photo" />
      </div>
      <ActionForm action={savePhoto} submitLabel="Add photo" pendingLabel="Adding…" className="mt-8">
        <PhotoFields events={events} />
      </ActionForm>
    </section>
  );
}
