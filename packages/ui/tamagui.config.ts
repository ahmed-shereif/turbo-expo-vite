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
    // Subtle shadows for minimal depth
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    // Standard shadows for cards and components
    md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
    // Prominent shadows for modals and overlays
    xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
    '2xl': '0 25px 50px rgba(0,0,0,0.15)',
    // Colored shadows for interactive elements
    primary: '0 4px 14px rgba(30, 144, 255, 0.25)',
    secondary: '0 4px 14px rgba(52, 211, 153, 0.25)',
    accent: '0 4px 14px rgba(245, 158, 11, 0.25)',
    // Interactive states
    hover: '0 8px 25px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.08)',
    pressed: '0 2px 4px rgba(0,0,0,0.06)',
    // Legacy aliases for backward compatibility
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