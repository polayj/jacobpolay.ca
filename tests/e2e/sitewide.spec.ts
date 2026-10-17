import { test, expect, type APIRequestContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function sitePaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  return [...xml.matchAll(/<loc>https:\/\/jacobpolay\.ca([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
}

test('sitemap lists every page', async ({ request }) => {
  const paths = await sitePaths(request);
  for (const p of ['/', '/research/', '/projects/', '/writing/', '/cv/', '/now/', '/projects/toolbox/']) {
    expect(paths.map((x) => (x.endsWith('/') ? x : `${x}/`))).toContain(p);
  }
});

test('internal links', async ({ page, request }) => {
  test.setTimeout(120_000);
  const status = new Map<string, number>();
  const broken: string[] = [];
  for (const path of await sitePaths(request)) {
    await page.goto(path);
    const refs = await page.evaluate(() =>
      [
        ...Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) => a.getAttribute('href')!),
        ...Array.from(document.querySelectorAll('link[href]')).map((l) => l.getAttribute('href')!),
        ...Array.from(document.querySelectorAll('img[src], script[src]')).map((e) => e.getAttribute('src')!),
      ].filter((h) => h.startsWith('/') || h.startsWith('#')),
    );
    for (const ref of refs) {
      const url = new URL(ref, new URL(path, 'http://localhost:4321'));
      const target = url.pathname;
      if (!status.has(target)) status.set(target, (await request.get(target)).status());
      if (status.get(target) !== 200) broken.push(`${path} → ${ref} (${status.get(target)})`);
      if (url.hash && url.hash.length > 1) {
        const html = await (await request.get(target)).text();
        const id = decodeURIComponent(url.hash.slice(1));
        if (!html.includes(`id="${id}"`)) broken.push(`${path} → ${ref} (no element with id "${id}")`);
      }
    }
  }
  expect(broken).toEqual([]);
});

test('axe on every page, light and dark', async ({ page, request }) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    for (const path of await sitePaths(request)) {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')) {
        problems.push(`${scheme} ${path} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      }
    }
  }
  expect(problems).toEqual([]);
});

test('no horizontal scroll at 360px', async ({ page, request }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 360, height: 740 });
  const wide: string[] = [];
  for (const path of await sitePaths(request)) {
    await page.goto(path);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    if (w > 360) wide.push(`${path}: ${w}px`);
  }
  expect(wide).toEqual([]);
});

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false });
  test('no-js render', async ({ page, request }) => {
    test.setTimeout(120_000);
    const thin: string[] = [];
    for (const path of await sitePaths(request)) {
      await page.goto(path);
      const len = (await page.locator('main').innerText()).trim().length;
      if (len <= 200) thin.push(`${path}: ${len} chars`);
    }
    expect(thin).toEqual([]);
  });
});

test('no third parties', async ({ page, request }) => {
  test.setTimeout(120_000);
  const foreign = new Set<string>();
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith('http') && u.host !== 'localhost:4321') foreign.add(`${u.host} (${r.url()})`);
  });
  for (const path of await sitePaths(request)) await page.goto(path, { waitUntil: 'networkidle' });
  expect([...foreign]).toEqual([]);
});

test('sitemap, canonical and served URLs agree without trailing slashes', async ({ page, request }) => {
  const paths = await sitePaths(request);
  const slashed = paths.filter((p) => p !== '/' && p.endsWith('/'));
  expect(slashed).toEqual([]);
  for (const path of paths) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href'), path).toBe(`https://jacobpolay.ca${path}`);
  }
});
