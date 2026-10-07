'use client';

import { CircleAlert } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { isEmail } from '@/lib/validation/email';

const SENT = 'If that address has certificates, we’ve emailed a link. It works for 30 minutes.';
const LIMITED = 'Too many requests. Try again in an hour.';
const FAILED = 'That didn’t go through. Try again in a minute.';

/**
 * "Find my certificates": one email field. The answer is the same whether or not the address has
 * certificates (spec 6.8). Until email can be sent, the form says so instead of pretending.
 */
export function FindForm({ ready }: { ready: boolean }) {
  const id = useId();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'limited' | 'failed'>('idle');
  const [invalid, setInvalid] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    if (!isEmail(email)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus('sending');
    try {
      const res = await fetch('/api/certificates/find', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setStatus(res.status === 202 ? 'sent' : res.status === 429 ? 'limited' : 'failed');
    } catch {
      setStatus('failed');
    }
  }

  const message = status === 'sent' ? SENT : status === 'limited' ? LIMITED : status === 'failed' ? FAILED : '';
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-2xl bg-rc-surface p-6 sm:p-8 lg:p-10">
      <h2 id={`${id}-title`} className="type-section text-rc-ink">
        Find my certificates
      </h2>
      <form onSubmit={submit} noValidate className="mt-6">
        <label htmlFor={`${id}-input`} className="type-ui block text-rc-ink">
          Email address your team registered with
        </label>
        {!ready && (
          <p id={`${id}-soon`} className="mt-1 text-[15px] text-rc-muted">
            Email lookup opens soon. Until then, ask your event organiser for your verify link.
          </p>
        )}
        <input
          id={`${id}-input`}
          name="email"
          type="email"
          autoComplete="email"
          disabled={!ready}
          aria-invalid={invalid || undefined}
          aria-describedby={[!ready && `${id}-soon`, invalid && `${id}-error`].filter(Boolean).join(' ') || undefined}
          onChange={() => invalid && setInvalid(false)}
          className="mt-3 block min-h-12 w-full rounded-md border border-rc-line bg-rc-bg px-4 text-rc-ink placeholder:text-rc-muted focus-visible:border-rc-accent disabled:opacity-60 aria-[invalid=true]:border-rc-accent"
        />
        {invalid && (
          <p id={`${id}-error`} className="mt-3 flex items-start gap-2 text-rc-text">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rc-accent" />
            Enter an email address, like name@example.com.
          </p>
        )}
        <button
          type="submit"
          disabled={!ready || status === 'sending'}
          className="type-ui mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-rc-accent px-6 text-rc-bg transition-colors hover:bg-rc-accent-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === 'sending' ? 'Sending…' : 'Email me my certificates'}
        </button>
        <p aria-live="polite" className={message ? 'mt-5 max-w-[48ch] text-rc-text' : 'sr-only'}>
          {message}
        </p>
      </form>
    </section>
  );
}
