# Parallel Feature Development Rules

## Core Principle
**ALL features MUST be implemented in parallel for both web and mobile platforms. No feature should be developed for only one platform.**

## Feature Development Workflow

### 1. Feature Planning Phase
- Define feature requirements for both web and mobile
- Identify shared components and platform-specific implementations
- Create shared types and interfaces in `packages/types`
- Plan API contracts that work for both platforms

### 2. Implementation Order
1. **Shared Logic First**: Implement business logic in `packages/utils`
2. **Shared Types**: Define TypeScript interfaces in `packages/types`
3. **Shared UI Components**: Create platform-agnostic components in `packages/ui`
4. **Platform Implementation**: Implement in both `apps/web` and `apps/mobile` simultaneously

### 3. Mandatory Parallel Development
- **Never** commit a feature that works only on web or only on mobile
- **Always** test features on both platforms before merging
- **Always** update both apps when adding new shared packages
- **Always** maintain feature parity between platforms

## Implementation Guidelines

### Shared Components Strategy
```typescript
// packages/ui/components/FeatureComponent.tsx
export const FeatureComponent = ({ ...props }) => {
  // Platform-agnostic implementation using react-native-web
  return <View>...</View>
}
```

### Platform-Specific Adaptations
```typescript
// apps/web/src/features/FeatureName/
// apps/mobile/src/features/FeatureName/
// Both should use the same shared components with platform-specific styling
```

### API Integration
- Use shared API client in `packages/utils`
- Implement identical data fetching patterns
- Handle platform-specific navigation differently but maintain same data flow

## Development Checklist

### Before Starting a Feature
- [ ] Feature requirements defined for both platforms
- [ ] Shared components identified
- [ ] API contracts designed for both platforms
- [ ] Platform-specific considerations documented

### During Development
- [ ] Shared logic implemented in packages/
- [ ] Both web and mobile apps updated simultaneously
- [ ] Feature tested on both platforms
- [ ] Consistent UI/UX across platforms

### Before Merging
- [ ] Feature works identically on web and mobile
- [ ] Shared packages updated and tested
- [ ] Both apps build successfully
- [ ] Integration tests pass for both platforms
- [ ] Documentation updated for both platforms

## Enforcement Rules

### Code Review Requirements
- PRs must include changes to both web and mobile apps
- Reviewers must test on both platforms
- No single-platform features allowed

### CI/CD Pipeline
- Build both apps on every commit
- Run tests for both platforms
- Deploy both platforms together

### Exception Handling
- Platform-specific features (camera, push notifications) must have equivalent alternatives
- If a feature cannot be implemented on one platform, document the limitation and provide alternative user flow

## File Structure Requirements
```
apps/
├── web/src/features/FeatureName/
│   ├── index.tsx
│   ├── hooks/
│   └── components/
└── mobile/src/features/FeatureName/
    ├── index.tsx
    ├── hooks/
    └── components/

packages/
├── ui/components/FeatureName/
├── utils/api/featureName.ts
└── types/featureName.ts
```

## Communication Protocol
- Feature discussions must include both web and mobile considerations
- Design reviews must show both platform implementations
- Testing reports must cover both platforms
- Release notes must document both platform changes