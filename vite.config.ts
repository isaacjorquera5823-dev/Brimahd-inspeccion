import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Brimahd-inspeccion/',
  server: {
    // Permite acceder al dev server a través del túnel HTTPS de cloudflared
    // (necesario para probar navigator.share en iOS Safari, que requiere
    // contexto seguro). Solo para pruebas locales en esta rama test-pdf.
    allowedHosts: ['.trycloudflare.com'],
  },
})
