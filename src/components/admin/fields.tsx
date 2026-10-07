import type { ReactNode } from 'react';

// Labelled form controls for the admin, styled to the palette. Each field's id comes from its name,
// so names must be unique within a form.

const CONTROL = 'mt-2 block w-full rounded-md border border-rc-line bg-rc-bg px-3 text-rc-ink placeholder:text-rc-muted/70 focus-visible:border-rc-accent';

type Base = { name: string; label: string; hint?: string };

function Label({ name, label, hint }: Base) {
  return (
    <>
      <label htmlFor={`f-${name}`} className="type-ui block text-rc-ink">
        {label}
      </label>
      {hint && (
        <p id={`f-${name}-hint`} className="mt-1 max-w-[60ch] text-[15px] text-rc-muted">
          {hint}
        </p>
      )}
    </>
  );
}

export function TextField({
  type = 'text',
  defaultValue,
  required,
  maxLength,
  placeholder,
  ...base
}: Base & { type?: 'text' | 'url' | 'date' | 'number'; defaultValue?: string | number | null; required?: boolean; maxLength?: number; placeholder?: string }) {
  return (
    <div>
      <Label {...base} />
      <input
        id={`f-${base.name}`}
        name={base.name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={base.hint ? `f-${base.name}-hint` : undefined}
        className={`${CONTROL} min-h-11`}
      />
    </div>
  );
}

export function TextArea({ defaultValue, rows = 4, maxLength, ...base }: Base & { defaultValue?: string | null; rows?: number; maxLength?: number }) {
  return (
    <div>
      <Label {...base} />
      <textarea
        id={`f-${base.name}`}
        name={base.name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        maxLength={maxLength}
        aria-describedby={base.hint ? `f-${base.name}-hint` : undefined}
        className={`${CONTROL} py-2 leading-relaxed`}
      />
    </div>
  );
}

export function SelectField({ defaultValue, options, ...base }: Base & { defaultValue?: string | null; options: readonly { value: string; label: string }[] }) {
  return (
    <div>
      <Label {...base} />
      <select
        id={`f-${base.name}`}
        name={base.name}
        defaultValue={defaultValue ?? ''}
        aria-describedby={base.hint ? `f-${base.name}-hint` : undefined}
        className={`${CONTROL} min-h-11`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({ name, label, hint, defaultChecked }: Base & { defaultChecked?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={`f-${name}`}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        aria-describedby={hint ? `f-${name}-hint` : undefined}
        className="mt-1 size-5 shrink-0 accent-rc-accent"
      />
      <div>
        <label htmlFor={`f-${name}`} className="type-ui text-rc-ink">
          {label}
        </label>
        {hint && (
          <p id={`f-${name}-hint`} className="mt-1 max-w-[60ch] text-[15px] text-rc-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/** A page heading with an optional action link on the right. */
export function AdminHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h1 className="type-section text-rc-ink">{title}</h1>
      {children}
    </div>
  );
}

export const BUTTON_LINK = 'type-ui inline-flex min-h-11 items-center justify-center rounded-md bg-rc-accent px-5 text-rc-bg transition-colors hover:bg-rc-accent-deep';
export const TABLE = 'mt-8 w-full border-collapse text-left [&_td]:border-t [&_td]:border-rc-line [&_td]:py-3 [&_td]:pr-4 [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-[15px] [&_th]:font-medium [&_th]:text-rc-muted';
