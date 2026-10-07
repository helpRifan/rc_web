import 'server-only';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';

// Admin reads (plan Task 21). Every helper re-checks admin status itself, like every admin page,
// action and route (spec 9.2). Members are read without their private email and consent columns.

type Tables = Database['public']['Tables'];
export type AdminEvent = Tables['events']['Row'];
export type AdminPhoto = Tables['gallery_items']['Row'] & { event: { title: string } | null };
export type AdminPartner = Tables['partners']['Row'];
export type AdminMember = Omit<Tables['members']['Row'], 'email' | 'consent_at'>;

const MEMBER_COLUMNS =
  'id, slug, full_name, role_title, level, division, year_of_study, degree, joined_year, about, tags, currently_building, fun_fact, photo_url, github_url, linkedin_url, instagram_url, portfolio_url, is_published, sort_order, created_at, updated_at';

function must<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`${what} failed: ${result.error.message}`);
  return result.data as T;
}

async function count(table: 'events' | 'gallery_items' | 'members' | 'partners' | 'waitlist' | 'certificates', published?: boolean): Promise<number> {
  // Typed as events: the published filter is only used on tables that have is_published.
  const base = db().from(table as 'events').select('id', { count: 'exact', head: true });
  const { count: n, error } = await (published === undefined ? base : base.eq('is_published', published));
  if (error) throw new Error(`counting ${table} failed: ${error.message}`);
  return n ?? 0;
}

/** The dashboard's numbers, straight from the database. */
export async function adminCounts() {
  await requireAdmin();
  const [events, eventsPublished, photos, photosPublished, members, membersPublished, partners, waitlist, certificates] = await Promise.all([
    count('events'),
    count('events', true),
    count('gallery_items'),
    count('gallery_items', true),
    count('members'),
    count('members', true),
    count('partners'),
    count('waitlist'),
    count('certificates'),
  ]);
  return { events, eventsPublished, photos, photosPublished, members, membersPublished, partners, waitlist, certificates };
}

export async function adminEvents(): Promise<AdminEvent[]> {
  await requireAdmin();
  return must(await db().from('events').select('*').order('starts_on', { ascending: false, nullsFirst: false }).order('title'), 'reading events');
}

export async function adminEvent(id: string): Promise<AdminEvent | null> {
  await requireAdmin();
  return must(await db().from('events').select('*').eq('id', id).maybeSingle(), 'reading the event');
}

/** How many certificates point at an event (an event with certificates can't be deleted). */
export async function eventCertificateCount(id: string): Promise<number> {
  await requireAdmin();
  const { count: n, error } = await db().from('certificates').select('id', { count: 'exact', head: true }).eq('event_id', id);
  if (error) throw new Error(`counting the event's certificates failed: ${error.message}`);
  return n ?? 0;
}

export async function adminPhotos(): Promise<AdminPhoto[]> {
  await requireAdmin();
  return must(await db().from('gallery_items').select('*, event:events(title)').order('sort_order').order('created_at'), 'reading photos') as AdminPhoto[];
}

export async function adminPhoto(id: string): Promise<AdminPhoto | null> {
  await requireAdmin();
  return must(await db().from('gallery_items').select('*, event:events(title)').eq('id', id).maybeSingle(), 'reading the photo') as AdminPhoto | null;
}

export async function adminMembers(): Promise<AdminMember[]> {
  await requireAdmin();
  return must(await db().from('members').select(MEMBER_COLUMNS).order('sort_order').order('full_name'), 'reading members') as AdminMember[];
}

export async function adminMember(id: string): Promise<AdminMember | null> {
  await requireAdmin();
  return must(await db().from('members').select(MEMBER_COLUMNS).eq('id', id).maybeSingle(), 'reading the member') as AdminMember | null;
}

export async function adminPartners(): Promise<AdminPartner[]> {
  await requireAdmin();
  return must(await db().from('partners').select('*').order('sort_order').order('name'), 'reading partners');
}

export async function adminPartner(id: string): Promise<AdminPartner | null> {
  await requireAdmin();
  return must(await db().from('partners').select('*').eq('id', id).maybeSingle(), 'reading the partner');
}

export async function adminSetting(key: string): Promise<unknown> {
  await requireAdmin();
  const row = must(await db().from('site_settings').select('value').eq('key', key).maybeSingle(), `reading the ${key} setting`) as { value: unknown } | null;
  return row?.value ?? null;
}

export async function adminWaitlist(): Promise<{ full_name: string; email: string; source: string; created_at: string }[]> {
  await requireAdmin();
  return must(await db().from('waitlist').select('full_name, email, source, created_at').order('created_at', { ascending: false }), 'reading the waitlist');
}
