# React DOM Props Validation Rules

## Invalid DOM Props Prevention
- **NEVER** pass React Native or custom props directly to DOM elements
- **ALWAYS** filter props before passing to DOM elements
- **ALWAYS** use style objects for styling props instead of direct attributes

## Common Invalid Props to Avoid
- `textAlign` - Use in style prop: `style={{ textAlign: 'center' }}`
- `onChangeText` - Use `onChange` for web compatibility
- `fontFamily` - Ensure proper web font handling
- `accessibilityLabel` - Use `aria-label` for web
- `testID` - Use `data-testid` for web

## Tamagui Specific Rules
- Configure Tamagui properly for web to prevent prop leakage
- Use Tamagui's built-in web compatibility features
- Ensure proper SSR handling in Tamagui config

## Component Patterns
```tsx
// ✅ Correct - Using style prop
<div style={{ textAlign: 'center' }}>Content</div>

// ✅ Correct - Filtering props
const { textAlign, ...domProps } = props;
<div {...domProps} style={{ textAlign }}>Content</div>

// ❌ Invalid - Direct DOM attribute
<div textAlign="center">Content</div>

// ✅ Correct - Web-compatible event handler
<input onChange={(e) => setValue(e.target.value)} />

// ❌ Invalid - React Native event handler
<input onChangeText={setValue} />
```

## ESLint Rules
- Use `react/no-unknown-property` to catch invalid DOM props
- Use custom `no-restricted-syntax` rules for specific prop patterns
- Configure rules to catch platform-specific props

## Testing
- Test components on both web and mobile platforms
- Use browser dev tools to check for React warnings
- Implement automated testing for prop validation