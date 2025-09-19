import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

// Create config with proper web handling
const tamaguiConfig = createTamagui({
  ...config,
  settings: {
    ...config.settings,
    // Ensure proper web handling
    webContainerType: 'normal',
    // Disable problematic features that cause DOM prop issues
    disableSSR: false,
    // Additional web-specific settings
    shouldAddPrefersColorThemes: false,
    // Ensure proper prop filtering for web
    shouldFixWebFonts: true,
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}