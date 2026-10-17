import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const GARBLER = 'Polay, Jacob. "Circumventing the Garbler." Intersections 8, no. 1 (2025): 28.';

test('sections', async ({ page }) => {
  await page.goto('/writing');
  const pubs = page.locator('#publications li.entry');
  await expect(pubs).toHaveCount(3);
  expect(await pubs.evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'archive-is-not-a-toy',
    'reading-the-archive-by-machine',
    'circumventing-the-garbler',
  ]);
  await expect(page.locator('#public-scholarship')).toContainText('AI and Collaboration');
  const talks = page.locator('#talks li.entry');
  expect(await talks.evaluateAll((els) => els.map((e) => e.id))).toEqual([
    'fitting-machine-to-page',
    'reading-the-unreadable',
    'solving-ocr',
  ]);
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
