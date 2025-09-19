import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tamaguiPlugin } from '@tamagui/vite-plugin'

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
    },
  },
  define: {
    'process.env.TAMAGUI_TARGET': '"web"',
  },
})
