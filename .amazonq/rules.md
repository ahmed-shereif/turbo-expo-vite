# Amazon Q Rules for P1 Sessions

## Text Alignment & SafeText Usage - MANDATORY

**NEVER use inline textAlign styles with regular Text components. Always use SafeText for text alignment.**

### Rule Summary
When working with text alignment in React/React Native components, always use the `SafeText` component from `@repo/ui` instead of regular `Text` components with inline `textAlign` styles.

### Why This Rule Exists
- Regular `Text` components pass `textAlign` as a DOM attribute, causing React warnings
- `SafeText` properly extracts alignment props and applies them via the `style` object
- Prevents console warnings and potential rendering issues
- Ensures consistent behavior across web and mobile platforms

### Correct Usage
```tsx
// ✅ CORRECT - Use SafeText with textAlign prop
import { SafeText } from '@repo/ui';

<SafeText textAlign="center" color="$gray11">
  No items found
</SafeText>

<SafeText textAlign="right" fontSize="$3" fontWeight="600">
  Status: {status}
</SafeText>
```

### Incorrect Usage
```tsx
// ❌ WRONG - Don't use inline styles with Text
<Text style={{ textAlign: 'center' }} color="$gray11">
  No items found
</Text>

<Text style={{ textAlign: 'right' }} fontSize="$3" fontWeight="600">
  Status: {status}
</Text>
```

### Migration Pattern
When you encounter `style={{ textAlign: ... }}` on `Text` components:
1. Replace `Text` with `SafeText`
2. Import `SafeText` from `@repo/ui`
3. Move `textAlign` from `style` object to direct prop
4. Remove the `style` prop entirely if it only contained `textAlign`

### Detection Pattern
Look for these patterns in code:
- `style={{ textAlign: 'left' }}`
- `style={{ textAlign: 'center' }}`
- `style={{ textAlign: 'right' }}`
- `style={{ textAlign: 'justify' }}`

All of these should be replaced with `SafeText` components using the `textAlign` prop directly.

### Enforcement
- This rule applies to all React/React Native components in the project
- Both web and mobile apps must follow this pattern
- Code reviews should flag any violations of this rule
- Linting rules should be added to catch these patterns automatically
