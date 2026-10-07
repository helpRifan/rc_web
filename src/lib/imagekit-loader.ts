// next/image loader (next.config.ts images.loaderFile). ImageKit resizes and picks the format, so
// photos never go through Vercel's optimiser. Local files (the logo, the Lanyard assets) pass
// through unchanged. An existing `tr` transform (a crop, say) is kept and the resize is chained.
type LoaderArgs = { src: string; width: number; quality?: number };

export default function imagekitLoader({ src, width, quality }: LoaderArgs): string {
  if (!src.startsWith('https://ik.imagekit.io/')) return src;
  const url = new URL(src);
  const resize = `w-${width},q-${quality ?? 75}`;
  const existing = url.searchParams.get('tr');
  url.searchParams.set('tr', existing ? `${existing}:${resize}` : resize);
  return url.toString();
}
