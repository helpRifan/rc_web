import type { Metadata } from 'next';
import Image from 'next/image';
import { FacultyCard } from '@/components/site/about/FacultyCard';
import { PageIntro } from '@/components/site/PageIntro';
import { FACULTY, SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'How Robotics Club at VIT Chennai works, and who supervises it.',
};

// The two Genesis paragraphs are the old site's real copy, kept as written (spec 6.2).
const GENESIS = [
  'The Robotics Club at VIT Chennai is a dynamic student-driven community dedicated to innovation, learning, and collaboration in robotics and automation. The club provides a platform for students to explore cutting-edge technologies such as artificial intelligence, machine learning, and embedded systems.',
  'Through hands-on projects, workshops, and competitions, members enhance their technical skills and teamwork abilities. The club also fosters creativity by encouraging students to develop unique robotic solutions for real-world challenges.',
];

// The old objectives, rewritten plainly with the invented specifics removed. Not a sequence, so not numbered.
const AIMS = [
  'Run hands-on workshops in mechanics, electronics and programming.',
  'Build robots for inter-college competitions.',
  'Bring in people from industry to teach and mentor.',
  'Help members build a portfolio of real projects.',
  'Take on projects that are safe, accessible and useful to people.',
];

const IK = 'https://ik.imagekit.io/Rifan/robotics-club/about';

export default function AboutPage() {
  return (
    <>
      <section aria-labelledby="about-title" className="site-gutter pb-20 pt-28 sm:pb-24 lg:pb-28">
        <div className="grid max-w-[80rem] gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <PageIntro title="About the club" lead={GENESIS[0]} className="lg:col-span-6 [&_h1]:scroll-mt-28" />
          <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] bg-rc-surface lg:col-span-6">
            <Image
              src={`${IK}/genesis-1.jpg`}
              alt="An underwater ROV built by club members"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="site-gutter py-20 sm:py-24 lg:py-28">
        <div className="grid max-w-[80rem] gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <h2 id="how-title" className="type-section text-rc-ink">
              How we work
            </h2>
            <p className="mt-6 max-w-[34em] text-lg text-rc-text">{GENESIS[1]}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-rc-surface lg:col-span-5 lg:col-start-8">
            <Image
              src={`${IK}/genesis-2.jpg`}
              alt="An Arduino car with an ultrasonic distance sensor"
              fill
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="aims-title" className="site-gutter py-20 sm:py-24 lg:py-28">
        <div className="max-w-[80rem]">
          <h2 id="aims-title" className="type-section text-rc-ink">
            What we aim to do
          </h2>
          <ul role="list" className="mt-10 grid max-w-[60rem] gap-x-16 gap-y-6 lg:mt-12 lg:grid-cols-2">
            {AIMS.map(aim => (
              <li key={aim} className="text-lg text-rc-text">
                {aim}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faculty-title" className="site-gutter py-20 sm:py-24 lg:py-28">
        <div className="max-w-[80rem]">
          <h2 id="faculty-title" className="type-section text-rc-ink">
            Faculty coordinator
          </h2>
          <div className="mt-10 flex flex-col gap-10 sm:flex-row sm:items-center lg:mt-12 lg:gap-16">
            <FacultyCard name={FACULTY.name} role={FACULTY.role} photoUrl={FACULTY.photo} />
            <div>
              <p className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-[1.05] text-rc-ink [font-stretch:118%]">{FACULTY.name}</p>
              <p className="mt-3 text-lg text-rc-text">{FACULTY.role}</p>
              <a href={FACULTY.profileUrl} target="_blank" rel="noopener noreferrer" className="text-link mt-6">
                View VIT profile
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="find-title" className="site-gutter py-20 sm:py-24 lg:py-28">
        <div className="max-w-[80rem]">
          <h2 id="find-title" className="type-section text-rc-ink">
            Find us
          </h2>
          <p className="mt-6 max-w-[34em] text-lg text-rc-text">
            We’re at VIT Chennai. Email us at{' '}
            <a href={`mailto:${SITE.email}`} className="underline decoration-rc-accent decoration-2 underline-offset-[6px] hover:decoration-rc-ink">
              {SITE.email}
            </a>{' '}
            or message us on{' '}
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-rc-accent decoration-2 underline-offset-[6px] hover:decoration-rc-ink">
              Instagram
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
          <a href="https://maps.google.com/?q=VIT+Chennai" target="_blank" rel="noopener noreferrer" className="text-link mt-6">
            Open in Google Maps
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>
    </>
  );
}
