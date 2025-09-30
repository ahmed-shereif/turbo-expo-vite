/**
 * Design Tokens - Main Export
 * 
 * This file provides easy access to all design tokens including colors, spacing, typography, etc.
 * Import this file to access the complete design system.
 */

export { colors, getThemeColors } from './colors'
export type { ColorTheme, ThemeColors, ColorPath } from './colors'

// Re-export commonly used color utilities
export const getBrandColors = (theme: 'light' | 'dark' = 'light') => ({
  primary: colors.brand.primary[theme],
  primaryContrast: colors.brand.primaryContrast[theme],
  secondary: colors.brand.secondary[theme],
  secondaryContrast: colors.brand.secondaryContrast[theme],
  accent: colors.brand.accent[theme],
  accentContrast: colors.brand.accentContrast[theme],
})

export const getTextColors = (theme: 'light' | 'dark' = 'light') => ({
  primary: colors.text.primary[theme],
  secondary: colors.text.secondary[theme],
  tertiary: colors.text.tertiary[theme],
  inverse: colors.text.inverse[theme],
  disabled: colors.text.disabled[theme],
})

export const getSurfaceColors = (theme: 'light' | 'dark' = 'light') => ({
  primary: colors.surface.primary[theme],
  secondary: colors.surface.secondary[theme],
  tertiary: colors.surface.tertiary[theme],
  elevated: colors.surface.elevated[theme],
  overlay: colors.surface.overlay[theme],
})

export const getBorderColors = (theme: 'light' | 'dark' = 'light') => ({
  primary: colors.border.primary[theme],
  secondary: colors.border.secondary[theme],
  focus: colors.border.focus[theme],
  error: colors.border.error[theme],
  success: colors.border.success[theme],
})

export const getStateColors = (theme: 'light' | 'dark' = 'light') => ({
  hover: colors.state.hover[theme],
  active: colors.state.active[theme],
  selected: colors.state.selected[theme],
  disabled: colors.state.disabled[theme],
})

export const getFeedbackColors = (theme: 'light' | 'dark' = 'light') => ({
  success: {
    background: colors.feedback.success.background[theme],
    text: colors.feedback.success.text[theme],
    border: colors.feedback.success.border[theme],
  },
  warning: {
    background: colors.feedback.warning.background[theme],
    text: colors.feedback.warning.text[theme],
    border: colors.feedback.warning.border[theme],
  },
  error: {
    background: colors.feedback.error.background[theme],
    text: colors.feedback.error.text[theme],
    border: colors.feedback.error.border[theme],
  },
  info: {
    background: colors.feedback.info.background[theme],
    text: colors.feedback.info.text[theme],
    border: colors.feedback.info.border[theme],
  },
})

export const getInputColors = (theme: 'light' | 'dark' = 'light') => ({
  background: colors.input.background[theme],
  border: colors.input.border[theme],
  borderFocus: colors.input.borderFocus[theme],
  borderError: colors.input.borderError[theme],
  placeholder: colors.input.placeholder[theme],
})

export const getOverlayColors = (theme: 'light' | 'dark' = 'light') => ({
  backdrop: colors.overlay.backdrop[theme],
  content: colors.overlay.content[theme],
  border: colors.overlay.border[theme],
})

export const getChartColors = (theme: 'light' | 'dark' = 'light') => ({
  primary: colors.chart.primary[theme],
  secondary: colors.chart.secondary[theme],
  accent: colors.chart.accent[theme],
  success: colors.chart.success[theme],
  warning: colors.chart.warning[theme],
  error: colors.chart.error[theme],
  info: colors.chart.info[theme],
  neutral: colors.chart.neutral[theme],
})

export const getShadowColors = (theme: 'light' | 'dark' = 'light') => ({
  sm: colors.shadow.sm[theme],
  md: colors.shadow.md[theme],
  lg: colors.shadow.lg[theme],
  focus: colors.shadow.focus[theme],
})

// Utility functions for common color operations
export const getContrastColor = (backgroundColor: string, theme: 'light' | 'dark' = 'light'): string => {
  // Simple contrast detection - in a real implementation, you'd use a proper contrast calculation
  const lightColors = [
    colors.surface.primary.light,
    colors.surface.secondary.light,
    colors.surface.tertiary.light,
    colors.state.selected.light,
    colors.feedback.success.background.light,
    colors.feedback.warning.background.light,
    colors.feedback.error.background.light,
    colors.feedback.info.background.light
  ]
  const isLight = lightColors.includes(backgroundColor.toUpperCase())
  
  if (theme === 'dark') {
    return isLight ? colors.text.primary.dark : colors.text.inverse.dark
  } else {
    return isLight ? colors.text.primary.light : colors.text.inverse.light
  }
}

export const getHoverColor = (baseColor: string, theme: 'light' | 'dark' = 'light'): string => {
  // Simple hover color generation - in a real implementation, you'd use proper color manipulation
  const stateColors = getStateColors(theme)
  return stateColors.hover
}

export const getActiveColor = (baseColor: string, theme: 'light' | 'dark' = 'light'): string => {
  // Simple active color generation - in a real implementation, you'd use proper color manipulation
  const stateColors = getStateColors(theme)
  return stateColors.active
}

// Theme detection utilities
export const detectSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const setTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export const getCurrentTheme = (): 'light' | 'dark' => {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.getAttribute('data-theme')
    if (theme === 'dark' || theme === 'light') {
      return theme
    }
  }
  return detectSystemTheme()
}

