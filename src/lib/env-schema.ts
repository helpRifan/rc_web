import { z } from 'zod';

/** An optional variable: unset and empty both mean "not configured". */
const optional = <T extends z.ZodType>(schema: T) => z.preprocess(value => (value === '' ? undefined : value), schema.optional());

export const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https$/ }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith('sb_publishable_'),
  SUPABASE_SECRET_KEY: z.string().startsWith('sb_secret_'),
  NEXT_PUBLIC_SITE_URL: z.url(),
  // Uploads only (the member import, later the admin), so the public site runs without them.
  IMAGEKIT_PRIVATE_KEY: optional(z.string().startsWith('private_')),
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: optional(z.url({ protocol: /^https$/ })),
  NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: optional(z.string().startsWith('public_')),
  // Email (spec 10): without all of these, and EMAIL_ENABLED=1 once the sending domain is
  // verified, "Find my certificates" says it opens soon instead of claiming to send anything.
  CERT_LINK_SECRET: optional(z.string().min(32)),
  RESEND_API_KEY: optional(z.string().startsWith('re_')),
  RESEND_FROM_EMAIL: optional(z.string().regex(/^(?:[^<>]+<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/)),
  ADMIN_NOTIFY_EMAILS: optional(z.string().regex(/^[^\s@,]+@[^\s@,]+(?:\s*,\s*[^\s@,]+@[^\s@,]+)*$/)),
  EMAIL_ENABLED: optional(z.enum(['0', '1'])),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const names = [...new Set(result.error.issues.map(issue => String(issue.path[0])))].sort();
    throw new Error(`Invalid or missing environment variables: ${names.join(', ')}. See .env.example.`);
  }
  return result.data;
}
