import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for SWEEP end-to-end tests.
 * Boots the real Express backend and Vite frontend (via the root dev
 * scripts) and drives them with a real browser — no mocking either layer.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run dev:backend',
      cwd: '..',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm run dev:frontend',
      cwd: '..',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
