import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      // Auto-updates the service worker in the background without prompting the user
      registerType: 'autoUpdate',

      // Manifest is already in public/manifest.json — don't generate a second one
      manifest: false,

      workbox: {
        // Pre-cache the full app shell on install
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Serve offline.html for any navigation request that fails (no network)
        navigateFallback: '/offline.html',

        // Only apply the offline fallback to actual page navigations, not API calls
        navigateFallbackAllowlist: [/^(?!\/__).*/],

        // Cache Google Fonts so the UI renders correctly offline
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // '@' resolves to webapp root — matches original Mind-Compass import style
      '@': path.resolve(__dirname, '.'),
    },
  },
});
