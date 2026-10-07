import type { PublicPhoto } from '@/lib/data/types';
import { PhotoWall } from './PhotoWall';

/** The newest photos on a drifting wall, each opening the viewer. Nothing renders without photos. */
export function LatestPhotos({ photos }: { photos: PublicPhoto[] }) {
  if (!photos.length) return null;
  return (
    <section aria-labelledby="home-photos" className="site-gutter overflow-x-clip py-20 sm:py-24 lg:py-28">
      <PhotoWall photos={photos} />
    </section>
  );
}
