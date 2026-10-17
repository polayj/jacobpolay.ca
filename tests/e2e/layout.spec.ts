import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { NAV, LAND_ACK, COLOPHON, PROFILES, blockStorage } from './helpers/site';

test('nav links resolve', async ({ page }) => {
  for (const { href } of NAV) {
    const res = await page.goto(href);
    expect(res?.status(), href).toBe(200);
    await expect(page.locator('h1'), href).toHaveCount(1);
  }
});

test('nav marks current page', async ({ page }) => {
  await page.goto('/research');
  await expect(page.locator('nav[aria-label="Primary"] a[aria-current="page"]')).toHaveText('Research');
});

test('footer content', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer.site-footer');
  await expect(footer).toContainText(LAND_ACK);
  await expect(footer).toContainText(COLOPHON);
  for (const href of PROFILES) await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
});

test('theme toggle persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: /dark mode/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('theme storage-blocked', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(blockStorage('localStorage'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: /dark mode/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('404', async ({ page }) => {
  const res = await page.goto('/nope');
  expect(res?.status()).toBe(404);
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`axe home ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page }).analyze();
    const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  });
}
