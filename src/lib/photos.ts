// Shared photo rules: alt text, accessible names and ImageKit transforms. Pure, so the gallery,
// the home strip, the event pages and the viewer all say the same thing.
type NamedPhoto = { caption: string | null; event: { title: string } | null };

/** Alt text: the caption, else the event, else a plain fallback. Never invented. */
export function altText(photo: NamedPhoto): string {
  if (photo.caption) return photo.caption;
  if (photo.event) return `Photo from ${photo.event.title}`;
  return 'Robotics Club photo';
}

/** The accessible name of a control that opens a photo. */
export function openLabel(photo: NamedPhoto): string {
  if (photo.caption) return `Open photo: ${photo.caption}`;
  if (photo.event) return `Open photo from ${photo.event.title}`;
  return 'Open photo';
}

/** Adds an ImageKit transform, chained after any transform the URL already has (a crop, say). */
export function ik(url: string, tr: string): string {
  if (!url.startsWith('https://ik.imagekit.io/')) return url;
  const parsed = new URL(url);
  const existing = parsed.searchParams.get('tr');
  parsed.searchParams.set('tr', existing ? `${existing}:${tr}` : tr);
  return parsed.toString();
}

/** Width over height, falling back to 3:2 when the size isn't stored. */
export function aspectOf(photo: { width: number | null; height: number | null }): number {
  return photo.width && photo.height ? photo.width / photo.height : 1.5;
}
