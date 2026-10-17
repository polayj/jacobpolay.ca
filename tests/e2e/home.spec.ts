import { test, expect, type Page } from '@playwright/test';
import { TAGLINE, blockStorage } from './helpers/site';

const done = (page: Page, timeout = 15_000) => page.locator('[data-hero="done"]').waitFor({ timeout });

test('hero final state', async ({ page }) => {
  await page.goto('/');
  await done(page);
  const tx = page.locator('.transcript');
  await expect(tx.locator('h1')).toHaveText('Jacob Polay');
  await expect(tx.locator('.ttag')).toHaveText(TAGLINE);
  const types = await tx.locator('.ent').evaluateAll((els) => els.map((e) => e.getAttribute('data-type')));
  expect(types).toEqual(['person', 'place', 'org', 'place', 'date']);
});

test('hero facsimile', async ({ page }) => {
  await page.goto('/');
  const fx = page.locator('.facsimile');
  await expect(fx).toHaveAttribute('aria-hidden', 'true');
  for (const word of ['Iacob Polay', 'Hiſtorian', 'Vniverſity']) await expect(fx).toContainText(word);
});

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false });
  test('hero no-js', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.transcript .ttag')).toBeVisible();
    await expect(page.locator('.transcript .ttag')).toHaveText(TAGLINE);
    await expect(page.locator('.transcript h1')).toHaveCSS('opacity', '1');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('hero reduced-motion', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__sawAnimation = false;
      new MutationObserver((records) => {
        for (const r of records) {
          const el = r.target as Element;
          if (el.classList?.contains('box') || el.classList?.contains('show-label')) (window as any).__sawAnimation = true;
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
    });
    await page.goto('/');
    await done(page, 300);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as any).__sawAnimation)).toBe(false);
  });
});

test('hero once per session', async ({ page }) => {
  await page.goto('/');
  await done(page);
  await page.goto('/research');
  await page.goto('/');
  await done(page, 300);
});

test('hero storage-blocked', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(blockStorage('sessionStorage'));
  await page.goto('/');
  await done(page);
  expect(errors).toEqual([]);
});

test('ner labels clear of text', async ({ page }) => {
  await page.goto('/');
  await page.locator('.transcript .ent.show-label').last().waitFor({ timeout: 15_000 });
  const overlaps = await page.evaluate(() => {
    const block = document.querySelector('.transcript')!;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const textRects: DOMRect[] = [];
    while (walker.nextNode()) {
      const n = walker.currentNode as Text;
      if (!n.nodeValue?.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      textRects.push(...Array.from(r.getClientRects()));
    }
    const bad: string[] = [];
    for (const ent of Array.from(block.querySelectorAll<HTMLElement>('.ent'))) {
      const e = ent.getBoundingClientRect();
      const cs = getComputedStyle(ent, '::before');
      const h = parseFloat(cs.height) + parseFloat(cs.marginBottom || '0');
      const label = { left: e.left, right: e.left + parseFloat(cs.width), top: e.top - h, bottom: e.top };
      for (const t of textRects) {
        if (t.bottom > e.top + 1) continue; // only lines above the entity
        const hit = t.left < label.right && t.right > label.left && t.top < label.bottom && t.bottom > label.top;
        if (hit) bad.push(`${ent.textContent} label overlaps text at y=${Math.round(t.top)}`);
      }
    }
    return bad;
  });
  expect(overlaps).toEqual([]);
});

test('ner hover and links', async ({ page }) => {
  await page.goto('/');
  await done(page);
  const org = page.locator('.transcript .ent[data-type="org"]');
  await org.hover();
  await expect.poll(() => org.evaluate((el) => getComputedStyle(el, '::before').opacity)).toBe('1');
  const hrefs = await page.locator('.transcript .ent').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  expect(hrefs).toEqual(['#about', '/research', '/cv', null, '/now']);
});

test('about and recent', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about')).toContainText('PhD student in the Department of History');
  const recent = page.locator('.recent li');
  await expect(recent).toHaveCount(4);
  await expect(recent.first()).toContainText('Fitting Machine to Page');
  await expect(page.locator('.catchword a')).toHaveAttribute('href', '/research');
});

test('headshot omitted', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#about img')).toHaveCount(0);
});

test('screen readers get the plain transcription', async ({ page }) => {
  await page.goto('/');
  await done(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Jacob Polay');
  for (const name of ['Atlantic world', 'University of Saskatchewan', '2026']) {
    await expect(page.locator('.transcript').getByRole('link', { name, exact: true })).toHaveCount(1);
  }
});
