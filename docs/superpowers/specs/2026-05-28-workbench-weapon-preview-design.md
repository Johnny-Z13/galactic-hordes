# Workbench Weapon Preview Design

## Goal

Make workbench weapon choices connect directly to the in-flight weapon identity readout. When a choice would change the visible weapon name or major weapon traits, the card should show the resulting readout before the player installs it.

## Design

Add a small preview helper in `ui/workbench.ts`. It clones the current build/evolved state, applies a single pending weapon upgrade or evolution, and compares the resulting `weaponHudReadout(...)` against the current readout. If the text changes, the workbench card renders a compact `NEXT:` line.

The preview appears on weapon upgrade cards and evolution cards only. It stays absent for relics, limits, locked context cards, and upgrades that do not change the visible weapon identity.

## Rules

The preview is informational only. It does not install upgrades, mutate state, spend signals, alter rolls, or change combat behavior. It must use the same helper as the HUD so the workbench and gameplay readouts cannot drift.

## Testing

Tests cover upgrade preview text, evolution preview text, non-weapon suppression, maxed/no-change suppression, and renderer/CSS wiring.
