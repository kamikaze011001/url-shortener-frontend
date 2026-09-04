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
      // Anchored regex, not the bare prefix '/api'. A plain prefix also swallows any
      // path that merely *starts* with those characters — `/api-keys`, a client-side
      // route, was being proxied to the backend and answering 404. The trailing slash
      // is what distinguishes "under /api/" from "begins with /api".
      //
      // The same trap exists in the production Caddy config, so its matcher has to be
      // `path /api/*` rather than `path_regexp ^/api`.
      '^/api/': { target: 'http://localhost:8080', changeOrigin: false },
    },
  },
})
