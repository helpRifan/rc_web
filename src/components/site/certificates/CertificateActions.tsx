'use client';

import { Check, Copy, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Download (unless revoked) and copy the verify link, for sharing as proof. */
export function CertificateActions({ publicId, downloadable }: { publicId: string; downloadable: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(`/certificates/${publicId}`, window.location.origin).toString());
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      {downloadable && (
        // A plain link: the route redirects to a short-lived signed URL, which client routing can't follow.
        <a
          href={`/api/certificates/${publicId}/pdf`}
          className="type-ui inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-rc-accent px-6 text-rc-bg transition-colors hover:bg-rc-accent-deep"
        >
          <Download aria-hidden="true" className="size-4" strokeWidth={2} />
          Download PDF
        </a>
      )}
      <button type="button" onClick={copy} className="text-link gap-2 self-start sm:self-auto">
        {state === 'copied' ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed. Copy the address bar instead.' : 'Copy verify link'}
      </button>
      <p aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Verify link copied' : ''}
      </p>
    </div>
  );
}
