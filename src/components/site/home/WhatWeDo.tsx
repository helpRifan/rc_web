import FlowingMenu, { type FlowingMenuItem } from '@/components/reactbits/FlowingMenu';

const photo = (name: string) => ({ src: `/home/photos/${name}.webp`, alt: '' });

/** What the club does, each row with the club's own photos (RevUp, the race track, expos). */
export const ACTIVITIES: FlowingMenuItem[] = [
  {
    href: '/events',
    label: 'Workshops',
    description: 'RevUp, our Arduino series, starts from your first circuit and builds up to sensors and displays.',
    images: ['workshop-talk', 'workshop-wiring', 'workshop-pair', 'workshop-matrix'].map(photo),
  },
  {
    href: '/events',
    label: 'Competitions',
    description: 'We run the robotics events at TechnoVIT: line follower, obstacle race, robo race, robo soccer and robo sumo.',
    images: ['race-platform', 'race-ramp', 'arena-team', 'race-cones'].map(photo),
  },
  {
    href: '/team',
    label: 'Projects',
    description: 'Robots and drones that members design, build and test together, with more than fifteen under way.',
    images: ['project-chassis', 'project-drones', 'project-lidar', 'project-drill'].map(photo),
  },
  {
    href: '/gallery',
    label: 'Expos',
    description: 'Our stall at campus fests, where visitors meet the robots and the people who built them.',
    images: ['stall-props', 'stall-robots', 'stall-mask', 'stall-cutout'].map(photo),
  },
];

export function WhatWeDo() {
  return (
    <section aria-labelledby="home-what" className="py-20 sm:py-24 lg:py-28">
      <div className="site-gutter">
        <h2 id="home-what" className="type-section text-rc-ink">
          What we do
        </h2>
      </div>
      <FlowingMenu items={ACTIVITIES} className="mt-10 lg:mt-12" />
    </section>
  );
}
