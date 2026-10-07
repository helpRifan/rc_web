import { isEmail } from './email';
import type { WaitlistErrorCode } from './waitlist';

/**
 * The browser's copy of the waitlist rules (makeWaitlistSchema), without zod, so the Join page
 * doesn't ship it. Same codes, same order; waitlist-check.test.ts proves they agree.
 */
export function checkWaitlist(input: { fullName: string; email: string }, domains: readonly string[]): Partial<Record<'fullName' | 'email', WaitlistErrorCode>> {
  const errors: Partial<Record<'fullName' | 'email', WaitlistErrorCode>> = {};
  const name = input.fullName.trim();
  if (!name) errors.fullName = 'name-empty';
  else if (name.length > 80) errors.fullName = 'name-long';
  const email = input.email.trim().toLowerCase();
  if (!email) errors.email = 'email-empty';
  else if (email.length > 254 || !isEmail(email)) errors.email = 'email-format';
  else if (!domains.includes(email.split('@')[1] ?? '')) errors.email = 'email-domain';
  return errors;
}
