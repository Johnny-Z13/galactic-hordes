# Space Impact Pulses Design

## Goal

Make Galactic Hordes space weapon hits and kills read clearly in dense horde combat.

## Design

Add a small `combat/impact-feedback` module that owns pure impact pulse creation and aging. `main.ts` stores active pulses, creates hit pulses from `damageEnemy(...)`, creates stronger kill pulses from `killEnemy(...)`, updates their lifetime with existing effects, and renders them in the space scene.

Hit pulses are brief rings at the enemy point. Kill pulses are longer and brighter. Giant kills get the largest pulse. High-load mode suppresses ordinary hit pulses but keeps kill pulses so the screen remains readable under stress.

## Rules

Impact pulses are visual-only. They do not change enemy hp, rewards, hit flash, hitstop, particles, audio, spawn behavior, or score. Existing red hit flash remains the canonical hit state on enemy sprites.

## Testing

Tests cover impact pulse creation, high-load suppression, aging/removal, and `main.ts` wiring through damage, kill, update, reset, and render paths.
