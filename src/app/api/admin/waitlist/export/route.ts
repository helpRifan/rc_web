import { adminWaitlist } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { toCsv } from '@/lib/csv';

/** GET /api/admin/waitlist/export: the waitlist as a CSV file, for admins only (spec 8). */
export async function GET() {
  await requireAdmin();
  const rows = await adminWaitlist();
  const csv = toCsv(
    ['Name', 'Email', 'Source', 'Joined the list'],
    rows.map(row => [row.full_name, row.email, row.source, row.created_at.slice(0, 10)]),
  );
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
