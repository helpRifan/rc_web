import { ButtonLink } from '@/components/site/ButtonLink';
import { certificatePromptCopy } from './copy';

/**
 * "Took part in TechnoVIT '26?": shown for 120 days after a series' certificates are issued,
 * with the homepage field's dots fading in from the right (decorative).
 */
export function CertificatePrompt({ prompt }: { prompt: { label: string; titles: string[] } | null }) {
  if (!prompt) return null;
  const { heading, body } = certificatePromptCopy(prompt);
  return (
    <section aria-labelledby="home-certificates" className="site-gutter relative isolate overflow-x-clip py-20 sm:py-24 lg:py-28">
      <div
        aria-hidden="true"
        className="field-poster absolute inset-y-0 right-0 -z-10 hidden w-1/2 opacity-70 [mask-image:linear-gradient(to_left,#0D0D0D_10%,transparent_90%)] lg:block"
      />
      <div className="max-w-[80rem]">
        <h2 id="home-certificates" className="type-section max-w-[18ch] text-balance text-rc-ink">
          {heading}
        </h2>
        <p className="mt-5 max-w-[56ch] text-lg text-rc-text">{body}</p>
        <ButtonLink href="/certificates" className="mt-8 w-full sm:w-auto">
          Find your certificate
        </ButtonLink>
      </div>
    </section>
  );
}
