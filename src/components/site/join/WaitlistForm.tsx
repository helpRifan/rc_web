'use client';

import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { domainList } from '@/lib/join-domains';
import { SITE } from '@/lib/site';
import type { WaitlistErrorCode } from '@/lib/validation/waitlist';
import { checkWaitlist } from '@/lib/validation/waitlist-check';

type Field = 'fullName' | 'email';
type Props = { domains: string[]; open: boolean; onFocusChange?: (inside: boolean) => void };

function fieldMessage(code: WaitlistErrorCode, domains: readonly string[]): string {
  switch (code) {
    case 'name-empty':
      return 'Enter your name.';
    case 'name-long':
      return 'Enter a name of 80 characters or fewer.';
    case 'email-empty':
      return 'Enter your VIT email.';
    case 'email-format':
      return `Enter an email address, like name@${domains[0]}.`;
    case 'email-domain':
      return `Use your VIT email. It ends in ${domainList(domains)}.`;
  }
}

type FormError = 'rate' | 'server' | 'network' | null;

/** The waitlist form: the server's rules (checked without zod here), plain errors, one honest answer. */
export function WaitlistForm({ domains, open, onFocusChange }: Props) {
  const [values, setValues] = useState({ fullName: '', email: '', website: '' });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ fullName: false, email: false });
  const [errors, setErrors] = useState<Partial<Record<Field, WaitlistErrorCode>>>({});
  const [formError, setFormError] = useState<FormError>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const focusField = (field: Field) => (field === 'fullName' ? nameRef : emailRef).current?.focus();
  const successRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

  // After the success block is committed, move focus to its heading.
  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  const check = (next = values) => checkWaitlist(next, domains);

  const onBlur = (field: Field) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: check()[field] }));
  };

  const onChange = (field: Field | 'website', value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (field !== 'website' && touched[field]) setErrors(e => ({ ...e, [field]: check(next)[field] }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const found = check();
    setTouched({ fullName: true, email: true });
    setErrors(found);
    setFormError(null);
    const first = (['fullName', 'email'] as const).find(f => found[f]);
    if (first) {
      focusField(first);
      return;
    }
    setButtonWidth(buttonRef.current?.offsetWidth);
    setSending(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.status === 201 || res.status === 200) {
        setDone(true);
        return;
      }
      if (res.status === 429) {
        setFormError('rate');
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as { field?: Field; code?: WaitlistErrorCode } | null;
        if (body?.field && body.code) {
          setErrors({ [body.field]: body.code });
          focusField(body.field);
          return;
        }
      }
      setFormError('server');
    } catch {
      setFormError('network');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div aria-live="polite" className="max-w-[28rem]">
        <h2 ref={successRef} tabIndex={-1} className="type-section flex items-center gap-3 text-rc-ink focus:outline-none">
          <CircleCheck aria-hidden="true" className="size-8 shrink-0 text-rc-accent" />
          You’re on the list.
        </h2>
        <p className="mt-4 text-lg text-rc-text">We’ll email you when intake opens.</p>
        <Link href="/events" className="text-link mt-6">
          See upcoming events
        </Link>
      </div>
    );
  }

  const hint = domains.length === 1 ? `Use your @${domains[0]} address.` : `Use an address ending in ${domainList(domains)}.`;
  const input =
    'h-13 w-full rounded-md border bg-rc-bg px-4 text-[16px] text-rc-ink transition-colors hover:border-rc-muted focus:border-rc-accent sm:text-[17px]';

  return (
    <form
      data-join-form
      noValidate
      aria-busy={sending}
      onSubmit={submit}
      onFocus={() => onFocusChange?.(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onFocusChange?.(false);
      }}
      className="relative max-w-[28rem] space-y-6"
    >
      <div>
        <label htmlFor="join-name" className="type-ui mb-2 block text-rc-ink">
          Your name
        </label>
        <input
          ref={nameRef}
          id="join-name"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={e => onChange('fullName', e.target.value)}
          onBlur={() => onBlur('fullName')}
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? 'join-name-error' : undefined}
          className={`${input} ${errors.fullName ? 'border-2 border-rc-ink' : 'border-rc-line'}`}
        />
        {errors.fullName && (
          <p id="join-name-error" className="mt-2 flex gap-2 text-[15px] text-rc-ink">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {fieldMessage(errors.fullName, domains)}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="join-email" className="type-ui mb-2 block text-rc-ink">
          VIT email
        </label>
        <p id="join-email-hint" className="mb-2 text-[15px] text-rc-text">
          {hint}
        </p>
        <input
          ref={emailRef}
          id="join-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={e => onChange('email', e.target.value)}
          onBlur={() => onBlur('email')}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'join-email-hint join-email-error' : 'join-email-hint'}
          className={`${input} ${errors.email ? 'border-2 border-rc-ink' : 'border-rc-line'}`}
        />
        {errors.email && (
          <p id="join-email-error" className="mt-2 flex gap-2 text-[15px] text-rc-ink">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {fieldMessage(errors.email, domains)}
          </p>
        )}
      </div>

      {/* Honeypot: off-screen (bots skip display:none), unreachable by keyboard. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="join-website">Leave this field empty</label>
        <input id="join-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={e => onChange('website', e.target.value)} />
      </div>

      <div>
        <button
          ref={buttonRef}
          type="submit"
          aria-disabled={sending || undefined}
          style={{ minWidth: sending ? buttonWidth : undefined }}
          className="type-ui inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-rc-accent px-6 text-rc-bg transition-colors hover:bg-rc-accent-deep sm:w-auto"
        >
          {sending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
          {sending ? (open ? 'Adding you to the list…' : 'Saving your email…') : open ? 'Add me to the list' : 'Tell me when it opens'}
        </button>
        <p className="mt-4 text-[15px] text-rc-text">We’ll only use your email to contact you about joining the club.</p>
        {formError && (
          <p role="alert" className="mt-4 flex gap-2 text-[15px] text-rc-ink">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              {formError === 'rate' && 'Too many attempts from this network. Wait a few minutes, then try again.'}
              {formError === 'network' && 'Couldn’t reach the server. Check your connection, then try again.'}
              {formError === 'server' && (
                <>
                  We couldn’t save your details. Try again in a minute. If it keeps happening, email{' '}
                  <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                    {SITE.email}
                  </a>
                  .
                </>
              )}
            </span>
          </p>
        )}
      </div>
    </form>
  );
}
