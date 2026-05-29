# Score Screen Module Design

## Intent

`main.ts` still owns several front-end screens directly. The high-score screen is a good next extraction because it is self-contained, already has reset behavior covered by tests, and does not affect combat or rendering loops.

## Design

- Create `src/ui/scores.ts` with one exported `showScores(self: VectorShooter)` function.
- Keep persistent reset behavior in `VectorShooter`; the score screen calls `self['resetPersistentProgress']()` from the reset button.
- Keep `VectorShooter.showScores()` as a private wrapper so existing callbacks do not change.
- Reuse `formatTime` from `main.ts` rather than duplicating time formatting.

## Boundaries

This is a pure extraction. It does not change score storage, score sorting, reset semantics, visual classes, or copy.
