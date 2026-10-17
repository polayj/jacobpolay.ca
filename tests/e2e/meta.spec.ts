import { test, expect } from '@playwright/test';
import { NAV } from './helpers/site';

test('og tags', async ({ page }) => {
  for (const { href } of NAV) {
    await page.goto(href);
    const meta = (sel: string) => page.locator(`head meta[${sel}]`).getAttribute('content');
    expect(await meta('property="og:title"'), href).toBeTruthy();
    expect(await meta('property="og:description"'), href).toBeTruthy();
    expect(await meta('property="og:image"'), href).toBe('https://jacobpolay.ca/og.png');
    expect(await meta('name="twitter:card"'), href).toBe('summary_large_image');
    const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
    expect(canonical, href).toBe(new URL(href, 'https://jacobpolay.ca').href);
  }
});

test('og image', async ({ request }) => {
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  const buf = await res.body();
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect(buf.readUInt32BE(16)).toBe(1200);
  expect(buf.readUInt32BE(20)).toBe(630);
});

const jsonLd = (page: import('@playwright/test').Page) =>
  page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent!)));

test('json-ld person', async ({ page }) => {
  await page.goto('/');
  const person = (await jsonLd(page)).find((d) => d['@type'] === 'Person');
  expect(person.name).toBe('Jacob Polay');
  expect(person.affiliation.name).toBe('University of Saskatchewan');
  expect(person.sameAs).toEqual(
    expect.arrayContaining([
      'https://orcid.org/0009-0001-9217-5531',
      'https://bsky.app/profile/historyjacob.bsky.social',
      'https://github.com/polayj',
    ]),
  );
});

test('json-ld articles', async ({ page }) => {
  await page.goto('/writing');
  const articles = (await jsonLd(page)).filter((d) => d['@type'] === 'ScholarlyArticle');
  expect(articles.map((a) => a.headline).sort()).toEqual([
    'Circumventing the Garbler',
    'Reading the Archive by Machine: An OCR Benchmark for Historians, 1612–1921',
    'The Archive is Not a Toy: The Hidden Problems of a "Vintage" AI',
  ]);
});

test('feeds', async ({ request }) => {
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
  const rss = await request.get('/rss.xml');
  expect(rss.status()).toBe(200);
  expect(((await rss.text()).match(/<item>/g) ?? []).length).toBe(3);
});

test('favicons', async ({ page, request }) => {
  await page.goto('/');
  for (const href of ['/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png']) {
    await expect(page.locator(`head link[href="${href}"]`), href).toHaveCount(1);
    expect((await request.get(href)).status(), href).toBe(200);
  }
});
