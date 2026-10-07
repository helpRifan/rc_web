import { describe, expect, it } from 'vitest';
import { resolveFieldMode } from './use-field-mode';

describe('resolveFieldMode', () => {
  it('shows the poster when WebGL is unavailable, whatever the motion setting', () => {
    expect(resolveFieldMode({ webgl: false, reducedMotion: false })).toBe('poster');
    expect(resolveFieldMode({ webgl: false, reducedMotion: true })).toBe('poster');
  });
  it('renders a still frame under reduced motion', () => {
    expect(resolveFieldMode({ webgl: true, reducedMotion: true })).toBe('still');
  });
  it('animates otherwise', () => {
    expect(resolveFieldMode({ webgl: true, reducedMotion: false })).toBe('webgl');
  });
});
