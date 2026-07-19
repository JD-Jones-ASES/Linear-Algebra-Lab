import { test, expect } from '@playwright/test';
import { THEOREMS } from '../src/lib/connect/theorems';

/**
 * Every theorem's first stop must land with visible workshop content (no blank island).
 */
for (const thm of THEOREMS) {
  if (!thm?.stops?.length) continue;
  const stop = thm.stops[0]!;
  test(`theorem first stop: ${thm.id} → ${stop.label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(stop.href);
    // Main workshop heading or recovery UI — never empty main
    await expect(page.locator('#main')).not.toBeEmpty();
    await expect(
      page.locator('.workshop h1, .workshop [role="alert"] h1').first(),
    ).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(400);
    expect(errors, errors.join('\n')).toEqual([]);
    await expect(page.locator('.workshop h1, .workshop [role="alert"] h1').first()).toBeVisible();
  });
}
