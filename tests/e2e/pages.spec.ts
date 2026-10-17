import { test, expect } from '@playwright/test';
import { NAV } from './helpers/site';

test('research', async ({ page }) => {
  await page.goto('/research');
  const headings = page.locator('main h2');
  await expect(headings).toHaveText([
    /medicinal commodities/i,
    /NLP and GraphRAG/i,
    /OCR benchmarking/i,
  ]);
  const jim = page.locator('main a[href="https://jimclifford.ca/"]');
  await expect(jim).toHaveText('Dr. Jim Clifford');
  await expect(page.locator('main')).toContainText('Professor of History');
  const training = page.locator('.training');
  await expect(training).toContainText('History of Capitalism');
  await expect(training).toContainText('History of Medicine');
});

test('no SSHRC anywhere', async ({ page }) => {
  for (const { href } of NAV) {
    await page.goto(href);
    await expect(page.locator('body'), href).not.toContainText(/SSHRC/i);
  }
});

test('cv', async ({ page, request }) => {
  await page.goto('/cv');
  const pdf = page.getByRole('link', { name: 'Download PDF' });
  await expect(pdf).toHaveAttribute('href', '/Polay_Jacob_CV.pdf');
  const res = await request.get('/Polay_Jacob_CV.pdf');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
  const edu = page.locator('#education');
  await expect(edu).toContainText('Doctor of Philosophy, History');
  await expect(edu).toContainText('Master of Arts, History');
  await expect(edu).toContainText('Loud Yet Invisible: A Humanist-Designed Pipeline for Unlocking the Early Modern Archive');
  await expect(edu).toContainText('Bachelor of Arts, First Class Honours, History');
  await expect(page.locator('#publications li')).toHaveCount(2);
  await expect(page.locator('#public-scholarship li')).toHaveCount(5);
  const talks = page.locator('#presentations li');
  await expect(talks).toHaveCount(3);
  await expect(talks.first()).toContainText('Fitting Machine to Page');
  await expect(page.locator('#experience li.job')).toHaveCount(5);
  await expect(page.locator('#awards li')).toHaveCount(5);
  await expect(page.locator('#awards')).toContainText('Terrance L. Cameron Award');
});

test('now', async ({ page }) => {
  await page.goto('/now');
  await expect(page.locator('main')).toContainText('Updated 16 October 2026');
  await expect(page.locator('main')).toContainText('Comprehensive exams');
  await expect(page.locator('main')).toContainText('Footnotes on Film');
});

test('catchwords', async ({ page }) => {
  const chain: [string, string][] = [
    ['/research', '/projects'],
    ['/projects', '/writing'],
    ['/writing', '/cv'],
    ['/cv', '/now'],
    ['/now', '/'],
  ];
  for (const [from, to] of chain) {
    await page.goto(from);
    await expect(page.locator('.catchword a'), from).toHaveAttribute('href', to);
  }
});

test('the AHA talk is credited to Jacob alone', async ({ page }) => {
  for (const path of ['/writing', '/cv', '/projects']) {
    await page.goto(path);
    await expect(page.locator('body'), path).not.toContainText('Pemberton');
  }
});
