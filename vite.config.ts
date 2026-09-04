import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // Mirrors production: in deployment Caddy serves the app and proxies /api to the
    // backend on one origin. Proxying here keeps development same-origin too, so the
    // session cookie behaves identically and there is no CORS anywhere in the system.
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: false },
    },
  },
})
