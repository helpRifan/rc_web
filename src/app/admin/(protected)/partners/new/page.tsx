import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionForm } from '@/components/admin/ActionForm';
import { AdminHeader } from '@/components/admin/fields';
import { PartnerFields } from '@/components/admin/PartnerFields';
import { requireAdmin } from '@/lib/auth/admin';
import { savePartner } from '../actions';

export const metadata: Metadata = { title: 'New partner' };

export default async function NewPartnerPage() {
  await requireAdmin();
  return (
    <section className="py-12">
      <Link href="/admin/partners" className="text-link">
        All partners
      </Link>
      <div className="mt-6">
        <AdminHeader title="New partner" />
      </div>
      <ActionForm action={savePartner} submitLabel="Create partner" pendingLabel="Creating…" className="mt-8">
        <PartnerFields />
      </ActionForm>
    </section>
  );
}
