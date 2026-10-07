// Plain, readable emails in the club palette (spec 10). Every interpolated value is escaped.

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ESCAPES[char]);

export type Email = { subject: string; html: string; text: string };

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#0D0D0D;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;font-family:Archivo,Arial,sans-serif;color:#E5E8EB;">
    <p style="margin:0 0 32px;font-size:15px;font-weight:700;color:#FFFFFF;">Robotics Club, VIT Chennai</p>
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#FFFFFF;">${escapeHtml(title)}</h1>
    ${body}
    <p style="margin:40px 0 0;font-size:13px;color:#BFC7CE;">You're getting this because someone asked for it on the club's website. If it wasn't you, ignore it.</p>
  </div>
</body>
</html>`;
}

/** The "Find my certificates" link (valid 30 minutes). */
export function certificateLinkEmail({ link, count }: { link: string; count: number }): Email {
  const what = count === 1 ? 'your certificate' : `your ${count} certificates`;
  const title = 'Your certificates';
  const html = layout(
    title,
    `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Here's the link to ${escapeHtml(what)}. It works for 30 minutes.</p>
    <p style="margin:0 0 24px;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:14px 22px;border-radius:6px;background:#619AC3;color:#0D0D0D;font-weight:700;text-decoration:none;">See ${escapeHtml(what)}</a></p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#BFC7CE;">Or open this address: ${escapeHtml(link)}</p>`,
  );
  const text = `${title}\n\nHere's the link to ${what}. It works for 30 minutes:\n${link}\n\nIf you didn't ask for this, ignore it.\n`;
  return { subject: 'Your Robotics Club certificates', html, text };
}
