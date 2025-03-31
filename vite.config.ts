import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
