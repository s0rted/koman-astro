// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.komanlake.com',
  output: 'static',
  compressHTML: true,
  integrations: [react(), sitemap({
    filter: (page) => {
      // Root `/` is an English alias of `/en/` — keep only localized homes in the sitemap.
      const url = page.replace(/\/$/, '');
      return url !== 'https://www.komanlake.com';
    },
  })],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['framer-motion', 'lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-framer': ['framer-motion'],
            'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          }
        }
      }
    }
  },
});