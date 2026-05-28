# Surface Wave Director Design

## Goal

Add a v1 surface wave director for Galactic Hordes so planet landings gain timed enemy pressure after the initial spawn set.

## Design

The wave director is a small pure module at `src/surface/wave-director.ts`. It owns timing, ramp, active-threat caps, and event/scenario pacing. It does not construct full enemies, play audio, mutate score, render UI, or know about DOM state.

`SurfaceRun` stores a `wave` state object created at landing. Each surface tick calls `updateSurfaceWaveDirector(...)`. If the director emits spawn requests, `main.ts` turns those requests into existing generic surface threats by calling the current `createGenericSurfaceThreat(...)` path. This keeps enemy construction, discovery logging, and keepout placement in the existing orchestration layer.

## Pacing Rules

Friendly and lore surfaces get a long opening grace period. Standard, repair, relic, and volatile surfaces start pressure earlier. Swarm and horde surfaces start fastest, spawn larger packs, and allow higher active-threat caps.

The director pauses once the suit is in forced oxygen-return mode. It also refuses to emit when the current active threat count is at or above the cap. This avoids unfair dogpiling when the player is already trying to return to the ship.

## Testing

Unit tests cover initial delays, horde/swarm escalation, active cap behavior, oxygen-return pause behavior, and `main.ts` delegation. Existing surface tests cover integration with setup, lifecycle, objectives, bullets, and threat behavior.
