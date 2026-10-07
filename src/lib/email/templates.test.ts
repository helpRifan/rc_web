import { describe, expect, it } from 'vitest';
import { certificateLinkEmail, escapeHtml } from './templates';

describe('certificateLinkEmail', () => {
  it('escapes everything it interpolates', () => {
    const { html } = certificateLinkEmail({ link: 'https://example.com/?a="1"&b=<script>alert(1)</script>', count: 2 });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;1&quot;&amp;b=');
  });

  it('counts the certificates in plain words', () => {
    expect(certificateLinkEmail({ link: 'https://example.com/x', count: 1 }).text).toContain('the link to your certificate.');
    expect(certificateLinkEmail({ link: 'https://example.com/x', count: 3 }).html).toContain('your 3 certificates');
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML specials', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });
});
