# Spawn Entry Pings Design

## Goal

Make Galactic Hordes enemy arrivals readable by briefly marking where newly spawned space enemies enter the fight.

## Design

Add a small `spawn-entry-feedback` module that owns pure ping creation, lifetime aging, and screen-edge placement. The main game loop stamps a ping whenever `spawnEnemyAt(...)` succeeds, updates ping lifetimes with the rest of runtime effects, and renders the pings after enemies.

Pings render at the enemy's world position if visible. If the spawn is offscreen, the renderer clamps the marker to the nearest screen edge so the player still sees the incoming direction.

## Rules

The pings are visual-only. They do not change enemy spawn location, behavior, damage, or timing. Giant enemies get a longer and larger ping; normal enemies stay brief and quiet.

## Testing

Tests cover ping creation, aging/removal, screen-edge clamping, and `main.ts` wiring through `spawnEnemyAt`, update, and render.
