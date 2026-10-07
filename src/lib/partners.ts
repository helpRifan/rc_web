/**
 * A partner's logo URL when it's a transparent format (SVG or PNG), which the site shows as a white
 * silhouette so no other brand's hue enters the palette. Anything else shows the name instead.
 */
export function usableLogo(partner: { logo_url: string | null }): string | null {
  if (!partner.logo_url) return null;
  try {
    return /\.(svg|png)$/i.test(new URL(partner.logo_url).pathname) ? partner.logo_url : null;
  } catch {
    return null;
  }
}
