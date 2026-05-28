# Surface Pressure HUD Design

## Goal

Make Galactic Hordes surface wave pressure readable before the warning telegraph appears.

## Design

The surface wave director exposes a pure pressure readout helper. It converts the current wave timer, active threat count, queued telegraphs, cap, and oxygen-return state into a compact status: `QUIET`, `RISING`, `INCOMING`, `SATURATED`, or `RETURN`.

`main.ts` renders that status inside the existing surface HUD as a small top-center line and progress bar. The bar remains subdued while pressure is quiet, warms as the next wave approaches, and turns red while a telegraph is already queued.

## Rules

The readout does not change gameplay timing. It reflects the same timer/cap state used by the wave director. Queued telegraphs count as incoming pressure so the HUD does not imply safety while a warning ring is active.

## Testing

Tests cover pressure readout labels and progress values in the wave director, plus `main.ts` wiring for a dedicated surface pressure HUD render path.
