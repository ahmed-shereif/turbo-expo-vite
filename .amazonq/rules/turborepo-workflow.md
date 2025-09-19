# Turborepo Workflow Rules

## Development Commands
- `pnpm dev` - Start all apps in parallel
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run linting across workspace
- `pnpm test` - Run tests across workspace

## Task Dependencies
- Build tasks depend on shared packages building first
- Test tasks can run independently
- Lint tasks should run before build in CI

## Caching Strategy
- Enable remote caching for CI/CD
- Cache build outputs in dist/ and build/ directories
- Cache node_modules for faster installs
- Use .turbo/ directory for local cache

## Workspace Management
- Add new apps to apps/ directory
- Add new packages to packages/ directory
- Update turbo.json when adding new tasks
- Maintain consistent scripts across packages

## CI/CD Integration
- Use turbo run build --filter=[CHANGED]
- Cache dependencies between runs
- Run tests in parallel across packages
- Deploy only changed applications