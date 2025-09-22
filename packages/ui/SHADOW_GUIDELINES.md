# Shadow System Guidelines

This document outlines the comprehensive shadow system for consistent, professional UI across the entire application.

## Shadow Tokens

Our shadow system is built on a hierarchical scale that provides visual depth and hierarchy:

### Standard Shadows
- **xs**: `0 1px 2px rgba(0,0,0,0.05)` - Subtle depth for minimal elements
- **sm**: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` - Small components, buttons
- **md**: `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` - Cards, panels
- **lg**: `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` - Floating elements, dropdowns
- **xl**: `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` - Modals, overlays
- **2xl**: `0 25px 50px rgba(0,0,0,0.15)` - Major overlays, full-screen modals

### Colored Shadows
- **primary**: `0 4px 14px rgba(30, 144, 255, 0.25)` - Primary brand elements
- **secondary**: `0 4px 14px rgba(52, 211, 153, 0.25)` - Secondary brand elements
- **accent**: `0 4px 14px rgba(245, 158, 11, 0.25)` - Accent elements

### Interactive States
- **hover**: `0 8px 25px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.08)` - Hover state
- **pressed**: `0 2px 4px rgba(0,0,0,0.06)` - Pressed/active state

## Usage Guidelines

### When to Use Each Shadow Level

#### xs - Minimal Depth
- Text highlights
- Subtle separators
- Minimal UI elements that need slight elevation

#### sm - Small Components
- Buttons (primary, secondary, outline)
- Small cards
- Input fields
- Badges and tags

#### md - Standard Cards
- Content cards
- List items
- Form sections
- Navigation panels

#### lg - Floating Elements
- Dropdown menus
- Tooltips
- Floating action buttons
- Popover content

#### xl - Modals and Overlays
- Modal dialogs
- Side panels
- Overlay menus
- Important notifications

#### 2xl - Major Overlays
- Full-screen modals
- Loading overlays
- Critical system messages

### Color Guidelines

#### Default Shadows
Use for most UI elements that don't need brand emphasis:
```tsx
<CardShadow level="md" color="default">
  <Content />
</CardShadow>
```

#### Brand Colored Shadows
Use sparingly for elements that need brand emphasis:
```tsx
<ButtonShadow level="sm" color="primary">
  <PrimaryButton />
</ButtonShadow>
```

### Interactive States

#### Hover States
Automatically applied when using the shadow system:
```tsx
<ButtonShadow level="sm" state="hover">
  <Button>Hover me</Button>
</ButtonShadow>
```

#### Pressed States
For active/pressed interactions:
```tsx
<ButtonShadow level="sm" state="pressed">
  <Button>Press me</Button>
</ButtonShadow>
```

## Component Usage

### ShadowView (Base Component)
The most flexible shadow component:
```tsx
<ShadowView 
  level="md" 
  color="primary" 
  state="hover" 
  elevated={true}
>
  <YourContent />
</ShadowView>
```

### Convenience Components

#### CardShadow
For content cards and panels:
```tsx
<CardShadow elevated={true}>
  <CardContent />
</CardShadow>
```

#### ButtonShadow
For interactive buttons:
```tsx
<ButtonShadow color="primary">
  <Button>Click me</Button>
</ButtonShadow>
```

#### ModalShadow
For modal dialogs and overlays:
```tsx
<ModalShadow>
  <ModalContent />
</ModalShadow>
```

#### FloatingShadow
For floating elements like dropdowns:
```tsx
<FloatingShadow>
  <DropdownContent />
</FloatingShadow>
```

## Best Practices

### 1. Consistency
- Always use the shadow system components instead of inline shadow styles
- Stick to the defined shadow levels - don't create custom values
- Use appropriate shadow levels for the component hierarchy

### 2. Performance
- The shadow system is optimized for both web and mobile
- Uses proper elevation values for Android
- Leverages CSS box-shadow for web performance

### 3. Accessibility
- Shadows help create visual hierarchy for screen readers
- Use elevated={false} for elements that shouldn't have shadows
- Maintain sufficient contrast between shadowed elements and backgrounds

### 4. Responsive Design
- Shadow levels work consistently across all screen sizes
- Consider reducing shadow intensity on smaller screens if needed
- Test shadow visibility on different background colors

## Migration Guide

### From Inline Shadows
Replace inline shadow styles:
```tsx
// Before
<View 
  shadowColor="$primary"
  shadowOffset={{ width: 0, height: 2 }}
  shadowOpacity={0.15}
  shadowRadius={4}
  elevation={2}
>
  <Content />
</View>

// After
<ButtonShadow color="primary" level="sm">
  <Content />
</ButtonShadow>
```

### From Hardcoded Values
Replace hardcoded shadow values with tokens:
```tsx
// Before
style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}

// After
<CardShadow level="md">
  <Content />
</CardShadow>
```

## Examples

### Button with Primary Shadow
```tsx
<ButtonShadow color="primary" level="sm">
  <Button backgroundColor="$primary" color="white">
    Primary Action
  </Button>
</ButtonShadow>
```

### Card with Standard Shadow
```tsx
<CardShadow level="md">
  <YStack padding="$4" backgroundColor="$surface">
    <Text>Card content</Text>
  </YStack>
</CardShadow>
```

### Modal with Strong Shadow
```tsx
<ModalShadow level="xl">
  <YStack padding="$6" backgroundColor="$surface" borderRadius="$4">
    <Text>Modal content</Text>
  </YStack>
</ModalShadow>
```

### Interactive Element with State Changes
```tsx
<ButtonShadow 
  level="sm" 
  color="secondary" 
  state="hover"
  elevated={true}
>
  <Button backgroundColor="$secondary">
    Hover for enhanced shadow
  </Button>
</ButtonShadow>
```

This shadow system ensures consistent, professional visual hierarchy throughout the application while maintaining excellent performance and accessibility.
