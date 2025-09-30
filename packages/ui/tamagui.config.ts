import { config as baseConfig } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'
import { colors } from './tokens/colors'

// Semantic color tokens for Tamagui
const semanticTokens = {
  // Brand Colors
  brandPrimary: {
    light: colors.brand.primary.light,
    dark: colors.brand.primary.dark,
  },
  brandPrimaryContrast: {
    light: colors.brand.primaryContrast.light,
    dark: colors.brand.primaryContrast.dark,
  },
  brandSecondary: {
    light: colors.brand.secondary.light,
    dark: colors.brand.secondary.dark,
  },
  brandSecondaryContrast: {
    light: colors.brand.secondaryContrast.light,
    dark: colors.brand.secondaryContrast.dark,
  },
  brandAccent: {
    light: colors.brand.accent.light,
    dark: colors.brand.accent.dark,
  },
  brandAccentContrast: {
    light: colors.brand.accentContrast.light,
    dark: colors.brand.accentContrast.dark,
  },

  // Text Colors
  textPrimary: {
    light: colors.text.primary.light,
    dark: colors.text.primary.dark,
  },
  textSecondary: {
    light: colors.text.secondary.light,
    dark: colors.text.secondary.dark,
  },
  textTertiary: {
    light: colors.text.tertiary.light,
    dark: colors.text.tertiary.dark,
  },
  textInverse: {
    light: colors.text.inverse.light,
    dark: colors.text.inverse.dark,
  },
  textDisabled: {
    light: colors.text.disabled.light,
    dark: colors.text.disabled.dark,
  },

  // Surface Colors
  surfacePrimary: {
    light: colors.surface.primary.light,
    dark: colors.surface.primary.dark,
  },
  surfaceSecondary: {
    light: colors.surface.secondary.light,
    dark: colors.surface.secondary.dark,
  },
  surfaceTertiary: {
    light: colors.surface.tertiary.light,
    dark: colors.surface.tertiary.dark,
  },
  surfaceElevated: {
    light: colors.surface.elevated.light,
    dark: colors.surface.elevated.dark,
  },

  // Border Colors
  borderPrimary: {
    light: colors.border.primary.light,
    dark: colors.border.primary.dark,
  },
  borderSecondary: {
    light: colors.border.secondary.light,
    dark: colors.border.secondary.dark,
  },
  borderFocus: {
    light: colors.border.focus.light,
    dark: colors.border.focus.dark,
  },
  borderError: {
    light: colors.border.error.light,
    dark: colors.border.error.dark,
  },
  borderSuccess: {
    light: colors.border.success.light,
    dark: colors.border.success.dark,
  },

  // State Colors
  stateHover: {
    light: colors.state.hover.light,
    dark: colors.state.hover.dark,
  },
  stateActive: {
    light: colors.state.active.light,
    dark: colors.state.active.dark,
  },
  stateSelected: {
    light: colors.state.selected.light,
    dark: colors.state.selected.dark,
  },
  stateDisabled: {
    light: colors.state.disabled.light,
    dark: colors.state.disabled.dark,
  },

  // Feedback Colors
  feedbackSuccessBg: {
    light: colors.feedback.success.background.light,
    dark: colors.feedback.success.background.dark,
  },
  feedbackSuccessText: {
    light: colors.feedback.success.text.light,
    dark: colors.feedback.success.text.dark,
  },
  feedbackSuccessBorder: {
    light: colors.feedback.success.border.light,
    dark: colors.feedback.success.border.dark,
  },
  feedbackWarningBg: {
    light: colors.feedback.warning.background.light,
    dark: colors.feedback.warning.background.dark,
  },
  feedbackWarningText: {
    light: colors.feedback.warning.text.light,
    dark: colors.feedback.warning.text.dark,
  },
  feedbackWarningBorder: {
    light: colors.feedback.warning.border.light,
    dark: colors.feedback.warning.border.dark,
  },
  feedbackErrorBg: {
    light: colors.feedback.error.background.light,
    dark: colors.feedback.error.background.dark,
  },
  feedbackErrorText: {
    light: colors.feedback.error.text.light,
    dark: colors.feedback.error.text.dark,
  },
  feedbackErrorBorder: {
    light: colors.feedback.error.border.light,
    dark: colors.feedback.error.border.dark,
  },
  feedbackInfoBg: {
    light: colors.feedback.info.background.light,
    dark: colors.feedback.info.background.dark,
  },
  feedbackInfoText: {
    light: colors.feedback.info.text.light,
    dark: colors.feedback.info.text.dark,
  },
  feedbackInfoBorder: {
    light: colors.feedback.info.border.light,
    dark: colors.feedback.info.border.dark,
  },

  // Input Colors
  inputBackground: {
    light: colors.input.background.light,
    dark: colors.input.background.dark,
  },
  inputBorder: {
    light: colors.input.border.light,
    dark: colors.input.border.dark,
  },
  inputBorderFocus: {
    light: colors.input.borderFocus.light,
    dark: colors.input.borderFocus.dark,
  },
  inputBorderError: {
    light: colors.input.borderError.light,
    dark: colors.input.borderError.dark,
  },
  inputPlaceholder: {
    light: colors.input.placeholder.light,
    dark: colors.input.placeholder.dark,
  },

  // Overlay Colors
  overlayBackdrop: {
    light: colors.overlay.backdrop.light,
    dark: colors.overlay.backdrop.dark,
  },
  overlayContent: {
    light: colors.overlay.content.light,
    dark: colors.overlay.content.dark,
  },
  overlayBorder: {
    light: colors.overlay.border.light,
    dark: colors.overlay.border.dark,
  },

  // Chart Colors
  chartPrimary: {
    light: colors.chart.primary.light,
    dark: colors.chart.primary.dark,
  },
  chartSecondary: {
    light: colors.chart.secondary.light,
    dark: colors.chart.secondary.dark,
  },
  chartAccent: {
    light: colors.chart.accent.light,
    dark: colors.chart.accent.dark,
  },
  chartSuccess: {
    light: colors.chart.success.light,
    dark: colors.chart.success.dark,
  },
  chartWarning: {
    light: colors.chart.warning.light,
    dark: colors.chart.warning.dark,
  },
  chartError: {
    light: colors.chart.error.light,
    dark: colors.chart.error.dark,
  },
  chartInfo: {
    light: colors.chart.info.light,
    dark: colors.chart.info.dark,
  },
  chartNeutral: {
    light: colors.chart.neutral.light,
    dark: colors.chart.neutral.dark,
  },
}

// Extend base tokens with semantic color system
const tokens = {
  ...baseConfig.tokens,
  color: {
    ...baseConfig.tokens.color,
    // Add semantic tokens as individual color values
    brandPrimary: semanticTokens.brandPrimary.light,
    brandPrimaryContrast: semanticTokens.brandPrimaryContrast.light,
    brandSecondary: semanticTokens.brandSecondary.light,
    brandSecondaryContrast: semanticTokens.brandSecondaryContrast.light,
    brandAccent: semanticTokens.brandAccent.light,
    brandAccentContrast: semanticTokens.brandAccentContrast.light,
    
    textPrimary: semanticTokens.textPrimary.light,
    textSecondary: semanticTokens.textSecondary.light,
    textTertiary: semanticTokens.textTertiary.light,
    textInverse: semanticTokens.textInverse.light,
    textDisabled: semanticTokens.textDisabled.light,
    
    surfacePrimary: semanticTokens.surfacePrimary.light,
    surfaceSecondary: semanticTokens.surfaceSecondary.light,
    surfaceTertiary: semanticTokens.surfaceTertiary.light,
    surfaceElevated: semanticTokens.surfaceElevated.light,
    
    borderPrimary: semanticTokens.borderPrimary.light,
    borderSecondary: semanticTokens.borderSecondary.light,
    borderFocus: semanticTokens.borderFocus.light,
    borderError: semanticTokens.borderError.light,
    borderSuccess: semanticTokens.borderSuccess.light,
    
    stateHover: semanticTokens.stateHover.light,
    stateActive: semanticTokens.stateActive.light,
    stateSelected: semanticTokens.stateSelected.light,
    stateDisabled: semanticTokens.stateDisabled.light,
    
    feedbackSuccessBg: semanticTokens.feedbackSuccessBg.light,
    feedbackSuccessText: semanticTokens.feedbackSuccessText.light,
    feedbackSuccessBorder: semanticTokens.feedbackSuccessBorder.light,
    feedbackWarningBg: semanticTokens.feedbackWarningBg.light,
    feedbackWarningText: semanticTokens.feedbackWarningText.light,
    feedbackWarningBorder: semanticTokens.feedbackWarningBorder.light,
    feedbackErrorBg: semanticTokens.feedbackErrorBg.light,
    feedbackErrorText: semanticTokens.feedbackErrorText.light,
    feedbackErrorBorder: semanticTokens.feedbackErrorBorder.light,
    feedbackInfoBg: semanticTokens.feedbackInfoBg.light,
    feedbackInfoText: semanticTokens.feedbackInfoText.light,
    feedbackInfoBorder: semanticTokens.feedbackInfoBorder.light,
    
    inputBackground: semanticTokens.inputBackground.light,
    inputBorder: semanticTokens.inputBorder.light,
    inputBorderFocus: semanticTokens.inputBorderFocus.light,
    inputBorderError: semanticTokens.inputBorderError.light,
    inputPlaceholder: semanticTokens.inputPlaceholder.light,
    
    overlayBackdrop: semanticTokens.overlayBackdrop.light,
    overlayContent: semanticTokens.overlayContent.light,
    overlayBorder: semanticTokens.overlayBorder.light,
    
    chartPrimary: semanticTokens.chartPrimary.light,
    chartSecondary: semanticTokens.chartSecondary.light,
    chartAccent: semanticTokens.chartAccent.light,
    chartSuccess: semanticTokens.chartSuccess.light,
    chartWarning: semanticTokens.chartWarning.light,
    chartError: semanticTokens.chartError.light,
    chartInfo: semanticTokens.chartInfo.light,
    chartNeutral: semanticTokens.chartNeutral.light,
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
}

// Create themes with semantic color mapping
const themes = {
  light: {
    ...baseConfig.themes.light,
    // Map semantic tokens to theme values
    brandPrimary: semanticTokens.brandPrimary.light,
    brandPrimaryContrast: semanticTokens.brandPrimaryContrast.light,
    brandSecondary: semanticTokens.brandSecondary.light,
    brandSecondaryContrast: semanticTokens.brandSecondaryContrast.light,
    brandAccent: semanticTokens.brandAccent.light,
    brandAccentContrast: semanticTokens.brandAccentContrast.light,
    
    textPrimary: semanticTokens.textPrimary.light,
    textSecondary: semanticTokens.textSecondary.light,
    textTertiary: semanticTokens.textTertiary.light,
    textInverse: semanticTokens.textInverse.light,
    textDisabled: semanticTokens.textDisabled.light,
    
    surfacePrimary: semanticTokens.surfacePrimary.light,
    surfaceSecondary: semanticTokens.surfaceSecondary.light,
    surfaceTertiary: semanticTokens.surfaceTertiary.light,
    surfaceElevated: semanticTokens.surfaceElevated.light,
    
    borderPrimary: semanticTokens.borderPrimary.light,
    borderSecondary: semanticTokens.borderSecondary.light,
    borderFocus: semanticTokens.borderFocus.light,
    borderError: semanticTokens.borderError.light,
    borderSuccess: semanticTokens.borderSuccess.light,
    
    stateHover: semanticTokens.stateHover.light,
    stateActive: semanticTokens.stateActive.light,
    stateSelected: semanticTokens.stateSelected.light,
    stateDisabled: semanticTokens.stateDisabled.light,
    
    feedbackSuccessBg: semanticTokens.feedbackSuccessBg.light,
    feedbackSuccessText: semanticTokens.feedbackSuccessText.light,
    feedbackSuccessBorder: semanticTokens.feedbackSuccessBorder.light,
    feedbackWarningBg: semanticTokens.feedbackWarningBg.light,
    feedbackWarningText: semanticTokens.feedbackWarningText.light,
    feedbackWarningBorder: semanticTokens.feedbackWarningBorder.light,
    feedbackErrorBg: semanticTokens.feedbackErrorBg.light,
    feedbackErrorText: semanticTokens.feedbackErrorText.light,
    feedbackErrorBorder: semanticTokens.feedbackErrorBorder.light,
    feedbackInfoBg: semanticTokens.feedbackInfoBg.light,
    feedbackInfoText: semanticTokens.feedbackInfoText.light,
    feedbackInfoBorder: semanticTokens.feedbackInfoBorder.light,
    
    inputBackground: semanticTokens.inputBackground.light,
    inputBorder: semanticTokens.inputBorder.light,
    inputBorderFocus: semanticTokens.inputBorderFocus.light,
    inputBorderError: semanticTokens.inputBorderError.light,
    inputPlaceholder: semanticTokens.inputPlaceholder.light,
    
    overlayBackdrop: semanticTokens.overlayBackdrop.light,
    overlayContent: semanticTokens.overlayContent.light,
    overlayBorder: semanticTokens.overlayBorder.light,
    
    chartPrimary: semanticTokens.chartPrimary.light,
    chartSecondary: semanticTokens.chartSecondary.light,
    chartAccent: semanticTokens.chartAccent.light,
    chartSuccess: semanticTokens.chartSuccess.light,
    chartWarning: semanticTokens.chartWarning.light,
    chartError: semanticTokens.chartError.light,
    chartInfo: semanticTokens.chartInfo.light,
    chartNeutral: semanticTokens.chartNeutral.light,
  },
  dark: {
    ...baseConfig.themes.dark,
    // Map semantic tokens to theme values
    brandPrimary: semanticTokens.brandPrimary.dark,
    brandPrimaryContrast: semanticTokens.brandPrimaryContrast.dark,
    brandSecondary: semanticTokens.brandSecondary.dark,
    brandSecondaryContrast: semanticTokens.brandSecondaryContrast.dark,
    brandAccent: semanticTokens.brandAccent.dark,
    brandAccentContrast: semanticTokens.brandAccentContrast.dark,
    
    textPrimary: semanticTokens.textPrimary.dark,
    textSecondary: semanticTokens.textSecondary.dark,
    textTertiary: semanticTokens.textTertiary.dark,
    textInverse: semanticTokens.textInverse.dark,
    textDisabled: semanticTokens.textDisabled.dark,
    
    surfacePrimary: semanticTokens.surfacePrimary.dark,
    surfaceSecondary: semanticTokens.surfaceSecondary.dark,
    surfaceTertiary: semanticTokens.surfaceTertiary.dark,
    surfaceElevated: semanticTokens.surfaceElevated.dark,
    
    borderPrimary: semanticTokens.borderPrimary.dark,
    borderSecondary: semanticTokens.borderSecondary.dark,
    borderFocus: semanticTokens.borderFocus.dark,
    borderError: semanticTokens.borderError.dark,
    borderSuccess: semanticTokens.borderSuccess.dark,
    
    stateHover: semanticTokens.stateHover.dark,
    stateActive: semanticTokens.stateActive.dark,
    stateSelected: semanticTokens.stateSelected.dark,
    stateDisabled: semanticTokens.stateDisabled.dark,
    
    feedbackSuccessBg: semanticTokens.feedbackSuccessBg.dark,
    feedbackSuccessText: semanticTokens.feedbackSuccessText.dark,
    feedbackSuccessBorder: semanticTokens.feedbackSuccessBorder.dark,
    feedbackWarningBg: semanticTokens.feedbackWarningBg.dark,
    feedbackWarningText: semanticTokens.feedbackWarningText.dark,
    feedbackWarningBorder: semanticTokens.feedbackWarningBorder.dark,
    feedbackErrorBg: semanticTokens.feedbackErrorBg.dark,
    feedbackErrorText: semanticTokens.feedbackErrorText.dark,
    feedbackErrorBorder: semanticTokens.feedbackErrorBorder.dark,
    feedbackInfoBg: semanticTokens.feedbackInfoBg.dark,
    feedbackInfoText: semanticTokens.feedbackInfoText.dark,
    feedbackInfoBorder: semanticTokens.feedbackInfoBorder.dark,
    
    inputBackground: semanticTokens.inputBackground.dark,
    inputBorder: semanticTokens.inputBorder.dark,
    inputBorderFocus: semanticTokens.inputBorderFocus.dark,
    inputBorderError: semanticTokens.inputBorderError.dark,
    inputPlaceholder: semanticTokens.inputPlaceholder.dark,
    
    overlayBackdrop: semanticTokens.overlayBackdrop.dark,
    overlayContent: semanticTokens.overlayContent.dark,
    overlayBorder: semanticTokens.overlayBorder.dark,
    
    chartPrimary: semanticTokens.chartPrimary.dark,
    chartSecondary: semanticTokens.chartSecondary.dark,
    chartAccent: semanticTokens.chartAccent.dark,
    chartSuccess: semanticTokens.chartSuccess.dark,
    chartWarning: semanticTokens.chartWarning.dark,
    chartError: semanticTokens.chartError.dark,
    chartInfo: semanticTokens.chartInfo.dark,
    chartNeutral: semanticTokens.chartNeutral.dark,
  },
}

// Create config with semantic color system
const tamaguiConfig = createTamagui({
  ...baseConfig,
  tokens,
  themes,
  settings: {
    ...baseConfig.settings,
    webContainerType: 'normal',
    disableSSR: false,
    shouldAddPrefersColorThemes: true, // Enable theme switching
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}