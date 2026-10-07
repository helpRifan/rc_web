'use client';

import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { browserClient } from '@/lib/supabase/browser';

export function SignInButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setPending(true);
    setFailed(false);
    const redirectTo = `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await browserClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="type-ui inline-flex min-h-12 items-center rounded-md bg-rc-accent px-6 text-rc-bg transition-colors hover:bg-rc-accent-deep disabled:opacity-60"
      >
        {pending ? 'Opening Google…' : 'Sign in with Google'}
      </button>
      {failed && (
        <p role="alert" className="flex items-start gap-3 text-rc-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rc-ink" />
          <span>Couldn’t open Google sign-in. Try again.</span>
        </p>
      )}
    </div>
  );
}
