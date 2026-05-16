// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tibiaplan.com',
  integrations: [
    sitemap({
      // Stamp every URL with the build date as <lastmod>. Google uses this
      // signal to decide when to recrawl. Per-file git-history granularity
      // would be nicer but a single build-time date is plenty for our
      // cadence and adds zero maintenance burden.
      lastmod: new Date(),
      // changefreq/priority are de facto ignored by Google but Bing/Yandex
      // still honor them — costs nothing to emit.
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
