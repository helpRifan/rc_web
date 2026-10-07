import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizeName } from './normalize';
import { CROCKFORD, generatePublicId, parsePublicId, PUBLIC_ID } from './public-id';

describe('generatePublicId', () => {
  it('matches the database check and never uses I, L, O or U', () => {
    for (let i = 0; i < 200; i++) {
      const id = generatePublicId(2026);
      expect(id).toMatch(PUBLIC_ID);
      expect(id.slice(5)).not.toMatch(/[ILOU]/);
    }
  });

  it('puts the two-digit year first', () => {
    expect(generatePublicId(2026).startsWith('RC26-')).toBe(true);
    expect(generatePublicId(2031).startsWith('RC31-')).toBe(true);
  });

  it('gives 10,000 different IDs', () => {
    const ids = new Set(Array.from({ length: 10_000 }, () => generatePublicId(2026)));
    expect(ids.size).toBe(10_000);
  });

  it('maps each random byte to one of the 32 symbols', () => {
    expect(generatePublicId(2026, () => Uint8Array.from([0, 31, 32, 255, 1, 2, 3, 4, 5, 6]))).toBe(`RC26-0${CROCKFORD[31]}0Z123456`);
  });
});

describe('parsePublicId', () => {
  it.each([
    ['RC26-7KQ2M9XH4D', 'RC26-7KQ2M9XH4D'],
    ['  rc26-7kq2m9xh4d ', 'RC26-7KQ2M9XH4D'],
    ['https://robotics.example/certificates/RC26-7KQ2M9XH4D', 'RC26-7KQ2M9XH4D'],
    ['https://robotics.example/certificates/RC26-7KQ2M9XH4D/', 'RC26-7KQ2M9XH4D'],
    ['https://robotics.example/certificates/RC26-7KQ2M9XH4D?utm=x', 'RC26-7KQ2M9XH4D'],
    ['RC26-7KQ2M9XHOD', 'RC26-7KQ2M9XH0D'],
    ['RC26-7KQ2M9XHLD', 'RC26-7KQ2M9XH1D'],
  ])('%s gives %s', (input, id) => {
    expect(parsePublicId(input)).toBe(id);
  });

  it.each(['', 'hello', 'RC26-7KQ2M9XH4', 'RC26-7KQ2M9XH4DD', 'RC26-7KQ2M9XHUD', 'XX26-7KQ2M9XH4D'])('refuses %j', input => {
    expect(parsePublicId(input)).toBeNull();
  });
});

describe('normalizeName', () => {
  it('folds case, width and whitespace', () => {
    expect(normalizeName('  Test   PERSON ')).toBe('test person');
    expect(normalizeName('Ｔｅｓｔ')).toBe('test');
  });

  it('normalises emails to lower case', () => {
    expect(normalizeEmail(' Lead@Example.COM ')).toBe('lead@example.com');
  });
});
