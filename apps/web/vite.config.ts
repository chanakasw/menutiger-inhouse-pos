import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'SwiftPOS',
        short_name: 'SwiftPOS',
        description: 'Offline-first Point of Sale system',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/checkout',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache API product/category reads — stale-while-revalidate
            urlPattern: /\/api\/(products|categories)/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-catalog', expiration: { maxAgeSeconds: 60 * 60 * 24 } },
          },
          {
            // All other API calls — network first, fall back to cache
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-runtime', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
