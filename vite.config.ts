import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Brimahd-inspeccion/',
  server: {
    // Permite acceder al dev server a través del túnel HTTPS de cloudflared.
    // Solo para pruebas locales en esta rama diseno-visual, no se sube.
    allowedHosts: ['.trycloudflare.com'],
  },
})
