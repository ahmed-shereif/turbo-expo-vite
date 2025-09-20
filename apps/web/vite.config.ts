import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tamaguiPlugin } from '@tamagui/vite-plugin'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
  },
})
