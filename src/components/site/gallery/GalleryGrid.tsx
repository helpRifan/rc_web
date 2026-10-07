'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { altText, aspectOf, ik, openLabel } from '@/lib/photos';
import type { ViewerPhoto } from './PhotoViewer';

type Props = {
  photos: ViewerPhoto[];
  /** Larger rows for the 1-4 photo state. */
  large?: boolean;
  onOpen: (index: number, el: HTMLElement) => void;
};

/**
 * Justified rows: each photo keeps its own shape, nothing is cropped, and every row is flush to
 * both edges except the last. Items are real links to the full image, so they work without JS.
 */
export function GalleryGrid({ photos, large = false, onOpen }: Props) {
  return (
    <ul
      role="list"
      className={`flex flex-wrap gap-2 after:grow-[999] after:content-[''] ${large ? '[--row:210px] sm:[--row:280px] lg:[--row:340px]' : '[--row:150px] sm:[--row:200px] lg:[--row:240px]'}`}
    >
      {photos.map((photo, i) => {
        const ar = aspectOf(photo);
        const style = { flexGrow: ar, flexBasis: `calc(${ar} * var(--row))`, maxWidth: `calc(${ar} * var(--row) * 1.9)` } as CSSProperties;
        return (
          <li key={photo.id} style={style}>
            <a
              href={ik(photo.image_url, 'w-1600,q-82,f-auto')}
              aria-label={openLabel(photo)}
              onClick={event => {
                event.preventDefault();
                onOpen(i, event.currentTarget);
              }}
              className="block overflow-hidden rounded-[10px] bg-rc-surface"
            >
              <Image
                src={photo.image_url}
                alt={altText(photo)}
                width={photo.width ?? 1500}
                height={photo.height ?? 1000}
                sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
                style={{ aspectRatio: ar }}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
