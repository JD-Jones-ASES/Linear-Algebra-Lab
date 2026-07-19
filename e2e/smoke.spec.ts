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
    /project/i,
    /basis/i,
    /eigen/i,
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

test('glossary catalog renders every term and only real topic chips', async ({
  page,
}) => {
  const { GLOSSARY, GLOSSARY_TAG_ORDER } = await import(
    '../src/lib/connect/glossary'
  );

  // Structural guard: TAG_ORDER must be tags only (never nested term objects).
  expect(GLOSSARY_TAG_ORDER.every((t) => typeof t === 'string')).toBe(true);
  expect(GLOSSARY.length).toBeGreaterThanOrEqual(30);

  await page.goto('/glossary');
  await expect(page.locator('[data-glossary-ready="true"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: /^glossary$/i })).toBeVisible();

  // All + one chip per tag — blank object-chips were the live corruption symptom.
  const chips = page.locator('.glossary-filters__chips .glossary-filter');
  await expect(chips).toHaveCount(1 + GLOSSARY_TAG_ORDER.length);

  for (const term of GLOSSARY) {
    await expect(page.locator(`#${term.id}`)).toBeVisible();
  }
  await expect(
    page.getByRole('link', { name: /see it · spaces · c\(a\)/i }),
  ).toBeVisible();
});

test('glossary topic filter', async ({ page }) => {
  await page.goto('/glossary');
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

test('project desk shows residual checks', async ({ page }) => {
  await page.goto('/project?preset=singular&b=out');
  await expect(page.getByRole('heading', { name: /project · least squares/i })).toBeVisible();
  await expect(page.getByText('✓ Aᵀ r = 0')).toBeVisible();
  await expect(page.getByText('Display scale uses float', { exact: false }).or(page.getByText('drag to orbit', { exact: false })).first()).toBeVisible();
});

test('matrix editor changes rank', async ({ page }) => {
  await page.goto('/matrix?preset=id2');
  await expect(page.locator('[data-rank]')).toHaveAttribute('data-rank', '2');
  // Wait for React island hydration — fill before ready ignores React state
  await expect(page.locator('[data-editor-ready="true"]')).toBeVisible();
  const editor = page.locator('[data-matrix-editor="true"]');
  for (const label of [
    'Entry row 1 column 1',
    'Entry row 1 column 2',
    'Entry row 2 column 1',
    'Entry row 2 column 2',
  ]) {
    await editor.getByLabel(label).fill('0');
  }
  await editor.getByRole('button', { name: /^apply$/i }).click();
  await expect(page.locator('[data-rank]')).toHaveAttribute('data-rank', '0');
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

test('codomain 2d viz stays visible', async ({ page }) => {
  await page.goto('/spaces?preset=strang');
  const img = page.locator('[data-viz2d="true"] svg');
  await expect(img).toBeVisible();
  await page.waitForTimeout(600);
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute('role', 'img');
});

test('codomain 3d viz stays mounted', async ({ page }) => {
  await page.goto('/spaces?preset=tall');
  const wrap = page.locator('[data-viz3d="true"]');
  await expect(wrap).toBeVisible();
  // Wait for dynamic three import + paint
  await expect(wrap.locator('canvas')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(800);
  await expect(wrap.locator('canvas')).toBeVisible();
});


test('eigen desk shows pairs', async ({ page }) => {
  await page.goto('/eigen?preset=eigen-sym');
  await expect(page.getByRole('heading', { name: /^eigen$/i })).toBeVisible();
  await expect(page.getByText(/λ = /).first()).toBeVisible();
  await expect(page.getByText('✓ A v = λ v')).toBeVisible();
});

test('basis desk invertibility', async ({ page }) => {
  await page.goto('/basis?preset=basis-rot');
  await expect(page.getByRole('heading', { name: /basis · coordinates/i })).toBeVisible();
  await expect(page.getByText('yes', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('✓ P P⁻¹ = I')).toBeVisible();
});

test('basis desk loads without preset query', async ({ page }) => {
  // Must not crash when deep-link fallback would otherwise use Strang (2×3)
  await page.goto('/basis');
  await expect(page.getByRole('heading', { name: /basis · coordinates/i })).toBeVisible();
  await expect(page.getByText('yes', { exact: true }).first()).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByRole('heading', { name: /basis · coordinates/i })).toBeVisible();
});

test('url matrix deep link loads', async ({ page }) => {
  await page.goto('/matrix?A=1,0;0,1');
  await expect(page.locator('[data-rank]')).toHaveAttribute('data-rank', '2');
  await expect(page.getByText(/URL matrix|Custom/i).first()).toBeVisible();
});


test('affine theorem deep link lands on solve', async ({ page }) => {
  await page.goto(
    '/solve?preset=strang&b=in&thm=affine-solution&note=' +
      encodeURIComponent('Underdetermined: line of solutions.'),
  );
  await expect(page.getByRole('heading', { name: /solve a x = b/i })).toBeVisible();
  await expect(page.getByText('consistent', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/affine solution set/i).first()).toBeVisible();
});


test('det area demo preset shows parallelogram', async ({ page }) => {
  await page.goto('/matrix?preset=area2');
  await expect(page.locator('[data-det-area="true"]')).toBeVisible();
  await expect(page.getByText(/det A =/i).first()).toBeVisible();
});

test('editable b on solve', async ({ page }) => {
  await page.goto('/solve?preset=id2&b=in');
  await expect(page.locator('[data-vector-editor="true"]')).toBeVisible();
  await expect(page.locator('[data-editor-ready="true"]').first()).toBeVisible();
  const ed = page.locator('[data-vector-editor="true"]');
  await ed.getByLabel('b entry 1').fill('3');
  await ed.getByLabel('b entry 2').fill('4');
  await ed.getByRole('button', { name: /apply b/i }).click();
  await expect(page.getByText('consistent', { exact: true }).first()).toBeVisible();
});

test('share bar present on matrix', async ({ page }) => {
  await page.goto('/matrix?preset=strang');
  await expect(page.locator('[data-share-bar="true"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible();
});
