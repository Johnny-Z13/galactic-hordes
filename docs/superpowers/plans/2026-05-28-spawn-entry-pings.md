# Spawn Entry Pings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add short enemy entry pings so space spawns are directionally readable.

**Architecture:** Create `src/spawn-entry-feedback.ts` for pure ping data/lifetime/screen placement. Keep runtime ownership and canvas drawing in `src/main.ts`.

**Tech Stack:** TypeScript, Canvas 2D, Playwright test runner, Vite build.

---

### Task 1: Entry Ping Helper

**Files:**
- Create: `src/spawn-entry-feedback.ts`
- Create: `tests/spawn-entry-feedback.spec.ts`

- [ ] **Step 1: Write failing tests**

Test ping creation, aging/removal, and edge-clamped screen positioning.

- [ ] **Step 2: Run RED**

Run: `npx playwright test tests/spawn-entry-feedback.spec.ts`

Expected: fails because `src/spawn-entry-feedback.ts` does not exist.

- [ ] **Step 3: Implement helper**

Export `createSpawnEntryPing(...)`, `advanceSpawnEntryPings(...)`, and `spawnEntryPingScreenPoint(...)`.

### Task 2: Runtime Wiring

**Files:**
- Modify: `src/main.ts`
- Modify: `tests/spawn-entry-feedback.spec.ts`

- [ ] **Step 1: Add wiring assertions**

Assert `main.ts` imports the helper, stores `spawnEntryPings`, stamps pings in `spawnEnemyAt(...)`, advances them during effects update, and renders them in `renderSpaceScene(...)`.

- [ ] **Step 2: Render pings**

Add `renderSpawnEntryPings(ctx)` after enemies and before player/effects. Draw expanding rings plus edge chevrons when offscreen.

### Task 3: Verification and Commit

**Files:**
- Modify: no additional files expected

- [ ] **Step 1: Focused verification**

Run: `npx playwright test tests/spawn-entry-feedback.spec.ts tests/space-wave-director.spec.ts tests/intro-juice.spec.ts`.

- [ ] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [ ] **Step 3: Browser smoke**

Open `http://127.0.0.1:5176/?harness=1&resetProgress=1`, spawn a debug enemy, and confirm no console errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-05-28-spawn-entry-pings-design.md docs/superpowers/plans/2026-05-28-spawn-entry-pings.md src/main.ts src/spawn-entry-feedback.ts tests/spawn-entry-feedback.spec.ts
git commit -m "feat: add spawn entry pings"
```
