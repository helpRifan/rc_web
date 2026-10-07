import type { Metadata } from 'next';
import { ActionForm } from '@/components/admin/ActionForm';
import { AdminHeader, CheckboxField, TextField } from '@/components/admin/fields';
import { adminSetting } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/auth/admin';
import { parseDivisionLines } from '@/lib/data/settings';
import { DIVISIONS } from '@/lib/divisions';
import { saveDivisionLines, saveRecruitment } from './actions';

export const metadata: Metadata = { title: 'Settings' };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [recruitment, divisions] = await Promise.all([adminSetting('recruitment'), adminSetting('divisions')]);
  const open = Boolean((recruitment as { open?: unknown } | null)?.open === true);
  const lines = parseDivisionLines(divisions);
  return (
    <section className="py-12">
      <AdminHeader title="Settings" />

      <section aria-labelledby="recruitment-title" className="mt-10 max-w-3xl">
        <h2 id="recruitment-title" className="type-ui text-[17px] text-rc-ink">
          Recruitment
        </h2>
        <ActionForm action={saveRecruitment} className="mt-4">
          <CheckboxField
            name="open"
            label="Recruitment is open"
            defaultChecked={open}
            hint="Open: the Join page invites people to apply. Closed: it collects emails for when it opens. The form is the same either way."
          />
        </ActionForm>
      </section>

      <section aria-labelledby="divisions-title" className="mt-16 max-w-3xl">
        <h2 id="divisions-title" className="type-ui text-[17px] text-rc-ink">
          What each division does
        </h2>
        <p className="mt-2 max-w-[60ch] text-rc-muted">
          One plain sentence each, 160 characters at most. Home lists the divisions that have one, and Team shows it above that division’s members. Leave a division empty to leave it out.
        </p>
        <ActionForm action={saveDivisionLines} className="mt-6">
          <div className="grid gap-6">
            {DIVISIONS.map(division => (
              <TextField key={division.id} name={division.id} label={division.label} defaultValue={lines[division.id]} maxLength={160} />
            ))}
          </div>
        </ActionForm>
      </section>
    </section>
  );
}
