import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      // During standalone development, proxy API calls to the backend
      // service. When mounted inside the existing FMS SPA, this file
      // (and the dev server it configures) is not used at all — the
      // built assets are served by the host app instead.
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
