import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ActionForm } from '@/components/admin/ActionForm';
import { AdminHeader } from '@/components/admin/fields';
import { PartnerFields } from '@/components/admin/PartnerFields';
import { adminPartner } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { deletePartner, savePartner } from '../actions';

export const metadata: Metadata = { title: 'Edit partner' };

export default async function EditPartnerPage({ params, searchParams }: PageProps<'/admin/partners/[id]'>) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const partner = await adminPartner(id);
  if (!partner) notFound();
  return (
    <section className="py-12">
      <Link href="/admin/partners" className="text-link">
        All partners
      </Link>
      <div className="mt-6">
        <AdminHeader title={partner.name} />
      </div>
      {created && (
        <p role="status" className="mt-4 text-rc-muted">
          Partner created.
        </p>
      )}
      <ActionForm action={savePartner} className="mt-8">
        <PartnerFields partner={partner} />
      </ActionForm>
      <div className="mt-16 max-w-3xl border-t border-rc-line pt-10">
        <h2 className="type-ui text-[17px] text-rc-ink">Remove this partner</h2>
        <ActionForm action={deletePartner} submitLabel="Remove partner" pendingLabel="Removing…" destructive confirm={`Remove ${partner.name}? This can’t be undone.`}>
          <input type="hidden" name="id" value={partner.id} />
        </ActionForm>
      </div>
    </section>
  );
}
