# Semantic UI Click Audio Design

## Intent

UI buttons should no longer share one generic rotating sound. Galactic Hordes has enough UI samples to give the interface lightweight intent: navigation clicks, affirmative command clicks, and danger/reset clicks.

## Design

- Keep the existing global click listener as the only playback site for button clicks.
- Move button intent selection into a focused audio helper so screen modules do not each learn audio rules.
- Support explicit `data-ui-sound` overrides for special buttons.
- Infer common intent from stable classes:
  - `danger` routes to danger.
  - `start-button`, `primary`, and `workbench-install-choice` route to confirm.
  - everything else routes to navigation.
- Use the new six-button sample set as three small pools:
  - navigation: button 1, 2, 3.
  - confirm: button 4, 6.
  - danger: button 5.

## Boundaries

This does not add per-screen audio callbacks, change gameplay audio, or introduce a settings UI. It only makes existing button clicks sound more intentional while preserving the current Web Audio unlock behavior.
