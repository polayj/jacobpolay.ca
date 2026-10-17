import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

it('Cloudflare serves pages without a trailing slash, matching the sitemap', () => {
  const raw = readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const config = JSON.parse(raw);
  expect(config.assets.html_handling).toBe('drop-trailing-slash');
  expect(config.assets.not_found_handling).toBe('404-page');
});
