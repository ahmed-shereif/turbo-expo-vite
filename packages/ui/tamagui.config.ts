import { config as baseConfig } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

// Extend base tokens with brand palette, radii, and shadows
const tokens = {
  ...baseConfig.tokens,
  color: {
    ...baseConfig.tokens.color,
    primary: '#1E90FF',
    primaryContrast: '#FFFFFF',
    secondary: '#34D399',
    accent: '#F59E0B',
    bgSoft: '#F9FAFB',
    surface: '#FFFFFF',
    textHigh: '#111827',
    textMuted: '#6B7280',
  },
  radius: {
    ...baseConfig.tokens.radius,
    1: 4,
    2: 6,
    3: 8,
    4: 12,
    5: 16,
    round: 9999,
  },
  shadow: {
    ...baseConfig.tokens.shadow,
    soft: '0 2px 8px rgba(0,0,0,0.08)',
    medium: '0 4px 16px rgba(0,0,0,0.12)',
    strong: '0 8px 24px rgba(0,0,0,0.16)',
  },
}

// Create config with proper web handling and brand tokens
const tamaguiConfig = createTamagui({
  ...baseConfig,
  tokens,
  themes: {
    ...baseConfig.themes,
  },
  settings: {
    ...baseConfig.settings,
    webContainerType: 'normal',
    disableSSR: false,
    shouldAddPrefersColorThemes: false,
    shouldFixWebFonts: true,
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}