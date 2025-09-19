# React Native Specific Rules

## Expo Guidelines
- Use Expo SDK compatible packages only
- Check Expo compatibility before installing: `npx expo install --check`
- Use expo install instead of npm/pnpm for React Native packages
- Follow Expo versioning for React Native dependencies

## Platform Considerations
- Use Platform.OS for platform-specific code
- Implement responsive design with Dimensions API
- Use react-native-web compatible components for code sharing
- Test on both iOS and Android simulators

## Performance Optimization
- Use FlatList for large lists instead of ScrollView
- Implement lazy loading for images
- Use React Native Performance Monitor
- Optimize bundle size with Metro bundler

## Navigation
- Use React Navigation for routing
- Implement deep linking properly
- Use typed navigation for TypeScript
- Handle back button on Android

## State Management
- Use React Context for simple state
- Consider Redux Toolkit for complex state
- Use React Query for server state
- Implement proper error handling

## Native Modules
- Prefer Expo modules over bare React Native modules
- Use expo-dev-client for custom native code
- Test native modules on physical devices
- Document any custom native dependencies