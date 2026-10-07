import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown, safeHref } from './markdown';

describe('Markdown', () => {
  it('renders paragraphs, lists, bold, italic and links', () => {
    const { container } = render(
      <Markdown source={'Bring your **own robot**, and _test_ it.\n\n- Weight under 2 kg\n- Wired or wireless\n\n1. Register\n2. Build\n\nRules on [the rulebook](https://example.com/rules).'} />,
    );
    expect(container.querySelectorAll('p')).toHaveLength(2);
    expect(container.querySelector('strong')).toHaveTextContent('own robot');
    expect(container.querySelector('em')).toHaveTextContent('test');
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
    // jsdom drops the space before the hidden "(opens in a new tab)"; browsers keep it.
    const link = screen.getByRole('link', { name: /^the rulebook ?\(opens in a new tab\)$/ });
    expect(link).toHaveAttribute('href', 'https://example.com/rules');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('drops raw HTML, so a script tag never reaches the page', () => {
    const { container } = render(<Markdown source={'Hello <script>alert(1)</script> there <img src=x onerror=alert(1)>'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.innerHTML).not.toContain('<script');
    expect(container).toHaveTextContent('Hello alert(1) there');
  });

  it('turns javascript:, data: and http: links into plain text', () => {
    render(<Markdown source={'[one](javascript:alert(1)) [two](data:text/html,x) [three](http://example.com)'} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText(/one/)).toBeInTheDocument();
  });

  it('keeps links to pages on this site, in the same tab', () => {
    render(<Markdown source={'See [the team](/team).'} />);
    const link = screen.getByRole('link', { name: 'the team' });
    expect(link).toHaveAttribute('href', '/team');
    expect(link).not.toHaveAttribute('target');
  });
});

describe('safeHref', () => {
  it('refuses protocol-relative URLs', () => {
    expect(safeHref('//evil.example')).toBeNull();
    expect(safeHref('/certificates')).toEqual({ href: '/certificates', external: false });
  });
});
