import Image from 'next/image';
import type { AdminEvent, AdminPhoto } from '@/lib/admin/data';
import { CheckboxField, SelectField, TextArea, TextField } from './fields';

/** A gallery photo's fields. The address is set when the photo is added and shown after. */
export function PhotoFields({ photo, events }: { photo?: AdminPhoto | null; events: Pick<AdminEvent, 'id' | 'title' | 'series'>[] }) {
  const eventOptions = [{ value: '', label: 'No event' }, ...events.map(e => ({ value: e.id, label: e.series ? `${e.title} (${e.series})` : e.title }))];
  return (
    <div className="grid max-w-3xl gap-6">
      {photo ? (
        <>
          <input type="hidden" name="id" value={photo.id} />
          <input type="hidden" name="image_url" value={photo.image_url} />
          <div className="relative aspect-[3/2] w-full max-w-md overflow-hidden rounded-[10px] bg-rc-surface">
            <Image src={photo.image_url} alt={photo.caption ?? 'This photo'} fill sizes="448px" className="object-cover" />
          </div>
        </>
      ) : (
        <TextField name="image_url" label="Photo address" type="url" required hint="The photo's https://ik.imagekit.io/… address. Upload it to ImageKit first, in the gallery folder." />
      )}
      <TextArea name="caption" label="Caption" rows={2} defaultValue={photo?.caption} maxLength={200} hint="What's in the photo, in one plain sentence. It's also the photo's description for screen readers." />
      <SelectField name="event_id" label="Event" defaultValue={photo?.event_id} options={eventOptions} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField name="taken_on" label="Date taken" type="date" defaultValue={photo?.taken_on} />
        <TextField name="sort_order" label="Order" type="number" defaultValue={photo?.sort_order ?? 0} hint="Lower numbers come first." />
      </div>
      <CheckboxField name="is_published" label="Published" defaultChecked={photo?.is_published ?? false} hint="Publish once the caption is written." />
    </div>
  );
}
