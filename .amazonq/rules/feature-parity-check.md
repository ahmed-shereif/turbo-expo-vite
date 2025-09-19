# Feature Parity Enforcement

## Pre-commit Hooks
Add these checks to your git hooks to enforce parallel development:

### Check Both Apps Modified
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if both web and mobile are modified when features are added
web_changes=$(git diff --cached --name-only | grep "apps/web/src/features" | wc -l)
mobile_changes=$(git diff --cached --name-only | grep "apps/mobile/src/features" | wc -l)

if [ $web_changes -gt 0 ] && [ $mobile_changes -eq 0 ]; then
    echo "❌ ERROR: Web features modified but no mobile changes detected"
    echo "   Please implement the same feature in apps/mobile/"
    exit 1
fi

if [ $mobile_changes -gt 0 ] && [ $web_changes -eq 0 ]; then
    echo "❌ ERROR: Mobile features modified but no web changes detected"
    echo "   Please implement the same feature in apps/web/"
    exit 1
fi

echo "✅ Parallel development check passed"
```

## Development Commands

### Feature Creation Template
```bash
# Create new feature structure for both platforms
pnpm create-feature <feature-name>
```

### Build Verification
```bash
# Verify both apps build successfully
pnpm build:web && pnpm build:mobile
```

### Test Both Platforms
```bash
# Run tests for both platforms
pnpm test:web && pnpm test:mobile
```

## Code Review Checklist Template

### For Reviewers
- [ ] Feature implemented in both web and mobile
- [ ] Shared components created in packages/ui
- [ ] Business logic extracted to packages/utils
- [ ] Types defined in packages/types
- [ ] Both apps build successfully
- [ ] Tests pass on both platforms
- [ ] UI/UX consistent across platforms
- [ ] Documentation updated for both platforms

### For Developers
- [ ] Tested feature on both web and mobile
- [ ] Shared code properly abstracted
- [ ] Platform-specific code minimized
- [ ] API integration works on both platforms
- [ ] Error handling consistent across platforms