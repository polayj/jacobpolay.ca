import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jacobpolay.ca',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
