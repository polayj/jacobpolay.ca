import { test, expect } from '@playwright/test';
import { blockStorage } from './helpers/site';

const SLUGS = ['toolbox', 'earlymodernner', 'ocr-benchmark', 'ai-and-collaboration', 'footnotes-on-film'];

test('default desktop graph', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/projects');
  await expect(page.locator('svg.project-graph')).toBeVisible();
  await expect(page.locator('.list-view')).toBeHidden();
  await expect(page.locator('.node[data-id="project:toolbox"]')).toHaveClass(/featured/);
});

test('default phone list', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/projects');
  await expect(page.locator('.list-view')).toBeVisible();
  await expect(page.locator('svg.project-graph')).toBeHidden();
});

test('toggle remembers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/projects');
  const list = page.getByRole('button', { name: 'List' });
  await list.click();
  await expect(list).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Graph' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.list-view')).toBeVisible();
  await page.reload();
  await expect(page.locator('.list-view')).toBeVisible();
  await expect(page.locator('svg.project-graph')).toBeHidden();
});

test('projects storage-blocked', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(blockStorage('localStorage'));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/projects');
  await page.getByRole('button', { name: 'List' }).click();
  await expect(page.locator('.list-view')).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false });
  test('projects no-js', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/projects');
    await expect(page.locator('.list-view')).toBeVisible();
    await expect(page.locator('.view-toggle')).toBeHidden();
    await expect(page.locator('.list-view .card h2').first()).toHaveText("The Digital Historian's Toolbox");
  });
});

test('graph keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Graph' }).focus();
  let onNode = false;
  for (let i = 0; i < 4 && !onNode; i++) {
    await page.keyboard.press('Tab');
    onNode = await page.evaluate(() => !!document.activeElement?.closest('.node'));
  }
  expect(onNode).toBe(true);
  const focused = page.locator('.node:focus');
  const href = await focused.getAttribute('href');
  expect(await page.locator('.node.lit').count()).toBeGreaterThan(1);
  await page.keyboard.press('Enter');
  await page.waitForURL((u) => u.pathname.replace(/\/$/, '') + u.hash === href);
});

for (const slug of SLUGS) {
  test(`project page ${slug}`, async ({ page }) => {
    const res = await page.goto(`/projects/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.project-meta')).toContainText(/Status/);
    await expect(page.locator('.project-meta')).toContainText(/Role/);
    for (const a of await page.locator('.related a').all()) {
      expect(await a.getAttribute('href')).toMatch(/^\/(writing#|projects\/)/);
    }
  });
}
