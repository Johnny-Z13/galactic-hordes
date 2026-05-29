# Workbench Weapon Preview Implementation Plan

**Goal:** Show the next weapon HUD identity on relevant workbench choice cards.

**Architecture:** Add `choiceWeaponPreview(...)` to `src/ui/workbench.ts`, powered by `weaponHudReadout(...)`. Render its output in existing workbench choice chip builders.

**Tech Stack:** TypeScript, DOM rendering, CSS, Playwright test runner, Vite build.

---

### Task 1: Preview Helper

**Files:**
- Modify: `src/ui/workbench.ts`
- Create: `tests/workbench-weapon-preview.spec.ts`

- [x] **Step 1: Write failing tests**

Test weapon upgrade previews, evolution previews, no-op suppression, and renderer wiring.

- [x] **Step 2: Run RED**

Run: `npx playwright test tests/workbench-weapon-preview.spec.ts tests/weapon-signatures.spec.ts`.

Expected: fails because `choiceWeaponPreview(...)` and preview markup do not exist.

- [x] **Step 3: Implement helper**

Clone build/evolved state, apply one choice, compare current and next weapon readouts, and return a `NEXT:` line when changed.

### Task 2: Card Rendering

**Files:**
- Modify: `src/ui/workbench.ts`
- Modify: `src/style.css`

- [x] **Step 1: Render preview lines**

Add preview markup to offered choice cards and upgrade bay cards.

- [x] **Step 2: Style preview lines**

Keep text compact, uppercase, and visually secondary to the choice title.

### Task 3: Verification and Commit

- [x] **Step 1: Focused verification**

Run: `npx playwright test tests/workbench-weapon-preview.spec.ts tests/weapon-signatures.spec.ts tests/artifacts-workbench.spec.ts`.

- [x] **Step 2: Full verification**

Run: `npx tsc --noEmit`, `npm run build`, `npx playwright test`, and `git diff --check`.

- [x] **Step 3: Browser smoke**

Open the workbench in harness or source-check the rendered markup path and confirm no page errors.

- [x] **Step 4: Commit**

Commit as `feat: preview weapon identity in workbench`.
