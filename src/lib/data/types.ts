import type { Database } from '@/lib/supabase/database.types';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type EventStatus = Enums['event_status'];
export type MemberLevel = Enums['member_level'];
export type MemberDivision = Enums['member_division'];

// Public column lists: the only columns any public page may read. Private columns (members.email,
// members.consent_at, certificates.contact_email) never appear here; a test pins that.
export const EVENT_PUBLIC_COLUMNS =
  'id, slug, title, summary, description, category, status, starts_on, date_label, series, cover_url, registration_url, recap_url';
export const GALLERY_PUBLIC_COLUMNS =
  'id, image_url, caption, taken_on, sort_order, width, height, created_at, event:events(slug, title, is_published)';
export const MEMBER_PUBLIC_COLUMNS =
  'slug, full_name, role_title, level, division, year_of_study, degree, joined_year, about, tags, currently_building, fun_fact, photo_url, github_url, linkedin_url, instagram_url, portfolio_url, sort_order';
export const PARTNER_PUBLIC_COLUMNS = 'id, name, website_url, logo_url, relationship, sort_order';

export type PublicEvent = Pick<
  Tables['events']['Row'],
  | 'id'
  | 'slug'
  | 'title'
  | 'summary'
  | 'description'
  | 'category'
  | 'status'
  | 'starts_on'
  | 'date_label'
  | 'series'
  | 'cover_url'
  | 'registration_url'
  | 'recap_url'
>;

export type PublicPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  taken_on: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  created_at: string;
  /** The linked event, only when that event is published. */
  event: { slug: string; title: string } | null;
};

export type PublicMember = Pick<
  Tables['members']['Row'],
  | 'slug'
  | 'full_name'
  | 'role_title'
  | 'level'
  | 'division'
  | 'year_of_study'
  | 'degree'
  | 'joined_year'
  | 'about'
  | 'tags'
  | 'currently_building'
  | 'fun_fact'
  | 'photo_url'
  | 'github_url'
  | 'linkedin_url'
  | 'instagram_url'
  | 'portfolio_url'
  | 'sort_order'
>;

export type PublicPartner = Pick<Tables['partners']['Row'], 'id' | 'name' | 'website_url' | 'logo_url' | 'relationship' | 'sort_order'>;

export type CertificateStat = { issued: number; lastIssuedOn: string };

export type CertificateType = Enums['certificate_type'];
export type CertificateStatus = Enums['certificate_status'];

/**
 * What the verify page and "Your certificates" show for one certificate, found by its ID or by
 * the holder's own link. Never the contact email, the PDF path, the team or the normalised name.
 */
export const CERT_VERIFY_COLUMNS = 'public_id, recipient_name, type, place, issued_on, status, event:events(slug, title, series)';

export type VerifiedCertificate = {
  publicId: string;
  name: string;
  type: CertificateType;
  place: number | null;
  issuedOn: string;
  status: CertificateStatus;
  event: { slug: string; title: string; series: string | null } | null;
};
