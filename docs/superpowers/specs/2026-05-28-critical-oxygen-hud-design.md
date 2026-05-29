# Critical Oxygen HUD Design

## Intent

Surface oxygen is a mission-failure clock, so it should stay visually urgent once it reaches the forced-return band. The existing health warning helper should cover this instead of adding a separate oxygen-only threshold.

## Design Notes

- Keep the surface HUD labels unchanged: `HEALTH` and `O2`.
- Reuse `vitalCriticalClass(...)` for oxygen ratio to keep the critical threshold consistent.
- Apply the warning only while the XP meter represents surface oxygen.
- Use a cyan-to-yellow warning treatment so oxygen remains distinct from red health failure.
