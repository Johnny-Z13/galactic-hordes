# Surface Wave Telegraphs Design

## Goal

Make Galactic Hordes surface waves readable by showing a short warning marker before wave enemies arrive.

## Design

The existing wave director gains a telegraph phase. When a wave timer matures, it emits a telegraph request instead of immediately spawning enemies. `main.ts` chooses a safe surface point, stores a `SurfaceWaveTelegraph`, renders a warning ring at that point, and spawns the queued enemies when the telegraph expires.

The director remains pure and focused on timing/count decisions. `main.ts` remains responsible for concrete world placement, existing keepout rules, rendering, and creating `SurfaceThreat` objects.

## Rules

Telegraphs last a short tunable duration. The ring pulses from amber toward red as the spawn approaches. Waves still pause during forced O2 return and still respect active threat caps. If multiple wave warnings exist, each expires independently.

## Testing

Tests cover that waves emit a telegraph before spawning, expired telegraphs return ready spawn anchors, `main.ts` delegates through the wave director, and the surface renderer has a dedicated telegraph draw path.
