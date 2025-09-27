import { defineConfig } from 'vitest/config';
import path from 'node:path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@repo/player-api': path.resolve(__dirname, '../../packages/player-api/src'),
      '@repo/auth-client': path.resolve(__dirname, '../../packages/auth-client/src'),
      '@repo/ui': path.resolve(__dirname, './src/test/mocks/repo-ui.tsx'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: false,
    isolate: true,
    typecheck: {
      tsconfig: './tsconfig.test.json'
    }
  },
});


