import { describe, expect, it } from 'vitest';
import { glyphField, glyphOn, glyphSquares, hashSeed } from './glyph-print';

describe('glyphField', () => {
  it('gives the same field for the same seed', () => {
    expect(glyphField('grace', 12, 10)).toEqual(glyphField('grace', 12, 10));
  });

  it('gives different fields for different slugs', () => {
    expect(glyphField('grace', 12, 10)).not.toEqual(glyphField('ihsan', 12, 10));
  });

  it('stays between 0 and 1, and is brighter towards the top-right corner on average', () => {
    let topRight = 0;
    let bottomLeft = 0;
    for (const slug of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      const field = glyphField(slug, 12, 12);
      for (const value of field) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
      topRight += field[0 * 12 + 11] + field[1 * 12 + 10];
      bottomLeft += field[11 * 12 + 0] + field[10 * 12 + 1];
    }
    expect(topRight).toBeGreaterThan(bottomLeft);
  });
});

describe('glyphOn', () => {
  it('follows the shader rule', () => {
    expect(glyphOn(0.5, 0, 0)).toBe(true);
    expect(glyphOn(0.2, 2, 2)).toBe(false);
    expect(glyphOn(0.11, 0, 0)).toBe(true);
    expect(glyphOn(0.1, 0, 0)).toBe(false);
  });
});

describe('glyphSquares', () => {
  it('keeps every square inside the area', () => {
    const squares = glyphSquares('vinayak', 12, 240, 200);
    expect(squares.length).toBeGreaterThan(0);
    for (const [x, y, size] of squares) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + size).toBeLessThanOrEqual(240 + 1e-9);
      expect(y).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('hashSeed', () => {
  it('is FNV-1a', () => {
    expect(hashSeed('')).toBe(0x811c9dc5);
    expect(hashSeed('a')).toBe(0xe40c292c);
  });
});
