import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { EMAIL_PATTERN } from './email';
import { makeWaitlistSchema, waitlistErrors } from './waitlist';
import { checkWaitlist } from './waitlist-check';

const DOMAINS = ['vitstudent.ac.in', 'vit.ac.in'];
const schema = makeWaitlistSchema(DOMAINS);
const viaZod = (input: { fullName: string; email: string }) => {
  const parsed = schema.safeParse({ ...input, website: '' });
  return parsed.success ? {} : waitlistErrors(parsed.error);
};

const CASES = [
  { fullName: 'Test Person', email: 'test.person@vitstudent.ac.in' },
  { fullName: '  Test  ', email: ' TEST@VIT.AC.IN ' },
  { fullName: '', email: '' },
  { fullName: 'x'.repeat(81), email: 'a@vitstudent.ac.in' },
  { fullName: 'Test', email: 'not-an-email' },
  { fullName: 'Test', email: 'a@b' },
  { fullName: 'Test', email: 'test@gmail.com' },
  { fullName: 'Test', email: 'test@sub.vitstudent.ac.in' },
  { fullName: 'Test', email: 'te..st@vitstudent.ac.in' },
  { fullName: 'Test', email: `${'a'.repeat(250)}@vit.ac.in` },
  { fullName: 'Test', email: '.lead@vitstudent.ac.in' },
  { fullName: 'Test', email: "o'brien+club@vitstudent.ac.in" },
];

describe('checkWaitlist', () => {
  it.each(CASES)('agrees with the server schema for %o', input => {
    expect(checkWaitlist(input, DOMAINS)).toEqual(viaZod(input));
  });
});

describe('EMAIL_PATTERN', () => {
  it('is zod’s own email pattern', () => {
    for (const sample of ['a@b.co', 'a.b@c.de', 'a..b@c.de', '.a@b.co', 'a@b', 'a_b+c@d-e.fg', 'a@-b.co', "o'k@x.io"]) {
      expect(EMAIL_PATTERN.test(sample)).toBe(z.email().safeParse(sample).success);
    }
  });
});
