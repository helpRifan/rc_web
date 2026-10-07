'use client';

import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useId, useState } from 'react';
import { parsePublicId } from '@/lib/certificates/public-id';

/** "Verify a certificate": a pasted verify link or a bare ID goes to its verify page. */
export function VerifyForm() {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('certificate');
    const publicId = typeof value === 'string' ? parsePublicId(value) : null;
    if (!publicId) {
      setError(true);
      return;
    }
    setError(false);
    router.push(`/certificates/${publicId}`);
  }

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-2xl bg-rc-surface p-6 sm:p-8 lg:p-10">
      <h2 id={`${id}-title`} className="type-section text-rc-ink">
        Verify a certificate
      </h2>
      <form onSubmit={submit} noValidate className="mt-6">
        <label htmlFor={`${id}-input`} className="type-ui block text-rc-ink">
          Verify link or certificate ID
        </label>
        <p id={`${id}-hint`} className="mt-1 text-[15px] text-rc-muted">
          IDs look like RC26-7KQ2M9XH4D.
        </p>
        <input
          id={`${id}-input`}
          name="certificate"
          type="text"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error || undefined}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
          onChange={() => error && setError(false)}
          className="mt-3 block min-h-12 w-full rounded-md border border-rc-line bg-rc-bg px-4 text-rc-ink placeholder:text-rc-muted focus-visible:border-rc-accent aria-[invalid=true]:border-rc-accent"
        />
        {error && (
          <p id={`${id}-error`} className="mt-3 flex items-start gap-2 text-rc-text">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rc-accent" />
            That doesn&rsquo;t look like a certificate ID. Check it and try again.
          </p>
        )}
        <button type="submit" className="type-ui mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-rc-line px-6 text-rc-ink transition-colors hover:border-rc-muted sm:w-auto">
          Verify
        </button>
      </form>
    </section>
  );
}
