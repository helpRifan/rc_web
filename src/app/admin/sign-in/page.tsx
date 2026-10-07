import type { Metadata } from 'next';
import { CircleAlert } from 'lucide-react';
import { safeNextPath } from '@/lib/auth/admin-rules';
import { SignInButton } from './SignInButton';

export const metadata: Metadata = {
  title: 'Sign in',
};

const ERRORS: Record<string, string> = {
  not_admin: 'That Google account isn’t a club admin. Ask an owner to add you.',
  failed: 'Sign-in didn’t complete. Try again.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: PageProps<'/admin/sign-in'>) {
  const params = await searchParams;
  const error = first(params.error);
  const next = safeNextPath(first(params.next));
  const message = error ? ERRORS[error] : undefined;

  return (
    <section className="flex min-h-[72svh] max-w-xl flex-col justify-center gap-6 py-16">
      <h1 className="type-display text-balance text-rc-ink">Sign in to admin</h1>
      <p className="max-w-[60ch] text-rc-text">This area is for club admins.</p>
      {message && (
        <p role="alert" className="flex items-start gap-3 rounded-md border border-rc-line bg-rc-surface px-4 py-3 text-rc-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rc-ink" />
          <span>{message}</span>
        </p>
      )}
      <div>
        <SignInButton next={next} />
      </div>
    </section>
  );
}
