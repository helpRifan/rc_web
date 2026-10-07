// Prints each badge's two faces onto its atlas canvas, and the strap, for the WebGL badges.
// Client only. One face at a time, between idle callbacks, so the page stays responsive.
import { photoUrl } from '@/lib/members/display';
import { badgeFamily, composeAtlas, drawBadgeBack, drawBadgeFront, drawStrapCanvas, loadImage, qrModules, qrTarget } from './badge-art';
import type { BadgeData } from './badge-face';

export type BadgePrints = { atlases: HTMLCanvasElement[]; strap: HTMLCanvasElement };

/** Lets the browser breathe between badges (10 to 20ms of drawing each). */
const nextIdle = () =>
  new Promise<void>(resolve => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 300 });
    else setTimeout(resolve, 16);
  });

export async function printBadges(badges: BadgeData[]): Promise<BadgePrints> {
  const family = await badgeFamily();
  const [logo, ...photos] = await Promise.all([
    loadImage('/logo.png'),
    ...badges.map(badge => (badge.photo ? loadImage(photoUrl(badge.photo, { w: 640, h: 553 })) : Promise.resolve(null))),
  ]);
  const atlases: HTMLCanvasElement[] = [];
  for (const [i, badge] of badges.entries()) {
    await nextIdle();
    const target = qrTarget(process.env.NEXT_PUBLIC_SITE_URL, badge.slug);
    const assets = { family, logo, photo: photos[i], qr: target ? qrModules(target) : null };
    atlases.push(
      composeAtlas(
        (ctx, w, h) => drawBadgeFront(ctx, w, h, badge, assets),
        (ctx, w, h) => drawBadgeBack(ctx, w, h, badge, assets),
      ),
    );
  }
  return { atlases, strap: drawStrapCanvas(family, logo) };
}
