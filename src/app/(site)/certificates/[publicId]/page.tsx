import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { CertificateActions } from '@/components/site/certificates/CertificateActions';
import { VerifyReveal, type RevealRow } from '@/components/site/certificates/VerifyReveal';
import { certificateLabel, eventLine } from '@/lib/certificates/labels';
import { VERIFY_LIMIT } from '@/lib/certificates/limits';
import { parsePublicId } from '@/lib/certificates/public-id';
import { getCertificateByPublicId } from '@/lib/data/certificates';
import { formatDay } from '@/lib/dates';
import { clientKey, rateLimit, requestIp } from '@/lib/rate-limit';

// IDs are unbounded, so this renders per request (never cached), and each request is rate-limited.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/certificates/[publicId]'>): Promise<Metadata> {
  const id = parsePublicId((await params).publicId);
  return { title: id ? `Certificate ${id}` : 'No certificate with that ID', robots: { index: false, follow: false } };
}

/** The verify page (spec 6.8): the certificate's details as a terminal reveal, or one not-found answer for every miss. */
export default async function CertificatePage({ params }: PageProps<'/certificates/[publicId]'>) {
  const { publicId } = await params;
  const id = parsePublicId(publicId);
  // A lower-case or pasted-from-a-link ID lands on its one canonical address.
  if (id && id !== publicId) redirect(`/certificates/${id}`);
  const allowed = await rateLimit(clientKey('verify', requestIp(await headers())), VERIFY_LIMIT);
  const certificate = id && allowed ? await getCertificateByPublicId(id) : null;
  if (!certificate) notFound();

  const valid = certificate.status === 'issued';
  const rows: RevealRow[] = [
    { label: 'Name', value: certificate.name },
    { label: 'Event', value: eventLine(certificate) },
    { label: 'Certificate', value: certificateLabel(certificate) },
    { label: 'Issued', value: formatDay(certificate.issuedOn) },
    { label: 'Status', value: valid ? 'Valid' : 'Revoked', status: certificate.status },
  ];
  return (
    <section aria-labelledby="certificate-title" className="site-gutter pb-24 pt-28 lg:pb-28">
      <h1 id="certificate-title" className="text-balance text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[1.05] text-rc-ink [font-stretch:118%]">
        Certificate <span className="whitespace-nowrap tabular-nums [font-stretch:125%]">{certificate.publicId}</span>
      </h1>
      {!valid && <p className="mt-5 text-lg text-rc-text">This certificate has been revoked.</p>}
      <div className="mt-10 lg:mt-12">
        <VerifyReveal rows={rows} />
      </div>
      <CertificateActions publicId={certificate.publicId} downloadable={valid} />
    </section>
  );
}
