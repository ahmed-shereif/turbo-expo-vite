# Package Management Rules

## Version Control
- React version MUST remain at 19.1.1 across all apps
- React DOM version MUST remain at 19.1.1 across all apps
- Never modify package.json dependencies directly
- Always use command line installation with exact versions

## Installation Commands
- Web app: `cd apps/web && pnpm add package@exact-version`
- Mobile app: `cd apps/mobile && npx expo install package@exact-version`
- Shared packages: `cd packages/utils && pnpm add package@exact-version`
- Root dependencies: `pnpm add -w package@exact-version`

## Version Alignment
- Check package versions before installation: `pnpm list package-name`
- Use pnpm overrides in root package.json for critical packages
- Verify no duplicate React instances: `find . -name "react" -type d | grep node_modules`

## Forbidden Actions
- Never use `^` or `~` version ranges for React/React DOM
- Never install packages without checking existing versions
- Never modify lockfile manually
- Never skip official documentation for package installation