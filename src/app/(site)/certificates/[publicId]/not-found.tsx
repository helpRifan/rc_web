import { ButtonLink } from '@/components/site/ButtonLink';

/** Unknown, malformed and rate-limited IDs all get this same answer (spec 9.3 item 4). */
export default function CertificateNotFound() {
  return (
    <section aria-labelledby="no-certificate" className="site-gutter flex min-h-[70svh] flex-col justify-center pb-24 pt-28">
      <h1 id="no-certificate" className="type-display max-w-[16ch] text-balance text-rc-ink">
        No certificate with that ID
      </h1>
      <p className="mt-6 max-w-[34em] text-lg text-rc-text">Check the ID and try again, or find your certificates with your email.</p>
      <div className="mt-9">
        <ButtonLink href="/certificates">Go to certificates</ButtonLink>
      </div>
    </section>
  );
}
