# Mailpane Resize Observer Reflow Design

## Context

The mailpane currently looks correct on first load, but fails to keep adapting after the user resizes the pane or changes the Thunderbird window height. This creates two visible regressions:
- dragging the pane width does not reliably trigger toolbar regrouping and wrap behavior
- changing the window height does not keep the footer visible while allowing the middle todo area to reflow correctly

The current implementation explains why. In `panel.js`, layout syncing is currently tied to initialization, render completion, and `window.resize`. But Thunderbird mailpane width changes can happen by resizing the host column without emitting a resize event for the embedded extension page itself. As a result, the panel can start in a correct state but then stop reacting to later container size changes.

## Decision

The panel should treat mailpane layout as container-driven rather than window-driven. In mailpane mode, `panel.js` should use `ResizeObserver` to watch the real embedded panel container (`.app-shell` or `document.body`) and re-run layout synchronization whenever its width or height changes.

This reflow pipeline should be split into two responsibilities:
- toolbar group alignment sync: detect whether each toolbar group is still single-line or has wrapped
- vertical region sync: keep top and footer visible, with the middle `groups` section as the only main flexible and scrollable region

## Layout Rules

### 1. Toolbar behavior
- Primary and task groups remain semantically separated.
- A group that fits on one row stays centered.
- A group that wraps becomes left-aligned.
- Group state must be recomputed whenever the actual mailpane width changes, not only on page render or `window.resize`.

### 2. Vertical behavior
- Top controls remain visible.
- Footer remains visible.
- The `groups` section absorbs height changes and owns the main scroll.
- Height reflow must react to actual container height changes in real time.

### 3. Popup isolation
- Popup window size persistence logic must not drive mailpane layout decisions.
- Mailpane must rely only on embedded container size.

## Implementation Boundary

This should primarily be a panel-layer change:
- `panel.js`: add `ResizeObserver`-driven mailpane layout sync
- `panel.css`: tighten any remaining top/middle/footer contracts if needed
- `tests/mailpane-layout.test.mjs`: assert real-time container-size-based layout hooks exist

The Thunderbird host implementation should remain unchanged unless panel observation proves insufficient.

## Verification

Success means:
1. First load fits the current window size
2. Dragging pane width causes real-time toolbar reflow
3. Changing window height keeps footer visible and reflows the middle section
4. No reopen, refresh, or manual interaction is required for layout correction
