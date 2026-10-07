import 'server-only';
import { normalizeEmail } from '@/lib/certificates/normalize';
import { PUBLIC_ID } from '@/lib/certificates/public-id';
import { db } from '@/lib/supabase/admin';
import { FIXTURE_CERTIFICATES } from './fixtures';
import { fixturesEnabled } from './source';
import { CERT_VERIFY_COLUMNS, type VerifiedCertificate } from './types';

// Certificate lookups for the public pages (spec 6.8, 9.3 item 4). By ID: the verify page. By
// email: only behind a signed link, and the email itself is never returned. Query errors throw.

type Row = {
  public_id: string;
  recipient_name: string;
  type: VerifiedCertificate['type'];
  place: number | null;
  issued_on: string;
  status: VerifiedCertificate['status'];
  event: { slug: string; title: string; series: string | null } | null;
};

const toVerified = (row: Row): VerifiedCertificate => ({
  publicId: row.public_id,
  name: row.recipient_name,
  type: row.type,
  place: row.place,
  issuedOn: row.issued_on,
  status: row.status,
  event: row.event,
});

/** A fixture without its contact email, which public results never carry. */
const strip = (c: (typeof FIXTURE_CERTIFICATES)[number]): VerifiedCertificate => ({
  publicId: c.publicId,
  name: c.name,
  type: c.type,
  place: c.place,
  issuedOn: c.issuedOn,
  status: c.status,
  event: c.event,
});

/** A certificate by its public ID, or null for unknown and malformed IDs alike. */
export async function getCertificateByPublicId(id: string): Promise<VerifiedCertificate | null> {
  if (!PUBLIC_ID.test(id)) return null;
  if (fixturesEnabled()) {
    const found = FIXTURE_CERTIFICATES.find(c => c.publicId === id);
    return found ? strip(found) : null;
  }
  const { data, error } = await db().from('certificates').select(CERT_VERIFY_COLUMNS).eq('public_id', id).maybeSingle();
  if (error) throw new Error(`certificate query failed: ${error.message}`);
  return data ? toVerified(data as unknown as Row) : null;
}

/** Where a certificate's PDF is stored, for the download route only. */
export async function getCertificateFile(id: string): Promise<{ pdfPath: string; status: VerifiedCertificate['status'] } | null> {
  if (!PUBLIC_ID.test(id)) return null;
  if (fixturesEnabled()) {
    const found = FIXTURE_CERTIFICATES.find(c => c.publicId === id);
    return found ? { pdfPath: `fixtures/${found.publicId}.pdf`, status: found.status } : null;
  }
  const { data, error } = await db().from('certificates').select('pdf_path, status').eq('public_id', id).maybeSingle();
  if (error) throw new Error(`certificate file query failed: ${error.message}`);
  return data ? { pdfPath: data.pdf_path, status: data.status } : null;
}

/** Every certificate tied to an email (a team contact), newest first. */
export async function getCertificatesByEmail(email: string): Promise<VerifiedCertificate[]> {
  const address = normalizeEmail(email);
  if (fixturesEnabled()) return FIXTURE_CERTIFICATES.filter(c => c.contactEmail === address).map(strip);
  const { data, error } = await db()
    .from('certificates')
    .select(CERT_VERIFY_COLUMNS)
    .eq('contact_email', address)
    .order('issued_on', { ascending: false })
    .order('recipient_name', { ascending: true });
  if (error) throw new Error(`certificates by email query failed: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map(toVerified);
}

/** How many issued certificates an email has (the find route sends only when there are some). */
export async function countCertificatesForEmail(email: string): Promise<number> {
  const address = normalizeEmail(email);
  if (fixturesEnabled()) return FIXTURE_CERTIFICATES.filter(c => c.contactEmail === address && c.status === 'issued').length;
  const { count, error } = await db()
    .from('certificates')
    .select('id', { count: 'exact', head: true })
    .eq('contact_email', address)
    .eq('status', 'issued');
  if (error) throw new Error(`certificate count query failed: ${error.message}`);
  return count ?? 0;
}

/** A 5-minute signed download URL for a stored PDF (the bucket is private). */
export async function signedPdfUrl(pdfPath: string): Promise<string> {
  const { data, error } = await db().storage.from('certificates').createSignedUrl(pdfPath, 300);
  if (error || !data) throw new Error(`signing the certificate URL failed: ${error?.message ?? 'no URL'}`);
  return data.signedUrl;
}
