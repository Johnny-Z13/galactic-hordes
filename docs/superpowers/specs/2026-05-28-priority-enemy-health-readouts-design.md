# Priority Enemy Health Readouts Design

## Goal

Make Galactic Hordes boss and elite targets easier to read during sustained gunfire without adding health bars to every horde enemy.

## Design

Add a pure render helper that decides whether a damaged enemy deserves a compact health readout. Normal play shows damaged brutes, wardens, bulwarks, and giant boss enemies. High-load play keeps only boss-grade readouts so dense waves stay readable.

The readout is a small bar below the enemy body. It uses the enemy color while healthy, switches to the shared red hit-feedback color at critical health, and remains visual-only.

## Rules

Health readouts do not alter enemy hp, rewards, targeting, collision, damage, score, hit flash, impact pulses, or spawn pressure. Ordinary horde enemies stay bar-free.

## Testing

Tests cover priority filtering, high-load suppression, critical-health color, and renderer wiring.
