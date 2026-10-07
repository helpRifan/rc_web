import type { AdminPartner } from '@/lib/admin/data';
import { CheckboxField, TextArea, TextField } from './fields';

export function PartnerFields({ partner }: { partner?: AdminPartner | null }) {
  return (
    <div className="grid max-w-3xl gap-6">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <TextField name="name" label="Name" defaultValue={partner?.name} required maxLength={80} />
      <TextField name="website_url" label="Website" type="url" defaultValue={partner?.website_url} />
      <TextField name="logo_url" label="Logo" type="url" defaultValue={partner?.logo_url} hint="A transparent SVG or PNG on ImageKit. The site shows it as a white silhouette; any other format shows the name instead." />
      <TextArea name="relationship" label="How they work with us" rows={2} defaultValue={partner?.relationship} maxLength={140} hint="One true sentence, 140 characters at most." />
      <TextField name="sort_order" label="Order" type="number" defaultValue={partner?.sort_order ?? 0} />
      <CheckboxField name="is_published" label="Published" defaultChecked={partner?.is_published ?? false} hint="The Partners page and its menu item appear once any partner is published." />
    </div>
  );
}
