import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ActionForm } from '@/components/admin/ActionForm';
import { AdminHeader } from '@/components/admin/fields';
import { PhotoFields } from '@/components/admin/PhotoFields';
import { adminEvents, adminPhoto } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { deletePhoto, savePhoto } from '../actions';

export const metadata: Metadata = { title: 'Edit photo' };

export default async function EditPhotoPage({ params, searchParams }: PageProps<'/admin/gallery/[id]'>) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const [photo, events] = await Promise.all([adminPhoto(id), adminEvents()]);
  if (!photo) notFound();
  return (
    <section className="py-12">
      <Link href="/admin/gallery" className="text-link">
        All photos
      </Link>
      <div className="mt-6">
        <AdminHeader title="Edit photo" />
      </div>
      {created && (
        <p role="status" className="mt-4 text-rc-muted">
          Photo added. Write its caption, then publish it.
        </p>
      )}
      <ActionForm action={savePhoto} className="mt-8">
        <PhotoFields photo={photo} events={events} />
      </ActionForm>
      <div className="mt-16 max-w-3xl border-t border-rc-line pt-10">
        <h2 className="type-ui text-[17px] text-rc-ink">Remove this photo</h2>
        <ActionForm action={deletePhoto} submitLabel="Remove photo" pendingLabel="Removing…" destructive confirm="Remove this photo from the gallery?">
          <input type="hidden" name="id" value={photo.id} />
          <p className="mt-2 text-rc-muted">It leaves the gallery; the file stays on ImageKit.</p>
        </ActionForm>
      </div>
    </section>
  );
}
