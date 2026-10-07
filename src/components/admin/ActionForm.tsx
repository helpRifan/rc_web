'use client';

import { CircleAlert } from 'lucide-react';
import { type FormEvent, type ReactNode, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '@/lib/admin/action';

function Submit({ label, pendingLabel, destructive }: { label: string; pendingLabel: string; destructive: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`type-ui inline-flex min-h-11 items-center justify-center rounded-md px-5 transition-colors disabled:opacity-60 ${
        destructive ? 'border border-rc-line text-rc-ink hover:border-rc-muted' : 'bg-rc-accent text-rc-bg hover:bg-rc-accent-deep'
      }`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

type Props = {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children?: ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  /** A secondary-styled button, for removing things. */
  destructive?: boolean;
  /** Asked before submitting, for actions that can't be undone. */
  confirm?: string;
  className?: string;
};

/** An admin form: the server action's error shows as an alert, its confirmation as a status line. */
export function ActionForm({ action, children, submitLabel = 'Save', pendingLabel = 'Saving…', destructive = false, confirm, className = '' }: Props) {
  const [state, formAction] = useActionState(action, {});
  const check = (event: FormEvent<HTMLFormElement>) => {
    if (confirm && !window.confirm(confirm)) event.preventDefault();
  };
  return (
    <form action={formAction} onSubmit={check} className={className}>
      {children}
      {state.error && (
        <p role="alert" className="mt-6 flex max-w-[60ch] items-start gap-2 text-rc-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rc-accent" />
          {state.error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Submit label={submitLabel} pendingLabel={pendingLabel} destructive={destructive} />
        <p role="status" className="text-rc-muted">
          {state.ok}
        </p>
      </div>
    </form>
  );
}
