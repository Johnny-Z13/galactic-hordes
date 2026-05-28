# Weapon HUD Readout Design

## Goal

Make Galactic Hordes' evolving gun identity visible during play. The player should know at a glance whether the current build is still a basic pulse cannon, a fan weapon, a rail/needle boss hunter, an orb build, or an evolved weapon.

## Design

Add a pure `weaponHudReadout(...)` helper to `weapon-signatures.ts`. It reads the current upgrade ranks and evolved weapon set, then returns a compact weapon name plus short trait tags. `main.ts` owns the DOM chip and updates it with the rest of the HUD.

The readout stays brief: one weapon name and up to three tags. Evolved weapons take naming priority. Non-evolved builds use the strongest visible weapon branch as the name and traits for secondary branches.

## Rules

The readout is informational only. It does not change fire cadence, damage, projectile behavior, upgrades, rolls, audio, particles, or progression. It is hidden with the rest of the HUD while full-screen menus are visible.

## Testing

Tests cover base weapon text, branch/evolution priority, trait limits, and `main.ts`/CSS wiring.
