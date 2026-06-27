import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Rescate Infantil Venezuela',
        short_name: 'Rescate VE',
        description: 'Sistema de registro y búsqueda de niños y niñas rescatados en Venezuela — Emergencia Nacional',
        theme_color: '#FFD100',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        lang: 'es',
        orientation: 'portrait-primary',
        categories: ['utilities', 'social'],
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/search/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-search',
              expiration: { maxEntries: 20, maxAgeSeconds: 5 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/search\/stats/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-stats',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /\/uploads\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'photos',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
