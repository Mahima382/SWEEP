import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for the SWEEP frontend (View layer).
 * The dev server proxies /api to the Express backend so the browser
 * never talks to MySQL directly — all data flows through the REST API.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
