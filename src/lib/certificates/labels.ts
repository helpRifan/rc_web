import type { VerifiedCertificate } from '@/lib/data/types';

const TYPES: Record<VerifiedCertificate['type'], string> = {
  participation: 'Participation',
  winner: 'Winner',
  runner_up: 'Runner-up',
  merit: 'Merit',
  volunteer: 'Volunteer',
  organiser: 'Organiser',
};

/** 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st… */
export function ordinal(n: number): string {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/** "Participation", or "Winner, 1st place". */
export function certificateLabel(certificate: Pick<VerifiedCertificate, 'type' | 'place'>): string {
  const label = TYPES[certificate.type];
  return certificate.place ? `${label}, ${ordinal(certificate.place)} place` : label;
}

/** "Robo Sumo, TechnoVIT '26". */
export function eventLine(certificate: Pick<VerifiedCertificate, 'event'>): string {
  const { event } = certificate;
  if (!event) return 'Robotics Club event';
  return event.series ? `${event.title}, ${event.series}` : event.title;
}
