# Semantic UI Click Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route UI button click samples by button intent so navigation, confirmation, and danger actions sound distinct.

**Architecture:** Add one focused helper in `src/audio/ui-click-cues.ts` that maps a clicked `HTMLButtonElement` and click index to a sample playback request. Keep `src/main.ts` responsible for the global click listener and playback only.

**Tech Stack:** TypeScript, Vite asset imports, Playwright component/source tests.

---

### Task 1: Semantic Cue Tests

**Files:**
- Create: `src/audio/ui-click-cues.ts`
- Modify: `tests/audio-sound-design.spec.ts`
- Modify: `src/audio/sfx-samples.ts`
- Modify: `src/main.ts`

- [x] **Step 1: Write failing source tests**

Add assertions that `audio-sound-design.spec.ts` expects `uiClickSoundForButton`, semantic sample pools, and a main click handler that plays `cue.sample` with `cue.gain` and `cue.rate`.

- [x] **Step 2: Verify red**

Run: `npx playwright test tests/audio-sound-design.spec.ts`
Expected: FAIL because `ui-click-cues.ts` and semantic pools do not exist.

- [x] **Step 3: Implement minimal helper**

Create `src/audio/ui-click-cues.ts` with `UiClickSoundCue`, `uiClickSoundForButton`, explicit `data-ui-sound` support, class-based inference, and rotating pool selection.

- [x] **Step 4: Wire main**

Import `uiClickSoundForButton` in `src/main.ts`, call it in the existing button click listener, and pass the returned playback options to `this.audio.playSample`.

- [x] **Step 5: Verify green**

Run: `npx tsc --noEmit` and `npx playwright test tests/audio-sound-design.spec.ts`.
Expected: both pass.

### Task 2: Runtime Verification

**Files:**
- Verify: browser runtime at `http://127.0.0.1:5176/?harness=1&resetProgress=1`

- [x] **Step 1: Run build**

Run: `npm run build`
Expected: build exits 0 and emits the UI MP3 assets.

- [x] **Step 2: Run full tests**

Run: `npx playwright test`
Expected: all tests pass.

- [x] **Step 3: Browser smoke**

Use Playwright to load the harness page, click a visible enabled button, and confirm there are no console or page errors.

- [x] **Step 4: Commit**

Stage the source, tests, spec, and plan. Commit with message `feat: route ui click sounds by intent`.
