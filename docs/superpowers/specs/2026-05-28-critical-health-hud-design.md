# Critical Health HUD Design

## Goal

Keep low-health danger visible after the momentary damage vignette fades. If ship hull or surface suit health is critical, the health meter should continue to warn the player.

## Design

Extend `combat/player-damage-feedback` with a pure `vitalCriticalClass(...)` helper. `main.ts` uses it in `updateHud()` for ship hull and surface suit health, toggling a `critical` class on the health fill. CSS changes the health fill to a red warning pulse only while critical.

## Rules

The warning is visual-only. It does not alter damage, healing, shield, oxygen, death, or surface return behavior.

## Testing

Tests cover threshold behavior and `main.ts`/CSS wiring.
