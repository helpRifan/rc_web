import { describe, expect, it } from 'vitest';
import { altText, aspectOf, ik, openLabel } from './photos';

describe('photo names', () => {
  it('falls back from caption to event to a plain name', () => {
    expect(altText({ caption: 'Students soldering.', event: null })).toBe('Students soldering.');
    expect(altText({ caption: null, event: { title: 'Robo Sumo' } })).toBe('Photo from Robo Sumo');
    expect(altText({ caption: null, event: null })).toBe('Robotics Club photo');
    expect(openLabel({ caption: 'Students soldering.', event: null })).toBe('Open photo: Students soldering.');
    expect(openLabel({ caption: null, event: { title: 'Robo Sumo' } })).toBe('Open photo from Robo Sumo');
    expect(openLabel({ caption: null, event: null })).toBe('Open photo');
  });
});

describe('ik', () => {
  it('adds a transform, or chains after an existing crop', () => {
    expect(new URL(ik('https://ik.imagekit.io/Rifan/x.jpg', 'w-360,h-360')).searchParams.get('tr')).toBe('w-360,h-360');
    const cropped = 'https://ik.imagekit.io/Rifan/6.jpg?tr=cm-extract,x-0,y-250,w-589,h-780';
    expect(new URL(ik(cropped, 'w-360')).searchParams.get('tr')).toBe('cm-extract,x-0,y-250,w-589,h-780:w-360');
  });

  it('leaves other hosts alone', () => {
    expect(ik('/logo.png', 'w-10')).toBe('/logo.png');
  });

  it('falls back to 3:2 without a stored size', () => {
    expect(aspectOf({ width: 1600, height: 1200 })).toBeCloseTo(4 / 3);
    expect(aspectOf({ width: null, height: 1200 })).toBe(1.5);
  });
});
