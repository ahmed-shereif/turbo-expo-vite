import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tamaguiPlugin } from '@tamagui/vite-plugin'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React DevTools in development
      include: "**/*.{jsx,tsx}",
    }),
    tamaguiPlugin({
      config: './tamagui.config.ts',
      components: ['@tamagui/core'],
    }),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@repo/player-api': resolve(root, '../../packages/player-api/src/index.ts'),
      '@repo/player-api/': resolve(root, '../../packages/player-api/src/')
    },
  },
  define: {
    'process.env.TAMAGUI_TARGET': '"web"',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          tamagui: ['tamagui', '@tamagui/core'],
          'tamagui-components': ['@tamagui/dialog', '@tamagui/select'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          zod: ['zod'],
        },
      },
    },
  },
})
