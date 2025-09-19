# React Form and DOM Prop Validation Rules

## Form Field Rules
- **NEVER** use `value` prop on form inputs without a corresponding `onChange` handler
- For controlled components, always provide both `value` and `onChange` props
- For uncontrolled components, use `defaultValue` instead of `value`
- When using Tamagui Input components on web, use `onChange` instead of `onChangeText`

## DOM Prop Rules
- **NEVER** pass invalid DOM props to HTML elements
- Common invalid props to avoid:
  - `textAlign` as a direct prop (use in style object instead)
  - React Native specific props on web DOM elements
  - Custom props without proper filtering

## Input Component Patterns
```tsx
// ✅ Controlled input (correct)
<Input 
  value={inputValue} 
  onChange={(e) => setInputValue((e.target as HTMLInputElement).value)} 
/>

// ✅ Uncontrolled input (correct)
<Input defaultValue="initial value" />

// ❌ Invalid - value without onChange
<Input value={inputValue} />

// ❌ Invalid - onChangeText on web
<Input value={inputValue} onChangeText={setInputValue} />
```

## Cross-Platform Considerations
- When building components for both web and mobile, create platform-specific handlers
- Use conditional props based on platform when necessary
- Test components on both platforms to catch DOM-specific issues

## ESLint Integration
These rules should be enforced through ESLint configuration to catch issues during development.