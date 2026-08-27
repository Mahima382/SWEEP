import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for the SWEEP backend (Controller + Model layers).
 * Node environment (no DOM needed); globals on so test files read like Jest.
 *
 * config/db.js swaps in an in-memory stand-in for the MySQL pool when
 * NODE_ENV === 'test' (vitest sets this automatically), so the suite runs
 * without a live database. Tests program behaviour through
 * globalThis.__sweepDb.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});

