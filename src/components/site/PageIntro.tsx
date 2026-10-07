import type { ReactNode } from 'react';
import { ScrambleHeading } from './ScrambleHeading';

type Props = {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** The h1's id, for a section labelled by it. */
  id?: string;
};

/** The standard page opening: the decrypting h1, an optional lead, then any actions. */
export function PageIntro({ title, lead, children, className = '', id }: Props) {
  return (
    <div className={className}>
      <ScrambleHeading as="h1" id={id} text={title} className="type-display max-w-[14ch] text-balance text-rc-ink" />
      {lead && <p className="mt-6 max-w-[34em] text-lg text-rc-text">{lead}</p>}
      {children}
    </div>
  );
}
