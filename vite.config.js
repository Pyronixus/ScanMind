import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 1. Chemin de base obligatoire pour GitHub Pages (https://pyronixus.github.io/ScanMind/)
  base: '/ScanMind/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'ScanMind',
        short_name: 'ScanMind',
        description: 'Scannez, organisez et révisez vos fiches avec IA',
        theme_color: '#FFFFFF',
        background_color: '#F7F7F5',
        display: 'standalone',
        // 2. Adaptation du scope et start_url du manifest pour le sous-dossier /ScanMind/
        scope: '/ScanMind/',
        start_url: '/ScanMind/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 20 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    minify: 'terser'
  },
  esbuild: {
    target: 'esnext'
  }
})