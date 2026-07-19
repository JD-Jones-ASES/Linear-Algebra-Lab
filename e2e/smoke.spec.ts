import { test, expect } from '@playwright/test';

test('home and primary nav', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /one matrix, four subspaces/i }),
  ).toBeVisible();
  const nav = page.getByRole('navigation', { name: /primary/i });
  const menu = page.getByRole('button', { name: /menu/i });
  if (await menu.isVisible()) {
    await menu.click();
  }
  for (const name of [
    /theorems/i,
    /connect/i,
    /glossary/i,
    /matrix/i,
    /spaces/i,
    /solve/i,
    /map/i,
  ]) {
    await expect(nav.getByRole('link', { name })).toBeVisible();
  }
});

test('spaces desk shows four subspace symbols', async ({ page }) => {
  await page.goto('/spaces?preset=strang');
  await expect(
    page.getByRole('heading', { name: /four fundamental subspaces/i }),
  ).toBeVisible();
  await expect(page.getByText('C(A)', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('N(A)', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('C(Aᵀ)', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('N(Aᵀ)', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('✓ rank–nullity')).toBeVisible();
});

test('glossary lists column space and deep link', async ({ page }) => {
  await page.goto('/glossary');
  await expect(page.getByRole('heading', { name: /^glossary$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^column space$/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /see it · spaces · c\(a\)/i })).toBeVisible();
});

test('glossary topic filter', async ({ page }) => {
  await page.goto('/glossary');
  // Wait for React island hydration before clicking filters
  await expect(page.locator('[data-glossary-ready="true"]')).toBeVisible();
  const topic = page.getByRole('group', { name: /filter by topic/i });
  const solve = topic.getByRole('button', { name: /^solve$/i });
  await solve.click();
  await expect(solve).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status')).toContainText(/topic solve/i);
  await expect(page.getByRole('heading', { name: /^consistent system$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^rref$/i })).toHaveCount(0);
});

test('theorem shelf lists four subspaces', async ({ page }) => {
  await page.goto('/theorems');
  await expect(page.getByRole('heading', { name: /theorem shelf/i })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /four fundamental subspaces/i }),
  ).toBeVisible();
});

test('solve desk consistent path', async ({ page }) => {
  await page.goto('/solve?preset=singular&b=in');
  await expect(page.getByRole('heading', { name: /solve a x = b/i })).toBeVisible();
  await expect(page.getByText('consistent', { exact: true }).first()).toBeVisible();
});

test('mobile nav opens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: /primary/i });
  const menu = nav.getByRole('button', { name: /^menu$/i });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: /^theorems$/i })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});
