import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  define: {
    'process.env.LIFF_ID': JSON.stringify(process.env.LIFF_ID || '1234567890-abcdefgh')
  }
})
