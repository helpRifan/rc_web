import { describe, expect, it } from 'vitest';
import { parseServerEnv } from './env-schema';

const VALID = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://lvmibgzaaegamfesjfsk.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  SUPABASE_SECRET_KEY: 'sb_secret_example_value',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

describe('parseServerEnv', () => {
  it('accepts a complete environment', () => {
    expect(parseServerEnv(VALID).SUPABASE_SECRET_KEY).toBe('sb_secret_example_value');
  });

  it('names every missing variable', () => {
    expect(() => parseServerEnv({})).toThrow(
      'Invalid or missing environment variables: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY. See .env.example.',
    );
  });

  it('rejects legacy JWT keys and http Supabase URLs', () => {
    expect(() => parseServerEnv({ ...VALID, SUPABASE_SECRET_KEY: 'eyJhbGciOi.legacy' })).toThrow(/SUPABASE_SECRET_KEY/);
    expect(() => parseServerEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_URL: 'http://x.supabase.co' })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('treats the upload keys as optional, empty as unset, and checks them when set', () => {
    expect(parseServerEnv({ ...VALID, IMAGEKIT_PRIVATE_KEY: '' }).IMAGEKIT_PRIVATE_KEY).toBeUndefined();
    expect(parseServerEnv({ ...VALID, IMAGEKIT_PRIVATE_KEY: 'private_example' }).IMAGEKIT_PRIVATE_KEY).toBe('private_example');
    expect(() => parseServerEnv({ ...VALID, IMAGEKIT_PRIVATE_KEY: 'public_wrong_key' })).toThrow(/IMAGEKIT_PRIVATE_KEY/);
    expect(() => parseServerEnv({ ...VALID, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: 'http://ik.imagekit.io/x' })).toThrow(/NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT/);
  });

  it('checks the email settings when they are set', () => {
    expect(parseServerEnv({ ...VALID, CERT_LINK_SECRET: 'x'.repeat(32), RESEND_API_KEY: 're_example', RESEND_FROM_EMAIL: 'Robotics Club <hello@example.com>', EMAIL_ENABLED: '1' }).EMAIL_ENABLED).toBe('1');
    expect(() => parseServerEnv({ ...VALID, CERT_LINK_SECRET: 'too-short' })).toThrow(/CERT_LINK_SECRET/);
    expect(() => parseServerEnv({ ...VALID, RESEND_FROM_EMAIL: 'not an address' })).toThrow(/RESEND_FROM_EMAIL/);
    expect(() => parseServerEnv({ ...VALID, ADMIN_NOTIFY_EMAILS: 'a@example.com, nope' })).toThrow(/ADMIN_NOTIFY_EMAILS/);
    expect(parseServerEnv({ ...VALID, ADMIN_NOTIFY_EMAILS: 'a@example.com, b@example.com' }).ADMIN_NOTIFY_EMAILS).toBe('a@example.com, b@example.com');
  });

  it('never echoes a value in the error', () => {
    expect.assertions(2); // the call must throw, or the checks below never run
    try {
      parseServerEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_URL: 'not a url' });
    } catch (error) {
      expect(String(error)).not.toContain('sb_secret_example_value');
      expect(String(error)).not.toContain('not a url');
    }
  });
});
