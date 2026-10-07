import type { Metadata } from 'next';
import { AdminHeader, BUTTON_LINK, TABLE } from '@/components/admin/fields';
import { adminWaitlist } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { formatDay } from '@/lib/dates';

export const metadata: Metadata = { title: 'Waitlist' };

export default async function AdminWaitlistPage() {
  await requireAdmin();
  const rows = await adminWaitlist();
  return (
    <section className="py-12">
      <AdminHeader title="Waitlist">
        {rows.length > 0 && (
          // A plain link: the export is a file download, not a page.
          <a href="/api/admin/waitlist/export" className={BUTTON_LINK}>
            Download CSV
          </a>
        )}
      </AdminHeader>
      <p className="mt-4 text-rc-text">
        {rows.length === 1 ? '1 person is' : `${rows.length} people are`} waiting to hear when recruitment opens. Their emails are private: use them only for that.
      </p>
      {rows.length > 0 && (
        <table className={TABLE}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Joined the list</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.email}>
                <td className="text-rc-ink">{row.full_name}</td>
                <td className="break-all text-rc-text">{row.email}</td>
                <td className="text-rc-text">{formatDay(row.created_at.slice(0, 10))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
