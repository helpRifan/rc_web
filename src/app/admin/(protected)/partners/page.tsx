import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminHeader, BUTTON_LINK, TABLE } from '@/components/admin/fields';
import { adminPartners } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';

export const metadata: Metadata = { title: 'Partners' };

export default async function AdminPartnersPage({ searchParams }: PageProps<'/admin/partners'>) {
  await requireAdmin();
  const [partners, { deleted }] = await Promise.all([adminPartners(), searchParams]);
  return (
    <section className="py-12">
      <AdminHeader title="Partners">
        <Link href="/admin/partners/new" className={BUTTON_LINK}>
          New partner
        </Link>
      </AdminHeader>
      {deleted && (
        <p role="status" className="mt-4 text-rc-muted">
          Partner removed.
        </p>
      )}
      {partners.length ? (
        <table className={TABLE}>
          <thead>
            <tr>
              <th scope="col">Partner</th>
              <th scope="col">Order</th>
              <th scope="col">Public</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(partner => (
              <tr key={partner.id}>
                <td>
                  <Link href={`/admin/partners/${partner.id}`} className="font-semibold text-rc-ink underline decoration-rc-accent decoration-2 underline-offset-4 hover:decoration-rc-ink">
                    {partner.name}
                  </Link>
                </td>
                <td className="text-rc-text">{partner.sort_order}</td>
                <td className="text-rc-text">{partner.is_published ? 'Published' : 'Hidden'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-8 text-rc-text">No partners yet. The public Partners page stays hidden until one is published.</p>
      )}
    </section>
  );
}
