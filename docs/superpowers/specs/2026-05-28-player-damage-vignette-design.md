# Player Damage Vignette Design

## Goal

Make player damage unmistakable without interrupting horde combat. When the ship or surface pilot is hit, the game should show a short screen-edge flash that distinguishes shield absorption, hull damage, critical hull damage, and surface suit damage.

## Design

Add a pure `combat/player-damage-feedback` helper that creates and ages one active damage flash. `main.ts` triggers the flash from `damagePlayer(...)` and `damageSurfacePilot(...)`, advances it with other visual effects, clears it on route/reset, and renders it as a full-screen canvas vignette after world rendering.

The vignette is edge-heavy, short-lived, and visual-only. Shield-only hits use cyan. Hull and surface hits use red. Critical hull/suit hits last slightly longer and use a stronger alpha.

## Rules

The feedback does not change damage math, invulnerability, shield delay, hull values, surface health, audio, score, particles, camera shake, death flow, or progression. It only renders a transient screen overlay.

## Testing

Tests cover flash kind selection, critical scaling, aging/removal, and `main.ts` wiring through ship damage, surface damage, update, reset, and render.
