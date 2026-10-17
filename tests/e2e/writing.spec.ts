import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const GARBLER = 'Polay, Jacob. “Circumventing the Garbler.” Intersections 8, no. 1 (2025): 28.';

test('sections', async ({ page }) => {
  await page.goto('/writing');
  const pubs = page.locator('#publications li.entry');
  expect(await pubs.evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'reading-the-archive-by-machine',
    'circumventing-the-garbler',
  ]);
  const posts = page.locator('#public-scholarship li.entry');
  expect(await posts.evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'not-just-farming',
    'can-you-read-two-million-pages',
    'stop-choosing-tools',
    'ai-enabled-boom-in-document-transcription',
    'archive-is-not-a-toy',
  ]);
  await expect(page.locator('#public-scholarship')).toContainText('AI and Collaboration');
  await expect(posts.locator('details.cite')).toHaveCount(5);
  const talks = page.locator('#talks li.entry');
  expect(await talks.evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'fitting-machine-to-page',
    'reading-the-unreadable',
    'solving-ocr',
  ]);
});

test('series posts credit lead and contributing authors', async ({ page }) => {
  await page.goto('/writing');
  await expect(page.locator('#stop-choosing-tools .citation')).toContainText(
    'Polay, Jacob, Chloë Farr, and Jessica Jack. “Stop Choosing Tools. Start Building Them.” Active History (blog), September 30, 2026.',
  );
  await expect(page.locator('#not-just-farming .citation')).toContainText('Jack, Jessica, Chloë Farr, and Jacob Polay.');
  await expect(page.locator('#ai-enabled-boom-in-document-transcription a[href="https://activehistory.ca/blog/2026/09/23/ai-enabled-document-transcription/"]')).toHaveCount(1);
});

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false });
  test('cite no-js', async ({ page }) => {
    await page.goto('/writing');
    const cite = page.locator('#circumventing-the-garbler details.cite');
    await cite.locator('summary').click();
    await expect(cite.locator('.cite-text')).toHaveText(GARBLER);
  });
});

test('cite copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/writing');
  const cite = page.locator('#circumventing-the-garbler details.cite');
  await cite.locator('summary').click();
  await cite.getByRole('button', { name: 'Copy' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(GARBLER);
  await expect(cite.locator('[aria-live]')).toHaveText('Copied');
});

test('bibtex download', async ({ page }) => {
  await page.goto('/writing');
  const cite = page.locator('#archive-is-not-a-toy details.cite');
  await cite.locator('summary').click();
  const [download] = await Promise.all([page.waitForEvent('download'), cite.getByRole('link', { name: /BibTeX/ }).click()]);
  expect(download.suggestedFilename()).toBe('polay2026archive.bib');
  const text = await readFile((await download.path())!, 'utf8');
  expect(text.startsWith('@online{polay2026archive,')).toBe(true);
  expect(text).toContain('Chloë');
});

test('cite panel is styled', async ({ page }) => {
  await page.goto('/writing');
  const cite = page.locator('#circumventing-the-garbler details.cite');
  await expect(cite.locator('summary')).toHaveCSS('border-top-style', 'solid');
  await cite.locator('summary').click();
  const bg = await cite.locator('.cite-body').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});

test('copying twice announces both times', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/writing');
  const cite = page.locator('#circumventing-the-garbler details.cite');
  await cite.locator('summary').click();
  await cite.locator('[aria-live]').evaluate((el) => {
    (window as any).__statuses = [];
    new MutationObserver(() => (window as any).__statuses.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true });
  });
  const copy = cite.getByRole('button', { name: 'Copy' });
  await copy.click();
  await expect(cite.locator('[aria-live]')).toHaveText('Copied');
  await copy.click();
  await expect.poll(() => page.evaluate(() => (window as any).__statuses)).toEqual(['Copied', '', 'Copied']);
});
