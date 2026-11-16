import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    globals: false,
    clearMocks: true,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
