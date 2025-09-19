# Architecture Guidelines

## Monorepo Structure
```
turbo-expo-vite/
├── apps/
│   ├── web/          # Vite React app
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── utils/        # Shared utilities
│   ├── ui/           # Shared UI components
│   └── types/        # Shared TypeScript types
└── tools/            # Build tools and configs
```

## Shared Code Strategy
- Create shared packages for common functionality
- Use @repo/package-name naming convention
- Export only what's needed from shared packages
- Keep platform-specific code in respective apps

## Code Sharing Rules
- Business logic: Share in packages/utils
- UI components: Share in packages/ui (use react-native-web compatible)
- Types: Share in packages/types
- Constants: Share in packages/constants

## Parallel Development Mandate
- **CRITICAL**: All features MUST be developed for both web and mobile simultaneously
- No feature should exist on only one platform
- Shared packages must be updated before app-specific implementations
- Both platforms must maintain feature parity

## Import Rules
- Never import from other apps directly
- Always import shared code from packages/
- Use absolute imports with path mapping
- Prefer named exports over default exports

## Testing Strategy
- Unit tests for shared packages
- Integration tests for apps
- E2E tests for critical user flows
- Test shared components in isolation