import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AdminHeader, BUTTON_LINK } from '@/components/admin/fields';
import { adminPhotos } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';

export const metadata: Metadata = { title: 'Gallery' };

export default async function AdminGalleryPage({ searchParams }: PageProps<'/admin/gallery'>) {
  await requireAdmin();
  const [photos, { deleted }] = await Promise.all([adminPhotos(), searchParams]);
  return (
    <section className="py-12">
      <AdminHeader title="Gallery">
        <Link href="/admin/gallery/new" className={BUTTON_LINK}>
          Add a photo
        </Link>
      </AdminHeader>
      {deleted && (
        <p role="status" className="mt-4 text-rc-muted">
          Photo removed.
        </p>
      )}
      {photos.length ? (
        <ul role="list" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map(photo => (
            <li key={photo.id}>
              <Link href={`/admin/gallery/${photo.id}`} className="group block">
                <span className="relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-rc-surface">
                  <Image src={photo.image_url} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
                </span>
                <span className="mt-3 block font-semibold text-rc-ink underline decoration-rc-accent decoration-2 underline-offset-4 group-hover:decoration-rc-ink">
                  {photo.caption ?? 'No caption yet'}
                </span>
                <span className="mt-1 block text-[15px] text-rc-muted">
                  {[photo.is_published ? 'Published' : 'Hidden', photo.event?.title, `order ${photo.sort_order}`].filter(Boolean).join(', ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-rc-text">No photos yet. Add the first one.</p>
      )}
    </section>
  );
}
