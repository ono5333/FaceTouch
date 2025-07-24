import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/wp-content/uploads/games/okaopetipeti/',  // https://stablesoft0801.com/wp-content/uploads/games/okaopetipeti/
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/static\.line-scdn\.net\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'liff-sdk-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'おかおぺちぺち',
        short_name: 'おかおぺちぺち',
        description: '1分間の顔クリックゲーム by Stableソフト',
        theme_color: '#ff6b6b',
        background_color: '#ff6b6b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/wp-content/uploads/games/okaopetipeti/',
        start_url: '/wp-content/uploads/games/okaopetipeti/',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'ゲーム画面'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  define: {
    'process.env.LIFF_ID': JSON.stringify(process.env.LIFF_ID || '1234567890-abcdefgh')
  }
})
