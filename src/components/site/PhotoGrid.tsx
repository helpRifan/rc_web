'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { PhotoViewer, type ViewerOrigin, type ViewerPhoto } from '@/components/site/gallery/PhotoViewer';
import { altText, ik, openLabel } from '@/lib/photos';

type Props = {
  photos: ViewerPhoto[];
  /** stagger: the home film-strip rhythm (middle column lower); even: a plain grid. */
  variant: 'stagger' | 'even';
  showEventLink?: boolean;
};

/**
 * Photos in uniform 3:2 frames (ImageKit picks the crop), each opening the photo viewer in place.
 * Without JavaScript each is a link to the photo in the gallery.
 */
export function PhotoGrid({ photos, variant, showEventLink = true }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState<ViewerOrigin | null>(null);
  const finalFocus = useRef<HTMLElement | null>(null);
  if (!photos.length) return null;

  const columns = photos.length === 1 ? 'grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3';
  return (
    <>
      <ul role="list" className={`grid gap-x-4 gap-y-8 lg:gap-x-6 ${columns} ${variant === 'stagger' && photos.length >= 3 ? 'photo-stagger pb-16' : ''}`}>
        {photos.map((photo, i) => (
          <li key={photo.id}>
            <a
              href={`/gallery?photo=${photo.id}`}
              aria-label={openLabel(photo)}
              onClick={event => {
                event.preventDefault();
                const frame = event.currentTarget.querySelector('span');
                finalFocus.current = event.currentTarget;
                setOrigin(frame ? { rect: frame.getBoundingClientRect(), tone: 'colour', el: frame } : null);
                setIndex(i);
              }}
              className="group block"
            >
              <span className="relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-rc-surface">
                <Image
                  src={ik(photo.image_url, 'w-1500,ar-3-2,fo-auto')}
                  alt={altText(photo)}
                  fill
                  sizes="(min-width: 1024px) 26vw, 46vw"
                  className="object-cover"
                />
              </span>
              {photo.caption && <span className="mt-3 line-clamp-2 text-[14px] text-rc-muted transition-colors group-hover:text-rc-text sm:text-[15px]">{photo.caption}</span>}
            </a>
          </li>
        ))}
      </ul>
      <PhotoViewer photos={photos} index={index} onIndexChange={setIndex} origin={origin} showEventLink={showEventLink} finalFocus={finalFocus} />
    </>
  );
}
