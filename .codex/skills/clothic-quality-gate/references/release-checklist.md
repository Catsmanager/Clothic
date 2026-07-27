# Clothic release checklist

## Product contract

- Compare every onboarding promise and documented route with the implemented `app/` routes.
- Confirm every PRD success criterion has a working entry, action, persisted result, and recovery path.
- Flag MVP exclusions that appear as active UI promises.
- Resolve or report the one-outfit-per-day versus multiple-outfits ambiguity.
- Do not count memo-only records as styled outfits without an explicit product decision.
- Keep actual outfit metrics separate from diary-only rows while the storage policy remains unresolved.
- Treat synthetic habit-journey scores as a proxy; observed D1/D7 retention requires a separate analytics and privacy decision.

## Account and data safety

- Reset all user-scoped Zustand stores on logout, deletion, and account change.
- Ensure responses started for the previous account cannot repopulate stores after reset.
- Verify RLS and every auth-user foreign key/cascade path.
- Check account deletion for partial-data-loss failure modes.
- Test fresh migrations in filename order, not only an already-migrated database.

## Core flow recovery

- Verify full item picker selections return to the existing editor draft.
- Verify outfit detail works from list navigation, direct link, and Web refresh.
- Distinguish loading, error, retry, empty, and not-found states.
- Confirm optimistic rollback cannot restore another account's or a newer request's state.
- Keep "today" current across local midnight and AppState foreground resume.
- Preserve a suggested sleeping-wardrobe item when handing off to the outfit editor.

## UX and accessibility

- Provide names, roles, selected/disabled state, and at least 44pt targets for interactive controls.
- Treat avatar layer images as decorative or provide one useful outfit summary.
- Check modal isolation, close/escape, focus, live errors, and safe-area behavior.
- Test 320pt width, 200% text, scrollability, reduced motion, and permission denial.
- Calculate contrast for token pairs used by 10–14px text and buttons.
- Do not promise scheduled reminders when no local, push, or server-side producer exists.

## Avatar and assets

- Keep the canonical 1024×1536 (2:3) full-canvas contract unless all assets migrate together.
- Run `$clothic-avatar-pipeline` and `npm run avatar:check`.
- Check catalog ↔ map ↔ disk synchronization, actual transparency, stray pixels, halo, alignment, and provenance.
- Track Web/export asset totals and the largest backgrounds, category icons, and full-canvas layers.
- Prefer separate thumbnails before expanding the catalog materially.

## Verification

- Run `npm run check`, then a clean export when build readiness is in scope.
- Run `npm run verify:environment` after Expo or dependency changes.
- Confirm the latest baseline/candidate pair has an identical evaluator bundle hash and an explicit adoption decision.
- Report blocked network-dependent checks separately from failures.
- List manual/device flows that remain unverified.
