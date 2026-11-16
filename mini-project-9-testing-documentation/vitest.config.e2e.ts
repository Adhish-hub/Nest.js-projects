import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
    clearMocks: true,
    restoreMocks: true,
  },
});
