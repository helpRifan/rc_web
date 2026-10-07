// What the admin forms may write (plan Task 21). The same limits as the database's own checks,
// https-only links, and messages in plain words. Empty optional fields become null.
import { z } from 'zod';
import { DIVISIONS } from '@/lib/divisions';

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it to ${max} characters or fewer.`)
    .transform(value => value || null);
const required = (max: number, message: string) => z.string().trim().min(1, message).max(max, `Keep it to ${max} characters or fewer.`);
const https = z
  .string()
  .trim()
  .transform(value => value || null)
  .pipe(z.union([z.null(), z.url({ protocol: /^https$/, message: 'Links must start with https://.' })]));
const date = z
  .string()
  .trim()
  .transform(value => value || null)
  .pipe(z.union([z.null(), z.iso.date({ message: 'Use a date like 2026-03-14.' })]));
const order = z.coerce.number({ message: 'Use a whole number.' }).int('Use a whole number.').min(-9999).max(9999);
export const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lower-case words joined by hyphens, like robo-sumo.')
  .max(80);

export const eventSchema = z.object({
  title: required(120, 'Give the event a title.'),
  slug,
  summary: text(160),
  description: text(5000),
  category: text(60),
  status: z.enum(['upcoming', 'registration_open', 'coming_soon', 'completed'], { message: 'Choose a status.' }),
  starts_on: date,
  date_label: text(60),
  series: text(60),
  cover_url: https,
  registration_url: https,
  recap_url: https,
  is_published: z.boolean(),
});

export const photoSchema = z.object({
  image_url: z.url({ protocol: /^https$/, message: 'Paste the photo’s https:// address on ImageKit.' }).refine(url => url.startsWith('https://ik.imagekit.io/'), 'Photos must be on ImageKit (https://ik.imagekit.io/…).'),
  caption: text(200),
  event_id: z
    .string()
    .trim()
    .transform(value => value || null)
    .pipe(z.union([z.null(), z.uuid({ message: 'Choose an event from the list.' })])),
  taken_on: date,
  sort_order: order,
  width: z.coerce.number().int().min(1).max(20000).nullable(),
  height: z.coerce.number().int().min(1).max(20000).nullable(),
  is_published: z.boolean(),
});

export const memberSchema = z.object({
  full_name: required(80, 'Give the member’s name.'),
  role_title: text(60),
  level: z.enum(['faculty', 'board', 'head', 'lead', 'core', 'member'], { message: 'Choose a level.' }),
  division: z.enum(['projects', 'webdev', 'teaching', 'media', 'operations', 'marketing', 'alumni', 'none'], { message: 'Choose a division.' }),
  year_of_study: text(40),
  degree: text(80),
  joined_year: z
    .string()
    .trim()
    .transform(value => (value ? Number(value) : null))
    .pipe(z.union([z.null(), z.number().int('Use a year like 2024.').min(2015, 'Use a year from 2015 on.').max(2100)])),
  about: text(300),
  currently_building: text(80),
  fun_fact: text(100),
  github_url: https,
  linkedin_url: https,
  instagram_url: https,
  portfolio_url: https,
  sort_order: order,
  is_published: z.boolean(),
});

export const partnerSchema = z.object({
  name: required(80, 'Give the partner’s name.'),
  website_url: https,
  logo_url: https,
  relationship: text(140),
  sort_order: order,
  is_published: z.boolean(),
});

export const divisionLinesSchema = z.object(Object.fromEntries(DIVISIONS.map(d => [d.id, text(160)])) as Record<(typeof DIVISIONS)[number]['id'], ReturnType<typeof text>>);

/** A form's fields as strings (files dropped), with checkboxes read as booleans by name. */
export function formFields(form: FormData, checkboxes: string[] = []): Record<string, string | boolean> {
  const fields: Record<string, string | boolean> = {};
  for (const [key, value] of form.entries()) if (typeof value === 'string' && !key.startsWith('$')) fields[key] = value;
  for (const name of checkboxes) fields[name] = form.get(name) === 'on';
  return fields;
}

/** The first problem, as one sentence naming the field. */
export function firstError(error: z.ZodError, labels: Record<string, string> = {}): string {
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? '');
  const label = labels[field];
  return label ? `${label}: ${issue.message}` : (issue?.message ?? 'Check the form and try again.');
}
