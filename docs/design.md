# Galactic Hordes UI Design Guide

This guide defines the current UI direction for agents working on Galactic Hordes menus, workbench screens, mothership systems, and future console surfaces.

## Art Direction

Galactic Hordes uses a hard sci-fi command-console style: dark glass panels, cyan scan lines, clipped polygon corners, dense readable data, and restrained glow. Interfaces should feel like ship systems, not marketing cards.

Use:
- Dark navy/black panel fields with subtle grid or scan-line texture.
- Cyan as the primary interface frame and navigation color.
- Compact labels, meters, rank chips, and system codes.
- Clipped rectangular geometry with small radii, usually 5-8px.
- Clear status text alongside color. Never rely on color alone.

Avoid:
- Large decorative cards inside other cards.
- Purple/blue gradient dominance.
- Yellow as a generic selected state.
- Hidden critical actions inside decorative text.
- Scroll jumps that move the tapped control unpredictably.

## Fonts

Primary UI font stack is defined in `src/style.css`:

```css
"Rajdhani", "Oxanium", "Eurostile", "Bank Gothic", "Trebuchet MS", "Segoe UI", sans-serif
```

Use uppercase sparingly for system labels, buttons, and telemetry. Keep body copy short and sentence case where readability matters.

## Color Semantics

Color meanings must stay consistent:

- Cyan / light blue: navigation, selected/open menu bars, focus frames, informational UI.
- Yellow / amber: actionable upgrades, purchase-ready states, install buttons, current purchasable tiers.
- Green: complete, installed, maxed, healthy, successful.
- Grey: locked, unavailable, disabled, offline. Pair with a lock label or padlock visual.
- Red: danger, damage, destructive actions, critical warnings.
- Violet: relic/anomaly flavor only, not ordinary locked state.

Examples:
- A workbench bay header that is open should glow cyan, not yellow.
- A workbench install offer should use yellow because tapping it spends a signal.
- A mothership department header that is open should glow cyan.
- A mothership tier that can be purchased may use yellow.
- A maxed upgrade or installed tier should read green.
- A locked upgrade should read grey and include a lock marker.

## Accordion / Disclosure Menus

Workbench bays and mothership departments follow an accordion/disclosure pattern.

Behavior:
- Headers are always visible and descriptive.
- Tap a closed header to open its detail directly underneath.
- Tap the same open header to collapse it.
- Tap another header to switch the open detail to that section.
- Do not auto-snap or center the menu after opening unless a future screen explicitly opts into that behavior.
- Preserve scroll position as much as possible.

Accessibility:
- Headers must be real `button` elements.
- Use `aria-expanded` on each disclosure button.
- Do not encode state only through color; include text such as `LOCKED`, `OFFER`, `INSTALLED`, or rank counts.

## Menu Structure

Preferred structure for dense upgrade systems:

1. Spendable currency status at the top.
   Show how many signals or resources can be spent, but do not render random signal-offer strips in the workbench.

2. Grouped system headers below.
   Headers summarize progress, lock state, and next opportunity.

3. Inline detail panel under the selected header.
   Show ranks, requirements, context chips, and direct upgrade buttons inside the expanded section.

The player should never need to scan a long flat list of every possible upgrade before seeing what they can do now. In the workbench, spend mutation signals directly from the relevant bay menu rather than choosing from a separate roll of signal offers.

## Workbench Tech Path

The workbench uses a visible tech tree path:

- Starter systems begin in separate bays so early upgrades naturally spread across weapons, maneuver, cargo/survey, and survival.
- Upgrade edges unlock deeper systems at specific rank thresholds.
- Direct bay upgrades can be temporarily sync-locked if one non-spacesuit bay gets too far ahead of other active bays.
- Spacesuit upgrades are exempt from bay sync locking because they are discovery-gated and surface-specific.
- Locked nodes must show their requirement. Sync-locked nodes must show the catch-up requirement.

## Button and State Rules

- Primary action: bright cyan filled button, used for launch and major confirms.
- Upgrade action: amber/yellow border/glow or button treatment.
- Secondary navigation: cyan outline/dark fill.
- Selected/open state: cyan glow and border, not yellow.
- Disabled/locked: grey low-contrast fill, explicit lock marker.
- Complete/maxed: green border or badge, explicit text.

## Responsive Rules

Mobile is the baseline for dense menus.

- Keep top-level headers compact.
- Expand detail inline under the tapped header.
- Avoid horizontal scrolling for key progression menus unless the content is naturally spatial.
- Text must fit without overlap at phone, iPad portrait, iPad landscape, and desktop sizes.
- Touch targets should remain at least 44px high.

## Sources

This guide follows common accordion/disclosure and status-color guidance:

- WAI-ARIA APG Disclosure Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- Material Design Expansion Panels: https://m1.material.io/components/expansion-panels.html
- UX Patterns Accordion guidance: https://uxpatterns.dev/en/patterns/content-management/accordion
- Buckeye UX utility color guidance: https://bux.osu.edu/color/utility-colors/
