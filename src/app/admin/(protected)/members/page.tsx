import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminHeader, TABLE } from '@/components/admin/fields';
import { adminMembers } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { divisionLabel } from '@/lib/divisions';

export const metadata: Metadata = { title: 'Members' };

const LEVELS: Record<string, string> = { faculty: 'Faculty', board: 'Board', head: 'Head', lead: 'Lead', core: 'Core', member: 'Member' };

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await adminMembers();
  return (
    <section className="py-12">
      <AdminHeader title="Members" />
      <p className="mt-4 max-w-[60ch] text-rc-text">
        New members and photos come from the Google Form, through the member import. Here you can correct text, publish and set the order.
      </p>
      {members.length ? (
        <table className={TABLE}>
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Level</th>
              <th scope="col">Division</th>
              <th scope="col">Public</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td>
                  <Link href={`/admin/members/${member.id}`} className="font-semibold text-rc-ink underline decoration-rc-accent decoration-2 underline-offset-4 hover:decoration-rc-ink">
                    {member.full_name}
                  </Link>
                  {member.role_title && <span className="block text-[15px] text-rc-muted">{member.role_title}</span>}
                </td>
                <td className="text-rc-text">{LEVELS[member.level] ?? member.level}</td>
                <td className="text-rc-text">{divisionLabel(member.division) ?? (member.division === 'alumni' ? 'Alumni' : 'None')}</td>
                <td className="text-rc-text">{member.is_published ? 'Published' : 'Hidden'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-8 text-rc-text">No members yet. Run the member import.</p>
      )}
    </section>
  );
}
