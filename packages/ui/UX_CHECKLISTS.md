# P1 Sessions — Screen UX Checklists

Use these per-screen before PR merge to ensure a unified, user-friendly experience.

## Global (apply to every screen)
- Primary CTA is clear and singular
- Uses `@repo/ui` components and tokens
- Accessible contrast (≥ 4.5:1), visible focus, 44×44 min targets
- Loading/empty/error/success states implemented
- Copy is concise, friendly, and free of technical jargon
- Query/mutation `onError` uses `notify.error`, 5xx handled by ErrorBoundary
- Mobile/web parity confirmed; no bespoke duplicated styles

## Session Discovery
- Filters: area, date range, rank, price (persist across navigation)
- Empty state with CTA to clear filters or explore
- Virtualized list on web; skeletons while loading
- Card shows session type, time, court area, price/share, seats left
- CTA: "View details" or "Join session"

## Session Details & Booking
- Stepper: Select session → Time/Court → Participants & Price → Pay
- Sticky summary card with totals, fees, participants, date/time
- Validations with inline field errors; disabled CTAs until valid
- Price and fees clearly itemized; final confirm dialog before payment
- Success: confirmation page with booking reference and next steps

## Trainers
- Profile shows rank, hourly price, coverage areas, ratings
- Availability grid/calendar; request form uses `react-hook-form`
- Primary CTA: "Request Trainer" with clear outcome
- Empty/error states guide user to discovery or retry

## Courts
- Map/list toggle; shows distance and availability slots
- Select court step validates and updates summary
- Clear CTA to continue to payment or next step

## Payments
- Shows breakdown (subtotal, fees, total) and payer method
- Handles 3DS flow and retries with guidance
- Loading/disabled states on pay button; prevent double submit
- Success and failure toasts; failure recovery option

## Ratings & Feedback
- Post-session prompt (non-blocking) with 1–5 stars + quick tags
- Submit shows toast and updates UI optimistically
