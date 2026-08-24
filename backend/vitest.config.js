import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for the SWEEP backend (Controller + Model layers).
 * Node environment (no DOM needed); globals on so test files read like Jest.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
