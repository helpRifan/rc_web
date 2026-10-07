import { FacultyCard } from '@/components/site/about/FacultyCard';
import { FACULTY } from '@/lib/site';

/**
 * The faculty coordinator (owner's update, 2026-10-08): his card, his profile from the VIT Faculty
 * Directory (post, PhD, specialisations, research figures, public profiles) and his message.
 */
export function FacultySection({ photoUrl }: { photoUrl: string }) {
  // 'robotics and automation, and CAD/CAM/CAE': each item can have its own 'and', so commas separate them.
  const items = FACULTY.specialisations.map(s => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s));
  const specialisations = items.length > 1 ? `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}` : items[0];
  return (
    <section aria-labelledby="faculty-heading" className="site-gutter py-20 sm:py-24 lg:py-28">
      <div className="max-w-[80rem]">
        <h2 id="faculty-heading" className="type-section text-rc-ink">
          Faculty coordinator
        </h2>
        <div className="mt-10 flex flex-col gap-10 sm:flex-row sm:items-start lg:mt-12 lg:gap-16">
          <FacultyCard name={FACULTY.name} role={FACULTY.role} photoUrl={photoUrl} />
          <div className="max-w-[38em]">
            <p className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold leading-[1.08] text-rc-ink [font-stretch:118%]">{FACULTY.name}</p>
            <p className="mt-3 text-lg text-rc-text">{FACULTY.designation}</p>
            <p className="text-rc-muted">{FACULTY.role}, Robotics Club</p>
            <p className="mt-6 text-rc-text">{FACULTY.education}.</p>
            <p className="mt-2 text-rc-text">Specialises in {specialisations}.</p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
              {FACULTY.figures.map(figure => (
                <div key={figure.label} className="flex flex-col-reverse">
                  <dt className="text-[14.5px] text-rc-muted">{figure.label}</dt>
                  <dd className="text-[2rem] font-extrabold leading-none text-rc-ink [font-stretch:112%]">{figure.value}</dd>
                </div>
              ))}
            </dl>
            <ul role="list" className="mt-7 flex flex-wrap gap-x-6 gap-y-1">
              {FACULTY.links.map(link => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-link">
                    {link.label}
                    <span className="sr-only"> of {FACULTY.name} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <figure className="mt-16 max-w-[64ch] border-l-2 border-rc-accent pl-6 lg:mt-20 lg:pl-8">
          <h3 className="type-ui text-[17px] text-rc-ink">A message from our faculty coordinator</h3>
          <blockquote className="mt-4 text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-[1.65] text-rc-text">
            <p>{FACULTY.message}</p>
          </blockquote>
          <figcaption className="mt-5 text-rc-muted">
            {FACULTY.name}, {FACULTY.role}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
