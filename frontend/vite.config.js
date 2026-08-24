import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for the SWEEP frontend (View layer).
 * The dev server proxies /api to the Express backend so the browser
 * never talks to MySQL directly — all data flows through the REST API.
 * The `test` block configures Vitest, which reuses this same Vite pipeline.
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
