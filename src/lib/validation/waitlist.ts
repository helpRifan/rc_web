import { z } from 'zod';

export type WaitlistErrorCode = 'name-empty' | 'name-long' | 'email-empty' | 'email-format' | 'email-domain';

/** One schema for the form and the route, so both reject the same things with the same codes. */
export function makeWaitlistSchema(domains: readonly string[]) {
  return z.object({
    fullName: z.string().trim().min(1, 'name-empty').max(80, 'name-long'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'email-empty')
      .max(254, 'email-format')
      .pipe(z.email('email-format'))
      .refine(email => domains.includes(email.split('@')[1] ?? ''), 'email-domain'),
    // Honeypot: real people never see or fill it.
    website: z.string().max(200).optional().default(''),
  });
}

export type WaitlistInput = z.infer<ReturnType<typeof makeWaitlistSchema>>;

/** The first error per field, as codes. */
export function waitlistErrors(error: z.ZodError): Partial<Record<'fullName' | 'email', WaitlistErrorCode>> {
  const out: Partial<Record<'fullName' | 'email', WaitlistErrorCode>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === 'fullName' || field === 'email') && !out[field]) out[field] = issue.message as WaitlistErrorCode;
  }
  return out;
}
