import ScrollReveal from '@/components/reactbits/ScrollReveal';
import SplitFlapText from '@/components/reactbits/SplitFlapText';

/** The owner's About text (2026-10-07), tightened for the home page. */
export const ABOUT = {
  lead: 'We are a student-run club at VIT Chennai that learns robotics by building it.',
  body: 'Members team up on projects, run workshops and take robots to competitions, picking up embedded systems, automation, AI and machine learning along the way. We push for original robots built for real-world problems.',
  college:
    'VIT Chennai is a private university known for its teaching and research, with undergraduate, postgraduate and doctoral programmes in engineering, management, law and the sciences. Its labs and close ties with industry give students practical experience through internships and projects.',
} as const;

/** The owner's figures (2026-10-07). */
export const STATS = [
  { value: '175+', label: 'Members' },
  { value: '75+', label: 'Projects completed' },
  { value: '15+', label: 'Projects in progress' },
  { value: '5', label: 'Departments' },
] as const;

export function AboutClub() {
  return (
    <section aria-labelledby="home-about" className="site-gutter py-24 sm:py-28 lg:py-36">
      <div className="max-w-[80rem]">
        <h2 id="home-about" className="type-section text-rc-ink">
          About the club
        </h2>
        <ScrollReveal className="about-lead mt-8 max-w-[24ch] text-rc-ink lg:mt-10">
          {ABOUT.lead}
        </ScrollReveal>
        <div className="mt-12 grid gap-x-16 gap-y-10 lg:mt-16 lg:grid-cols-12">
          <p className="max-w-[56ch] text-lg text-rc-text lg:col-span-6">{ABOUT.body}</p>
          <div className="lg:col-span-5 lg:col-start-8">
            <h3 className="type-ui text-[17px] text-rc-ink">About VIT Chennai</h3>
            <p className="mt-3 max-w-[52ch] text-rc-muted">{ABOUT.college}</p>
          </div>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 lg:mt-24 lg:grid-cols-4">
          {STATS.map(stat => (
            <div key={stat.label} className="flex flex-col-reverse gap-4">
              <dt className="text-rc-muted">{stat.label}</dt>
              <dd>
                <SplitFlapText text={stat.value} className="text-[clamp(2.75rem,6.4vw,5.25rem)] text-rc-ink" />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
