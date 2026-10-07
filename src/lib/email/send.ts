import 'server-only';
import { fixturesEnabled } from '@/lib/data/source';
import { serverEnv } from '@/lib/env';
import type { Email } from './templates';

/**
 * Whether the site can send email: the Resend key, a from address, the link secret, and
 * EMAIL_ENABLED=1 (set once the sending domain is verified, spec 10). Local fixtures pretend it
 * can, so the forms can be tried; nothing is sent from them.
 */
export function emailReady(): boolean {
  if (fixturesEnabled()) return true;
  const env = serverEnv();
  return env.EMAIL_ENABLED === '1' && Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL && env.CERT_LINK_SECRET);
}

/** Sends through Resend's HTTP API. Throws on failure; the message's contents are never logged. */
export async function sendEmail(to: string, email: Email): Promise<void> {
  if (fixturesEnabled()) return;
  const env = serverEnv();
  if (!emailReady()) throw new Error('email is not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to: [to], subject: email.subject, html: email.html, text: email.text }),
  });
  if (!res.ok) throw new Error(`Resend answered HTTP ${res.status}`);
}
