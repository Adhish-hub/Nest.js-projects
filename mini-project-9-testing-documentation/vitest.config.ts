import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/auth/**/*.ts',
        'src/users/**/*.ts',
        'src/security/**/*.ts',
      ],
      exclude: ['**/*.spec.ts', '**/*.d.ts'],
      reporter: ['text', 'html'],
    },
  },
});
