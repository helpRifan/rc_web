import { Fragment, type ReactNode } from 'react';

// A deliberately small markdown renderer for event descriptions (event-detail brief 6): paragraphs,
// bulleted and numbered lists, links, bold and italic. It builds React elements, never HTML, so
// nothing in the text can run; raw HTML tags are dropped, and links must be https or on this site.

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;

/** An https URL or a path on this site; anything else (javascript:, data:, http:) isn't a link. */
export function safeHref(href: string): { href: string; external: boolean } | null {
  if (/^\/(?!\/)/.test(href)) return { href, external: false };
  try {
    return new URL(href).protocol === 'https:' ? { href, external: true } : null;
  } catch {
    return null;
  }
}

const stripTags = (text: string) => text.replace(/<\/?[a-z][^>]*>/gi, '');

function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyBase}-${n++}`;
    const [, linkText, href, bold, italic, underscored] = match;
    if (linkText !== undefined) {
      const safe = safeHref(href);
      if (!safe) nodes.push(linkText);
      else if (safe.external)
        nodes.push(
          <a key={key} href={safe.href} target="_blank" rel="noopener noreferrer" className="underline decoration-rc-accent decoration-2 underline-offset-[6px] hover:decoration-rc-ink">
            {linkText}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>,
        );
      else
        nodes.push(
          <a key={key} href={safe.href} className="underline decoration-rc-accent decoration-2 underline-offset-[6px] hover:decoration-rc-ink">
            {linkText}
          </a>,
        );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key} className="font-bold text-rc-ink">{bold}</strong>);
    } else {
      nodes.push(<em key={key}>{italic ?? underscored}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

export function Markdown({ source, className = '' }: { source: string; className?: string }) {
  const blocks = stripTags(source.replace(/\r\n?/g, '\n'))
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean);
  return (
    <div className={`space-y-5 ${className}`}>
      {blocks.map((block, b) => {
        const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
        if (lines.every(line => BULLET.test(line)) || lines.every(line => NUMBERED.test(line))) {
          const numbered = NUMBERED.test(lines[0]);
          const List = numbered ? 'ol' : 'ul';
          return (
            <List key={b} className={`space-y-2 pl-6 ${numbered ? 'list-decimal' : 'list-disc'} marker:text-rc-muted`}>
              {lines.map((line, l) => (
                <li key={l}>{inline(line.replace(numbered ? NUMBERED : BULLET, ''), `${b}-${l}`)}</li>
              ))}
            </List>
          );
        }
        return <p key={b}>{lines.map((line, l) => <Fragment key={l}>{l > 0 ? ' ' : null}{inline(line, `${b}-${l}`)}</Fragment>)}</p>;
      })}
    </div>
  );
}
