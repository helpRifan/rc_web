import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { ActionForm } from '@/components/admin/ActionForm';
import { AdminHeader, CheckboxField, SelectField, TextArea, TextField } from '@/components/admin/fields';
import { adminMember } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { DIVISIONS } from '@/lib/divisions';
import { saveMember } from '../actions';

export const metadata: Metadata = { title: 'Edit member' };

const LEVELS = [
  { value: 'board', label: 'Board' },
  { value: 'head', label: 'Head' },
  { value: 'lead', label: 'Lead' },
  { value: 'core', label: 'Core team' },
  { value: 'member', label: 'Member (not listed on Team)' },
  { value: 'faculty', label: 'Faculty' },
] as const;
const DIVISION_OPTIONS = [...DIVISIONS.map(d => ({ value: d.id, label: d.label })), { value: 'alumni', label: 'Alumni' }, { value: 'none', label: 'None (Board, faculty)' }];

export default async function EditMemberPage({ params }: PageProps<'/admin/members/[id]'>) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const member = await adminMember(id);
  if (!member) notFound();
  return (
    <section className="py-12">
      <Link href="/admin/members" className="text-link">
        All members
      </Link>
      <div className="mt-6">
        <AdminHeader title={member.full_name}>
          {member.is_published && (
            <Link href={`/team/${member.slug}`} className="text-link">
              View the profile
            </Link>
          )}
        </AdminHeader>
      </div>
      <ActionForm action={saveMember} className="mt-8">
        <input type="hidden" name="id" value={member.id} />
        <div className="grid max-w-3xl gap-6">
          <TextField name="full_name" label="Name" defaultValue={member.full_name} required maxLength={80} />
          <TextField name="role_title" label="Role" defaultValue={member.role_title} maxLength={60} />
          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField name="level" label="Level" defaultValue={member.level} options={LEVELS} />
            <SelectField name="division" label="Division" defaultValue={member.division} options={DIVISION_OPTIONS} />
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <TextField name="year_of_study" label="Year of study" defaultValue={member.year_of_study} maxLength={40} />
            <TextField name="degree" label="Degree" defaultValue={member.degree} maxLength={80} />
            <TextField name="joined_year" label="Year joined" type="number" defaultValue={member.joined_year} />
          </div>
          <TextArea name="about" label="About" defaultValue={member.about} maxLength={300} hint="300 characters at most." />
          <TextField name="currently_building" label="Currently building" defaultValue={member.currently_building} maxLength={80} />
          <TextField name="fun_fact" label="Fun fact" defaultValue={member.fun_fact} maxLength={100} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField name="github_url" label="GitHub" type="url" defaultValue={member.github_url} />
            <TextField name="linkedin_url" label="LinkedIn" type="url" defaultValue={member.linkedin_url} />
            <TextField name="instagram_url" label="Instagram" type="url" defaultValue={member.instagram_url} />
            <TextField name="portfolio_url" label="Portfolio" type="url" defaultValue={member.portfolio_url} />
          </div>
          <TextField name="sort_order" label="Order" type="number" defaultValue={member.sort_order} hint="Lower numbers come first within the same level." />
          <CheckboxField name="is_published" label="Published" defaultChecked={member.is_published} hint="Publish only members who agreed to be shown." />
        </div>
      </ActionForm>
    </section>
  );
}
