# Space Impact Pulses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visual pulse feedback for space weapon hits and kills.

**Architecture:** Create `src/combat/impact-feedback.ts` for pure pulse creation and lifetime aging. `src/main.ts` owns runtime storage and canvas rendering.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Impact Pulse Helper

**Files:**
- Create: `src/combat/impact-feedback.ts`
- Create: `tests/impact-feedback.spec.ts`

- [x] **Step 1: Write failing tests**

Test hit pulse creation, kill pulse scaling, high-load hit suppression, and aging/removal.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/impact-feedback.spec.ts`

Expected: fails because `src/combat/impact-feedback.ts` does not exist.

- [x] **Step 3: Implement helper**

Export `createImpactPulse(...)` and `advanceImpactPulses(...)`.

### Task 2: Runtime Wiring

**Files:**
- Modify: `src/main.ts`
- Modify: `tests/impact-feedback.spec.ts`

- [x] **Step 1: Add wiring assertions**

Assert `main.ts` imports helper types/functions, stores `impactPulses`, calls `createImpactPulse(...)` in damage and kill flows, advances pulses in `updateParticles(...)`, clears pulses on route/reset, and renders them.

- [x] **Step 2: Render pulses**

Add `renderImpactPulses(ctx)` after particles and before score popups in the space scene. Draw expanding rings using pulse progress and color.

### Task 3: Verification and Commit

**Files:**
- Modify: no additional files expected

- [x] **Step 1: Focused verification**

Run: `npx playwright test tests/impact-feedback.spec.ts tests/damage-feedback.spec.ts tests/intro-juice.spec.ts`.

- [x] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [x] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, damage and kill a debug enemy, and confirm no console errors.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-05-28-space-impact-pulses-design.md docs/superpowers/plans/2026-05-28-space-impact-pulses.md src/combat/impact-feedback.ts src/main.ts tests/impact-feedback.spec.ts
git commit -m "feat: add space impact pulses"
```
