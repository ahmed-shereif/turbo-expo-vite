# Design Tokens System

This directory contains the unified design tokens system for the application, providing consistent colors, spacing, typography, and other design elements across all platforms.

## Overview

The design tokens system is built with the following principles:
- **Semantic naming**: Colors are named by purpose, not appearance
- **Theme support**: Both light and dark themes are supported
- **Accessibility**: All color combinations meet WCAG AA contrast requirements
- **Platform agnostic**: Works with Tamagui, CSS, and TypeScript

## Files

- `colors.ts` - Complete color system with semantic naming
- `css-variables.css` - CSS custom properties for web usage
- `index.ts` - Main export file with utilities
- `README.md` - This documentation

## Usage

### TypeScript/React (Tamagui)

```tsx
import { colors, getThemeColors } from '@repo/ui/tokens'

// Get all colors for a specific theme
const lightColors = getThemeColors('light')
const darkColors = getThemeColors('dark')

// Use specific color groups
const brandColors = getBrandColors('light')
const textColors = getTextColors('dark')

// In Tamagui components
<View backgroundColor="$brandPrimary" borderColor="$borderPrimary">
  <Text color="$textPrimary">Hello World</Text>
</View>
```

### CSS

```css
/* Import the CSS variables */
@import '@repo/ui/tokens/css-variables.css';

/* Use the variables */
.my-component {
  background-color: var(--color-surface-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

/* Theme-specific styling */
@media (prefers-color-scheme: dark) {
  .my-component {
    /* Dark theme styles are automatically applied */
  }
}
```

### JavaScript/TypeScript

```typescript
import { colors, getBrandColors, getCurrentTheme } from '@repo/ui/tokens'

// Get current theme
const currentTheme = getCurrentTheme()

// Get brand colors for current theme
const brandColors = getBrandColors(currentTheme)

// Access specific colors
const primaryColor = colors.brand.primary.light
const primaryColorDark = colors.brand.primary.dark
```

## Color Categories

### Brand Colors
- `brand.primary` - Primary brand color (Dodger Blue)
- `brand.secondary` - Secondary brand color (Emerald)
- `brand.accent` - Accent color (Amber)

### Text Colors
- `text.primary` - Primary text color
- `text.secondary` - Secondary text color
- `text.tertiary` - Muted text color
- `text.inverse` - Text on dark backgrounds
- `text.disabled` - Disabled text color

### Surface Colors
- `surface.primary` - Primary surface (cards, modals)
- `surface.secondary` - Secondary surface (page background)
- `surface.tertiary` - Tertiary surface (subtle backgrounds)
- `surface.elevated` - Elevated surfaces (dropdowns, tooltips)
- `surface.overlay` - Overlay backgrounds

### Border Colors
- `border.primary` - Primary borders
- `border.secondary` - Secondary borders
- `border.focus` - Focus state borders
- `border.error` - Error state borders
- `border.success` - Success state borders

### State Colors
- `state.hover` - Hover state background
- `state.active` - Active state background
- `state.selected` - Selected state background
- `state.disabled` - Disabled state background

### Feedback Colors
- `feedback.success.*` - Success states (background, text, border)
- `feedback.warning.*` - Warning states (background, text, border)
- `feedback.error.*` - Error states (background, text, border)
- `feedback.info.*` - Info states (background, text, border)

### Input Colors
- `input.background` - Input background
- `input.border` - Input border
- `input.borderFocus` - Focus state border
- `input.borderError` - Error state border
- `input.placeholder` - Placeholder text

### Overlay Colors
- `overlay.backdrop` - Modal/overlay backdrop
- `overlay.content` - Overlay content background
- `overlay.border` - Overlay border

### Chart Colors
- `chart.primary` - Primary chart color
- `chart.secondary` - Secondary chart color
- `chart.accent` - Accent chart color
- `chart.success` - Success chart color
- `chart.warning` - Warning chart color
- `chart.error` - Error chart color
- `chart.info` - Info chart color
- `chart.neutral` - Neutral chart color

## Theme Support

The design tokens system supports both light and dark themes:

```typescript
// Get colors for specific theme
const lightColors = getThemeColors('light')
const darkColors = getThemeColors('dark')

// Get current system theme
const systemTheme = detectSystemTheme()

// Set theme manually
setTheme('dark')

// Get current theme
const currentTheme = getCurrentTheme()
```

## Accessibility

All color combinations in the design tokens system meet WCAG AA contrast requirements:

- **Text on surfaces**: Minimum 4.5:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio
- **Focus indicators**: High contrast for visibility

## Migration Guide

### From Hardcoded Colors

**Before:**
```tsx
<View backgroundColor="#1E90FF" borderColor="#E5E7EB">
  <Text color="#111827">Hello</Text>
</View>
```

**After:**
```tsx
<View backgroundColor="$brandPrimary" borderColor="$borderPrimary">
  <Text color="$textPrimary">Hello</Text>
</View>
```

### From CSS

**Before:**
```css
.my-component {
  background-color: #1E90FF;
  color: #111827;
  border: 1px solid #E5E7EB;
}
```

**After:**
```css
.my-component {
  background-color: var(--color-brand-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
```

## Best Practices

1. **Use semantic names**: Always use semantic color names instead of hex codes
2. **Theme-aware**: Always consider both light and dark themes
3. **Consistent grouping**: Use the same color category for similar purposes
4. **Accessibility first**: Test color combinations for contrast requirements
5. **Documentation**: Document any custom color usage

## Examples

### Button Component

```tsx
import { getBrandColors, getTextColors } from '@repo/ui/tokens'

const Button = ({ variant = 'primary', theme = 'light' }) => {
  const brandColors = getBrandColors(theme)
  const textColors = getTextColors(theme)
  
  const styles = {
    primary: {
      backgroundColor: brandColors.primary,
      color: brandColors.primaryContrast,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: brandColors.primary,
      border: `1px solid ${brandColors.primary}`,
    }
  }
  
  return (
    <button style={styles[variant]}>
      Button Text
    </button>
  )
}
```

### Status Badge

```tsx
import { getFeedbackColors } from '@repo/ui/tokens'

const StatusBadge = ({ status, theme = 'light' }) => {
  const feedbackColors = getFeedbackColors(theme)
  const statusColors = feedbackColors[status]
  
  return (
    <span style={{
      backgroundColor: statusColors.background,
      color: statusColors.text,
      border: `1px solid ${statusColors.border}`,
    }}>
      {status}
    </span>
  )
}
```

## Contributing

When adding new colors to the design system:

1. Add the color to the appropriate category in `colors.ts`
2. Update the CSS variables in `css-variables.css`
3. Add utility functions in `index.ts` if needed
4. Update this documentation
5. Test both light and dark themes
6. Verify accessibility compliance

