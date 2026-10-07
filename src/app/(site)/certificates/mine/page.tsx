import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/site/ButtonLink';
import { certificateLabel, eventLine } from '@/lib/certificates/labels';
import { certLinkSecret } from '@/lib/certificates/secret';
import { verifyCertLink } from '@/lib/certificates/token';
import { getCertificatesByEmail } from '@/lib/data/certificates';

// Per request: the token decides everything, and nothing here may be cached. The token can't leak
// through the Referer header either (next.config.ts sets no-referrer for this path).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Your certificates', robots: { index: false, follow: false } };

function Expired() {
  return (
    <section aria-labelledby="expired-title" className="site-gutter flex min-h-[70svh] flex-col justify-center pb-24 pt-28">
      <h1 id="expired-title" className="type-display max-w-[16ch] text-balance text-rc-ink">
        This link has expired
      </h1>
      <p className="mt-6 max-w-[34em] text-lg text-rc-text">Links work for 30 minutes. Request a new one.</p>
      <div className="mt-9">
        <ButtonLink href="/certificates">Find my certificates</ButtonLink>
      </div>
    </section>
  );
}

/** "Your certificates" (spec 6.8): every certificate tied to the email the signed link was sent to. */
export default async function MyCertificatesPage({ searchParams }: PageProps<'/certificates/mine'>) {
  const { token } = await searchParams;
  const secret = certLinkSecret();
  const holder = typeof token === 'string' && secret ? verifyCertLink(token, secret) : null;
  if (!holder) return <Expired />;
  const certificates = await getCertificatesByEmail(holder.email);

  return (
    <section aria-labelledby="mine-title" className="site-gutter pb-24 pt-28 lg:pb-28">
      <div className="max-w-[64rem]">
        <h1 id="mine-title" className="type-display text-rc-ink">
          Your certificates
        </h1>
        <p className="mt-6 text-lg text-rc-text">Certificates for {holder.email}.</p>
        {certificates.length ? (
          <ul role="list" className="mt-12 grid gap-4">
            {certificates.map(certificate => (
              <li key={certificate.publicId} className="grid gap-4 rounded-2xl bg-rc-surface p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-10 sm:p-8">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-rc-ink [font-stretch:110%]">{eventLine(certificate)}</h2>
                  <p className="mt-2 text-rc-text">
                    {certificateLabel(certificate)}
                    {certificate.status === 'revoked' && ', revoked'}
                  </p>
                  <p className="mt-1 text-rc-muted">{certificate.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link href={`/certificates/${certificate.publicId}`} className="text-link">
                    Verify<span className="sr-only"> {certificate.name}&rsquo;s certificate</span>
                  </Link>
                  {certificate.status === 'issued' && (
                    <a href={`/api/certificates/${certificate.publicId}/pdf`} className="text-link">
                      Download PDF<span className="sr-only"> of {certificate.name}&rsquo;s certificate</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-lg text-rc-text">No certificates are tied to this address any more.</p>
        )}
        <p className="mt-10 text-rc-muted">Share a verify link with anyone who needs proof.</p>
      </div>
    </section>
  );
}
