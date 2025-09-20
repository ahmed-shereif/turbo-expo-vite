# P1 Sessions — UI/UX Guidelines

These guidelines define how to design and build user interfaces across web and mobile for the paddle training app. They align with `apps/.cursorrules` Error Handling and UI/UX policies and the shared tokens in `tamagui.config.ts`.

## Brand & Tone
- Sporty, energetic, optimistic. Encourage users: "Let's play", "Great choice", "You're set".
- Keep copy short; avoid technical jargon and PII in UI strings.

## Tokens & Theming
- Use tokens from `packages/ui/tamagui.config.ts`:
  - Colors: `primary`, `primaryContrast`, `secondary`, `accent`, `bgSoft`, `surface`, `textHigh`, `textMuted`.
  - Radius: `1..5`, `round`. Shadows: `soft`, `medium`, `strong`.
- Primary actions use `primary`/`primaryContrast`. Reserve `accent` for highlights.

## Components
- Prefer `@repo/ui` components. Add new primitives here first, then consume in apps.
- Core components: `BrandButton`, `TextField`, `BrandCard`, `SafeText`, `ErrorFallback`, `CalendarComponent`.
- Patterns:
  - Forms: `react-hook-form` + `TextField` + inline errors; submit toasts via notify.
  - Cards: contain content groups; use `surface` background and `soft` shadows.
  - Lists: show skeletons during loading; paginate/infinite-scroll; support pull-to-refresh on mobile.

## Layout & Spacing
- 8px spacing scale. Minimum touch target: 44×44 px. Avoid dense UIs.
- Web max content width: ~1200px; center primary content; keep readable line lengths.
- Use flex layouts compatible with React Native Web for shared components.

## Accessibility
- Contrast ≥ 4.5:1. Visible focus outlines. Keyboard navigation on web.
- Provide text alternatives for icons; semantic labels for interactive elements.
- Respect user motion preferences; avoid excessive animation.

## Motion
- 150–250ms transitions. Use for state changes and navigation, not decoration.
- Provide immediate feedback: button loading states; optimistic updates where safe.

## Empty/Loading/Error/Success
- Loading: skeletons and inline indicators; avoid blocker spinners.
- Empty: friendly message + primary CTA.
- Error: inline message for recoverable issues + toast via notify; unexpected errors bubble to ErrorBoundary.
- Success: concise confirmation + next action.

## Domain Patterns
- Sessions (Discovery): persistent filters (area, date, rank, price); virtualize long lists on web.
- Booking: steps — Select session → Time/Court → Participants & Price → Pay. Persistent summary card.
- Trainers: rank, hourly price, coverage areas, ratings, availability; CTA "Request Trainer".
- Courts: map/list toggle; distance, available slots; confirm selection with summary.
- Payments: clear totals/fees; handle 3DS; retries with guidance; success/failure toasts.
- Ratings: 1–5 stars + tags; post-session nudge (non-blocking).

## React Query & Error Handling
- `useErrorBoundary: (e) => (e as any)?.status >= 500`.
- `onError: (e) => notify.error(parseMessage(e))`.
- Forms: catch `AuthClientError`, map `fieldErrors` to inputs, then `notify.error('Please fix the highlighted fields')`.

## Performance
- Memoize expensive components; `react-virtual` for web lists; defer non-critical work.
- Share business logic in `packages/utils`; avoid duplicating in apps.

## Contribution Rules
- New UI primitives belong in `packages/ui` with stories/examples.
- Keep parity across web and mobile; avoid app-specific re-implementations where a shared component suffices.
- Include usage docs in component files when behavior is non-obvious.
