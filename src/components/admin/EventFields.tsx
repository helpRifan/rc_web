import type { AdminEvent } from '@/lib/admin/data';
import { CheckboxField, SelectField, TextArea, TextField } from './fields';

export const STATUS_OPTIONS = [
  { value: 'coming_soon', label: 'Coming soon' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'registration_open', label: 'Registration open' },
  { value: 'completed', label: 'Completed' },
] as const;

/** Every editable field of an event, for the new and edit pages. */
export function EventFields({ event }: { event?: AdminEvent | null }) {
  return (
    <div className="grid max-w-3xl gap-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      <TextField name="title" label="Title" defaultValue={event?.title} required maxLength={120} />
      <TextField name="slug" label="Web address" defaultValue={event?.slug} required hint="Lower-case words joined by hyphens: robo-sumo gives /events/robo-sumo. Changing it breaks links already shared." />
      <TextField name="series" label="Series" defaultValue={event?.series} maxLength={60} hint="For example TechnoVIT '27. Leave empty for a one-off." />
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField name="status" label="Status" defaultValue={event?.status ?? 'coming_soon'} options={STATUS_OPTIONS} />
        <TextField name="starts_on" label="Date" type="date" defaultValue={event?.starts_on} hint="Leave empty if it isn't fixed yet." />
      </div>
      <TextField name="date_label" label="Date label" defaultValue={event?.date_label} maxLength={60} hint="Shown when there's no date, like “March 2027”." />
      <TextField name="summary" label="Summary" defaultValue={event?.summary} maxLength={160} hint="One or two sentences, 160 characters at most. Shown in lists." />
      <TextArea name="description" label="Description" rows={8} defaultValue={event?.description} maxLength={5000} hint="Paragraphs, lists (- item), **bold**, *italic* and [links](https://…) work." />
      <TextField name="category" label="Category" defaultValue={event?.category} maxLength={60} />
      <TextField name="cover_url" label="Cover image" type="url" defaultValue={event?.cover_url} hint="An https:// address on ImageKit, 16:9 if you can." />
      <TextField name="registration_url" label="Registration link" type="url" defaultValue={event?.registration_url} hint="Leave empty to send people to VIT Event Hub." />
      <TextField name="recap_url" label="Recap link" type="url" defaultValue={event?.recap_url} />
      <CheckboxField name="is_published" label="Published" defaultChecked={event?.is_published ?? false} hint="Unpublished events are hidden from every public page." />
    </div>
  );
}
