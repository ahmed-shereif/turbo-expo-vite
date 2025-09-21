# Tamagui Styling Policy - MANDATORY

## Core Rule: Tamagui ONLY

**NEVER use Tailwind CSS or any other CSS framework. Use ONLY Tamagui.**

## Required UI Library

- **Tamagui ONLY**: All styling must use Tamagui components and design tokens
- Use existing Tamagui setup from `packages/ui` and `@repo/ui`
- Reference `packages/ui/tamagui.config.ts` for all design tokens

## Styling Implementation

### ✅ ALLOWED - Tamagui Patterns
```tsx
// Tamagui styled components
const StyledView = styled(View, {
  backgroundColor: '$color.primary',
  padding: '$space.4',
  borderRadius: '$radius.2'
})

// Tamagui component props
<Button size="$4" theme="primary" backgroundColor="$color.accent">
  Click me
</Button>

// Tamagui responsive props
<View width={{ xs: '100%', md: 400 }} padding="$space.2">
  Content
</View>

// Tamagui tokens
const styles = {
  color: '$color.text',
  fontSize: '$fontSize.lg',
  margin: '$space.3'
}
```

### ❌ FORBIDDEN - Never Use These
```tsx
// NEVER use Tailwind classes
<div className="bg-blue-500 p-4 rounded-lg"> // ❌ FORBIDDEN

// NEVER use other CSS frameworks
import 'bootstrap/dist/css/bootstrap.min.css' // ❌ FORBIDDEN

// NEVER bypass Tamagui tokens
<View style={{ backgroundColor: '#3b82f6' }}> // ❌ FORBIDDEN

// NEVER install Tailwind
"tailwindcss": "^3.0.0" // ❌ FORBIDDEN in package.json
```

## Component Development

### Required Approach
1. **Build in `packages/ui`**: All UI components must be created in the shared UI package
2. **Export from `@repo/ui`**: Make components available to both web and mobile apps
3. **Use Tamagui primitives**: Base all components on Tamagui's built-in components
4. **Leverage design tokens**: Use only tokens defined in `tamagui.config.ts`

### Example Component Structure
```tsx
// packages/ui/src/Button.tsx
import { Button as TamaguiButton, styled } from 'tamagui'

export const BrandButton = styled(TamaguiButton, {
  backgroundColor: '$color.primary',
  color: '$color.primaryContrast',
  borderRadius: '$radius.3',
  
  variants: {
    size: {
      small: { padding: '$space.2', fontSize: '$fontSize.sm' },
      large: { padding: '$space.4', fontSize: '$fontSize.lg' }
    }
  }
})
```

## Theme Configuration

### Extend Tamagui Themes
- Modify `packages/ui/tamagui.config.ts` for custom design tokens
- Use Tamagui's theme system for dark/light mode support
- Define consistent spacing, colors, and typography scales

### Token Usage
```tsx
// Use semantic tokens
backgroundColor: '$color.surface'     // ✅ Good
backgroundColor: '$color.primary'    // ✅ Good

// Avoid hardcoded values
backgroundColor: '#ffffff'           // ❌ Avoid
padding: 16                         // ❌ Avoid, use $space.4
```

## Responsive Design

### Tamagui Responsive Props
```tsx
<View
  width={{ xs: '100%', sm: 400, lg: 600 }}
  padding={{ xs: '$space.2', md: '$space.4' }}
  flexDirection={{ xs: 'column', md: 'row' }}
>
  Content
</View>
```

## Package Management Rules

### Installation Restrictions
- **NEVER** add `tailwindcss`, `postcss`, or CSS framework packages
- **NEVER** install CSS-in-JS libraries other than Tamagui
- **ALWAYS** check existing Tamagui components before creating new ones

### Allowed Tamagui Packages
```json
{
  "@tamagui/core": "^1.133.0",
  "@tamagui/config": "^1.133.0", 
  "@tamagui/button": "^1.133.0",
  "@tamagui/card": "^1.133.0",
  "tamagui": "^1.133.0"
}
```

## Code Review Checklist

Before submitting code, verify:
- [ ] No Tailwind CSS classes used anywhere
- [ ] All styling uses Tamagui components or tokens
- [ ] New UI components are in `packages/ui`
- [ ] No hardcoded colors, spacing, or typography values
- [ ] Responsive design uses Tamagui's responsive props
- [ ] No CSS framework dependencies in package.json files

## Enforcement

This policy is **MANDATORY** and **NON-NEGOTIABLE**:
- Any code using Tailwind CSS will be rejected
- All styling must go through Tamagui's design system
- Consistency across web and mobile platforms is required
- Design tokens ensure maintainable and scalable styling