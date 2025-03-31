import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import type { ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error:', err);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`[${req.method}] ${req.url} -> ${proxyRes.statusCode}`);
          });
        }
      } as ProxyOptions
    },
  },
})
