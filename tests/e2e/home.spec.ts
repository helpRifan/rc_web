import { expect, test } from '@playwright/test';
import { horizontalOverflow } from './helpers';

// Fixtures: no upcoming events, no certificate stats and no partners; recruitment is closed.

test('home summarises the club and hides the sections without content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Robotics Club' })).toBeVisible();
  for (const name of ['About the club', 'What we do', 'Latest photos', 'Build robots with us.']) {
    await expect(page.getByRole('region', { name })).toHaveCount(1);
  }
  for (const name of ['Coming up', 'Partners']) await expect(page.getByRole('region', { name })).toHaveCount(0);
});

test('scrolling the hero grows the club reel until it fills the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const reel = page.locator('.hero-reel');
  await expect(reel).toHaveCSS('opacity', '0');
  const span = await page.locator('.hero-track').evaluate(el => (el as HTMLElement).offsetHeight - window.innerHeight);
  await page.evaluate(y => window.scrollTo(0, y), span);
  await expect(reel).toHaveCSS('opacity', '1');
  await expect(reel).toHaveCSS('clip-path', /inset\(0(px|%)/);
  const video = page.locator('.hero-reel video');
  await expect(video).toHaveAttribute('src', /reel-wide(\.av1)?\.mp4$/);
  await expect.poll(() => video.evaluate(v => !(v as HTMLVideoElement).paused)).toBe(true);

  await page.getByRole('button', { name: 'Pause video' }).click();
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).paused)).toBe(true);
  await expect(page.getByRole('button', { name: 'Play video' })).toBeVisible();
});

test('what we do rows are links, and hovering one runs its marquee', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'What we do' });
  const links = section.getByRole('link');
  await expect(links).toHaveCount(4);
  await links.nth(1).hover();
  await expect(section.locator('.flowing-menu-row').nth(1)).toHaveAttribute('data-open', 'true');
});

test('a photo on the wall opens the viewer in place, and Escape returns focus to it', async ({ page }) => {
  await page.goto('/');
  const photos = page.getByRole('region', { name: 'Latest photos' }).getByRole('button', { name: /^Open photo/ });
  expect(await photos.count()).toBeGreaterThan(5);
  await photos.first().focus();
  await page.keyboard.press('Enter');
  const viewer = page.getByRole('dialog');
  await expect(viewer).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(photos.first()).toBeFocused();
});

test('nothing on home scrolls sideways on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  for (const name of ['About the club', 'What we do', 'Latest photos']) {
    await page.getByRole('region', { name }).scrollIntoViewIfNeeded();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('keeps the hero to one still screen, with no reel', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Robotics Club');
    await expect(page.locator('.hero-track')).toHaveCount(0);
    await expect(page.locator('.hero-reel')).toHaveCount(0);
  });
});
