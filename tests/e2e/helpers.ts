import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/** Axe violations a reviewer must fix: serious and critical only. Returns ids for readable failures. */
export async function seriousAxeViolations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${v.id}: ${v.help}`);
}

/** Pixels the page scrolls sideways (0 or less means no horizontal overflow). */
export function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
