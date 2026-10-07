import type { Metadata } from 'next';
import { ButtonLink } from '@/components/site/ButtonLink';
import { GalleryView } from '@/components/site/gallery/GalleryView';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { getGallery } from '@/lib/data/gallery';
import { safe } from '@/lib/data/safe';
import { SITE } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from Robotics Club workshops, competitions and events at VIT Chennai.',
};

/** Five or more photos get the dome; one to four get a large grid; none get a way to Instagram. */
export default async function GalleryPage() {
  const photos = await safe('gallery', () => getGallery(), []);

  if (photos.length === 0) {
    return (
      <section aria-labelledby="gallery-title" className="site-gutter pb-20 pt-28 sm:pb-24 lg:pb-28">
        <ScrambleHeading as="h1" id="gallery-title" text="The club in photos" className="type-display max-w-[14ch] text-balance text-rc-ink" />
        <p className="mt-6 max-w-[34em] text-lg text-rc-text">There are no photos here yet. You can find the club on Instagram in the meantime.</p>
        <div className="mt-9">
          <ButtonLink href={SITE.instagram} variant="secondary" target="_blank" rel="noopener noreferrer">
            See the club on Instagram
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
        </div>
      </section>
    );
  }

  return <GalleryView photos={photos} mode={photos.length >= 5 ? 'dome' : 'grid'} />;
}
