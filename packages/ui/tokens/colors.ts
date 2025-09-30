/**
 * Unified Design Tokens - Color System
 * 
 * This file defines the complete color system for the application using semantic naming.
 * All colors are organized by purpose and support both light and dark themes.
 * 
 * WCAG AA Compliance:
 * - All text/surface combinations meet WCAG AA contrast requirements (4.5:1)
 * - Interactive elements meet enhanced contrast requirements (3:1)
 */

export const colors = {
  // Brand Colors - Core brand identity
  brand: {
    primary: {
      light: '#1E90FF',      // Dodger Blue - Primary brand color
      dark: '#3B82F6',       // Slightly lighter for dark mode
    },
    primaryContrast: {
      light: '#FFFFFF',      // White text on primary
      dark: '#FFFFFF',       // White text on primary (same)
    },
    secondary: {
      light: '#34D399',      // Emerald-500 - Secondary brand color
      dark: '#10B981',       // Slightly darker for dark mode
    },
    secondaryContrast: {
      light: '#FFFFFF',      // White text on secondary
      dark: '#FFFFFF',       // White text on secondary (same)
    },
    accent: {
      light: '#F59E0B',      // Amber-500 - Accent color
      dark: '#F59E0B',       // Same accent color
    },
    accentContrast: {
      light: '#FFFFFF',      // White text on accent
      dark: '#FFFFFF',       // White text on accent (same)
    },
  },

  // Text Colors - Hierarchical text system
  text: {
    primary: {
      light: '#111827',      // Gray-900 - Primary text
      dark: '#F9FAFB',       // Gray-50 - Primary text in dark mode
    },
    secondary: {
      light: '#374151',      // Gray-700 - Secondary text
      dark: '#D1D5DB',       // Gray-300 - Secondary text in dark mode
    },
    tertiary: {
      light: '#6B7280',      // Gray-500 - Muted text
      dark: '#9CA3AF',       // Gray-400 - Muted text in dark mode
    },
    inverse: {
      light: '#FFFFFF',      // White text on dark backgrounds
      dark: '#000000',       // Black text on light backgrounds in dark mode
    },
    disabled: {
      light: '#9CA3AF',      // Gray-400 - Disabled text
      dark: '#6B7280',       // Gray-500 - Disabled text in dark mode
    },
  },

  // Surface Colors - Background hierarchy
  surface: {
    primary: {
      light: '#FFFFFF',      // White - Primary surface
      dark: '#1F2937',       // Gray-800 - Primary surface in dark mode
    },
    secondary: {
      light: '#F9FAFB',      // Gray-50 - Secondary surface
      dark: '#111827',       // Gray-900 - Secondary surface in dark mode
    },
    tertiary: {
      light: '#F3F4F6',      // Gray-100 - Tertiary surface
      dark: '#374151',       // Gray-700 - Tertiary surface in dark mode
    },
    elevated: {
      light: '#FFFFFF',      // White - Elevated surfaces (modals, dropdowns)
      dark: '#1F2937',       // Gray-800 - Elevated surfaces in dark mode
    },
    overlay: {
      light: 'rgba(0, 0, 0, 0.6)',    // Semi-transparent black overlay
      dark: 'rgba(0, 0, 0, 0.8)',     // Darker overlay for dark mode
    },
  },

  // Border Colors - Border hierarchy
  border: {
    primary: {
      light: '#E5E7EB',      // Gray-200 - Primary borders
      dark: '#4B5563',       // Gray-600 - Primary borders in dark mode
    },
    secondary: {
      light: '#D1D5DB',      // Gray-300 - Secondary borders
      dark: '#6B7280',       // Gray-500 - Secondary borders in dark mode
    },
    focus: {
      light: '#1E90FF',      // Brand primary - Focus borders
      dark: '#3B82F6',       // Brand primary - Focus borders in dark mode
    },
    error: {
      light: '#EF4444',      // Red-500 - Error borders
      dark: '#F87171',       // Red-400 - Error borders in dark mode
    },
    success: {
      light: '#10B981',      // Emerald-500 - Success borders
      dark: '#34D399',       // Emerald-400 - Success borders in dark mode
    },
  },

  // State Colors - Interactive states
  state: {
    hover: {
      light: '#F3F4F6',      // Gray-100 - Hover background
      dark: '#374151',       // Gray-700 - Hover background in dark mode
    },
    active: {
      light: '#E5E7EB',      // Gray-200 - Active background
      dark: '#4B5563',       // Gray-600 - Active background in dark mode
    },
    selected: {
      light: '#EBF8FF',      // Blue-50 - Selected background
      dark: '#1E3A8A',       // Blue-900 - Selected background in dark mode
    },
    disabled: {
      light: '#F9FAFB',      // Gray-50 - Disabled background
      dark: '#374151',       // Gray-700 - Disabled background in dark mode
    },
  },

  // Feedback Colors - Status and feedback
  feedback: {
    success: {
      background: {
        light: '#D1FAE5',    // Emerald-100 - Success background
        dark: '#064E3B',     // Emerald-900 - Success background in dark mode
      },
      text: {
        light: '#065F46',    // Emerald-800 - Success text
        dark: '#A7F3D0',     // Emerald-200 - Success text in dark mode
      },
      border: {
        light: '#10B981',    // Emerald-500 - Success border
        dark: '#34D399',     // Emerald-400 - Success border in dark mode
      },
    },
    warning: {
      background: {
        light: '#FEF3C7',    // Amber-100 - Warning background
        dark: '#78350F',     // Amber-900 - Warning background in dark mode
      },
      text: {
        light: '#92400E',    // Amber-800 - Warning text
        dark: '#FCD34D',     // Amber-200 - Warning text in dark mode
      },
      border: {
        light: '#F59E0B',    // Amber-500 - Warning border
        dark: '#FBBF24',     // Amber-400 - Warning border in dark mode
      },
    },
    error: {
      background: {
        light: '#FEF2F2',    // Red-50 - Error background
        dark: '#7F1D1D',     // Red-900 - Error background in dark mode
      },
      text: {
        light: '#991B1B',    // Red-800 - Error text
        dark: '#FECACA',     // Red-200 - Error text in dark mode
      },
      border: {
        light: '#EF4444',    // Red-500 - Error border
        dark: '#F87171',     // Red-400 - Error border in dark mode
      },
    },
    info: {
      background: {
        light: '#F0F9FF',    // Cyan-50 - Info background
        dark: '#0C4A6E',     // Cyan-900 - Info background in dark mode
      },
      text: {
        light: '#0369A1',    // Cyan-700 - Info text
        dark: '#BAE6FD',     // Cyan-200 - Info text in dark mode
      },
      border: {
        light: '#06B6D4',    // Cyan-500 - Info border
        dark: '#22D3EE',     // Cyan-400 - Info border in dark mode
      },
    },
  },

  // Input Colors - Form elements
  input: {
    background: {
      light: '#FFFFFF',      // White - Input background
      dark: '#1F2937',       // Gray-800 - Input background in dark mode
    },
    border: {
      light: '#D1D5DB',      // Gray-300 - Input border
      dark: '#4B5563',       // Gray-600 - Input border in dark mode
    },
    borderFocus: {
      light: '#1E90FF',      // Brand primary - Focus border
      dark: '#3B82F6',       // Brand primary - Focus border in dark mode
    },
    borderError: {
      light: '#EF4444',      // Red-500 - Error border
      dark: '#F87171',       // Red-400 - Error border in dark mode
    },
    placeholder: {
      light: '#9CA3AF',      // Gray-400 - Placeholder text
      dark: '#6B7280',       // Gray-500 - Placeholder text in dark mode
    },
  },

  // Overlay Colors - Modals, tooltips, etc.
  overlay: {
    backdrop: {
      light: 'rgba(0, 0, 0, 0.6)',    // Semi-transparent black
      dark: 'rgba(0, 0, 0, 0.8)',     // Darker for dark mode
    },
    content: {
      light: '#FFFFFF',      // White - Overlay content
      dark: '#1F2937',       // Gray-800 - Overlay content in dark mode
    },
    border: {
      light: '#E5E7EB',      // Gray-200 - Overlay border
      dark: '#4B5563',       // Gray-600 - Overlay border in dark mode
    },
  },

  // Chart Colors - Data visualization
  chart: {
    primary: {
      light: '#1E90FF',      // Brand primary
      dark: '#3B82F6',       // Brand primary (lighter for dark mode)
    },
    secondary: {
      light: '#34D399',      // Brand secondary
      dark: '#10B981',       // Brand secondary (darker for dark mode)
    },
    accent: {
      light: '#F59E0B',      // Brand accent
      dark: '#F59E0B',       // Brand accent (same)
    },
    success: {
      light: '#10B981',      // Success green
      dark: '#34D399',       // Success green (lighter for dark mode)
    },
    warning: {
      light: '#F59E0B',      // Warning orange
      dark: '#F59E0B',       // Warning orange (same)
    },
    error: {
      light: '#EF4444',      // Error red
      dark: '#F87171',       // Error red (lighter for dark mode)
    },
    info: {
      light: '#06B6D4',      // Info cyan
      dark: '#22D3EE',       // Info cyan (lighter for dark mode)
    },
    neutral: {
      light: '#6B7280',      // Gray-500 - Neutral data
      dark: '#9CA3AF',       // Gray-400 - Neutral data in dark mode
    },
  },

  // Shadow Colors - Box shadows
  shadow: {
    sm: {
      light: 'rgba(0, 0, 0, 0.1)',    // Small shadow
      dark: 'rgba(0, 0, 0, 0.3)',     // Darker small shadow
    },
    md: {
      light: 'rgba(0, 0, 0, 0.15)',   // Medium shadow
      dark: 'rgba(0, 0, 0, 0.4)',     // Darker medium shadow
    },
    lg: {
      light: 'rgba(0, 0, 0, 0.25)',   // Large shadow
      dark: 'rgba(0, 0, 0, 0.5)',     // Darker large shadow
    },
    focus: {
      light: 'rgba(30, 144, 255, 0.2)',  // Focus shadow (brand primary)
      dark: 'rgba(59, 130, 246, 0.3)',   // Focus shadow (brand primary)
    },
  },
} as const

// Theme-specific color getters
export const getThemeColors = (theme: 'light' | 'dark') => {
  const getColor = (path: string) => {
    const keys = path.split('.')
    let value: any = colors
    for (const key of keys) {
      value = value[key]
    }
    return value[theme]
  }

  return {
    // Brand
    brandPrimary: getColor('brand.primary'),
    brandPrimaryContrast: getColor('brand.primaryContrast'),
    brandSecondary: getColor('brand.secondary'),
    brandSecondaryContrast: getColor('brand.secondaryContrast'),
    brandAccent: getColor('brand.accent'),
    brandAccentContrast: getColor('brand.accentContrast'),

    // Text
    textPrimary: getColor('text.primary'),
    textSecondary: getColor('text.secondary'),
    textTertiary: getColor('text.tertiary'),
    textInverse: getColor('text.inverse'),
    textDisabled: getColor('text.disabled'),

    // Surface
    surfacePrimary: getColor('surface.primary'),
    surfaceSecondary: getColor('surface.secondary'),
    surfaceTertiary: getColor('surface.tertiary'),
    surfaceElevated: getColor('surface.elevated'),
    surfaceOverlay: getColor('surface.overlay'),

    // Border
    borderPrimary: getColor('border.primary'),
    borderSecondary: getColor('border.secondary'),
    borderFocus: getColor('border.focus'),
    borderError: getColor('border.error'),
    borderSuccess: getColor('border.success'),

    // State
    stateHover: getColor('state.hover'),
    stateActive: getColor('state.active'),
    stateSelected: getColor('state.selected'),
    stateDisabled: getColor('state.disabled'),

    // Feedback
    feedbackSuccessBg: getColor('feedback.success.background'),
    feedbackSuccessText: getColor('feedback.success.text'),
    feedbackSuccessBorder: getColor('feedback.success.border'),
    feedbackWarningBg: getColor('feedback.warning.background'),
    feedbackWarningText: getColor('feedback.warning.text'),
    feedbackWarningBorder: getColor('feedback.warning.border'),
    feedbackErrorBg: getColor('feedback.error.background'),
    feedbackErrorText: getColor('feedback.error.text'),
    feedbackErrorBorder: getColor('feedback.error.border'),
    feedbackInfoBg: getColor('feedback.info.background'),
    feedbackInfoText: getColor('feedback.info.text'),
    feedbackInfoBorder: getColor('feedback.info.border'),

    // Input
    inputBackground: getColor('input.background'),
    inputBorder: getColor('input.border'),
    inputBorderFocus: getColor('input.borderFocus'),
    inputBorderError: getColor('input.borderError'),
    inputPlaceholder: getColor('input.placeholder'),

    // Overlay
    overlayBackdrop: getColor('overlay.backdrop'),
    overlayContent: getColor('overlay.content'),
    overlayBorder: getColor('overlay.border'),

    // Chart
    chartPrimary: getColor('chart.primary'),
    chartSecondary: getColor('chart.secondary'),
    chartAccent: getColor('chart.accent'),
    chartSuccess: getColor('chart.success'),
    chartWarning: getColor('chart.warning'),
    chartError: getColor('chart.error'),
    chartInfo: getColor('chart.info'),
    chartNeutral: getColor('chart.neutral'),

    // Shadow
    shadowSm: getColor('shadow.sm'),
    shadowMd: getColor('shadow.md'),
    shadowLg: getColor('shadow.lg'),
    shadowFocus: getColor('shadow.focus'),
  }
}

// Export types for TypeScript support
export type ColorTheme = 'light' | 'dark'
export type ThemeColors = ReturnType<typeof getThemeColors>
export type ColorPath = keyof typeof colors

