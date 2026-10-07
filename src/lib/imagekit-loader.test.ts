import { describe, expect, it } from 'vitest';
import imagekitLoader from './imagekit-loader';

describe('imagekitLoader', () => {
  it('asks ImageKit for the width and quality', () => {
    expect(imagekitLoader({ src: 'https://ik.imagekit.io/Rifan/robotics-club/gallery/5.jpg', width: 640, quality: 80 })).toBe(
      'https://ik.imagekit.io/Rifan/robotics-club/gallery/5.jpg?tr=w-640%2Cq-80',
    );
  });

  it('chains the resize after an existing transform', () => {
    const src = 'https://ik.imagekit.io/Rifan/robotics-club/gallery/6.jpg?tr=cm-extract,x-0,y-250,w-589,h-780';
    const out = new URL(imagekitLoader({ src, width: 384 }));
    expect(out.searchParams.get('tr')).toBe('cm-extract,x-0,y-250,w-589,h-780:w-384,q-75');
  });

  it('leaves local files alone', () => {
    expect(imagekitLoader({ src: '/logo.png', width: 64 })).toBe('/logo.png');
  });
});
