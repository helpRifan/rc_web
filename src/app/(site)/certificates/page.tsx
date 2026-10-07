import type { Metadata } from 'next';
import { FindForm } from '@/components/site/certificates/FindForm';
import { VerifyForm } from '@/components/site/certificates/VerifyForm';
import { PageIntro } from '@/components/site/PageIntro';
import { emailReady } from '@/lib/email/send';

const LEAD = 'Find the certificates for your team, or check that a certificate is genuine.';

export const metadata: Metadata = { title: 'Certificates', description: LEAD };

/** Two jobs, side by side from 1024px: find yours by email, or verify one by its link or ID (spec 6.8). */
export default function CertificatesPage() {
  return (
    <section aria-labelledby="certificates-title" className="site-gutter pb-24 pt-28 lg:pb-28">
      <PageIntro id="certificates-title" title="Certificates" lead={LEAD} />
      <div className="mt-12 grid max-w-[80rem] gap-6 lg:mt-16 lg:grid-cols-2 lg:items-start">
        <FindForm ready={emailReady()} />
        <VerifyForm />
      </div>
    </section>
  );
}
