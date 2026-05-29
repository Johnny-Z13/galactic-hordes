# Opening Pressure Arc Design

## Goal

Make the first route node feel more like Galactic Hordes' promise: a readable space horde opener where the player shoots immediately, collects early value, sees pressure build, then chooses whether to dock or push for cache/planet value.

## Context

The market research notes say the first 10 minutes are the product. The current opening already has useful pieces: `safeDrift` is guaranteed in the first route column, first-run safe drift uses intro spawn pressure, the first planet landing has boosted payoff, and the station appears early enough to teach route extraction. What is still weak is the combat appetite between launch and the first station: the first safe drift has one wave around 30 seconds and the objective copy reads more like a passive breather than an active survival loop.

## Design

The first `safeDrift` should become a three-beat opener:

1. **Contact:** early scout pressure around 12 seconds so shooting starts quickly.
2. **Flank:** a second small pressure beat around 28 seconds with splinter/chaser mix.
3. **Decision:** a station/cache beat around the existing intro station window, with objective copy that names the choice.

This should use existing enemies only. No new enemy types, no new weapon branch, and no new route system. The change should be balance-data driven in `src/sector-map.ts` and intro tuning in `src/intro-hook.ts` only if needed.

## Player-Facing Intent

The player should understand the first route as: clear scouts, vacuum rewards, watch the route objective update, then decide whether to dock at the station or keep chasing route value. The language should say what to do rather than describe the route abstractly.

## Technical Shape

- Adjust `safeDrift` wave grammar in `src/sector-map.ts`.
- Keep first-node station timing tied to `runBalance.timers.introSectorBeaconSeconds`.
- Update objective/readout text for `safeDrift` so HUD and route cards carry the same active intent.
- Preserve existing first-run helpers in `src/intro-hook.ts`; do not add another hidden first-run-only system unless tests show the authored wave timing is not enough.

## Verification

- Add/adjust tests that prove first-column `safeDrift` exposes multiple opening wave beats with early contact.
- Add/adjust tests that prove safe drift objective copy frames the combat, signal, and dock/cache decision.
- Run `npx tsc --noEmit`.
- Run focused sector, objective, intro, and simulation tests.
- Run the full Playwright suite.
- Browser smoke the harness route screen and first route launch.

## Non-Goals

- No new weapons.
- No new enemies.
- No mobile-specific layout work.
- No changes to final-route balance.
- No broad refactor while tuning the opener.
