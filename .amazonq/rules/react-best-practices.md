# React & React Native Best Practices

## Component Architecture
- Use functional components with hooks only
- Create reusable components in shared packages
- Follow single responsibility principle
- Use TypeScript for all components

## Performance Optimization
- Use React.memo for expensive components
- Implement useMemo for expensive calculations
- Use useCallback for event handlers passed to children
- Lazy load components with React.lazy and Suspense

## State Management
- Use useState for local component state
- Use useContext for shared state across components
- Consider useReducer for complex state logic
- Avoid prop drilling - use context or state management library

## File Structure
```
src/
├── components/
│   ├── common/
│   ├── forms/
│   └── layout/
├── hooks/
├── utils/
├── types/
└── constants/
```

## Naming Conventions
- Components: PascalCase (UserProfile.tsx)
- Hooks: camelCase starting with 'use' (useUserData.ts)
- Utils: camelCase (formatDate.ts)
- Constants: UPPER_SNAKE_CASE (API_ENDPOINTS.ts)