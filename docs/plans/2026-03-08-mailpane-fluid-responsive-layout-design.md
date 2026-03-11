# Mailpane Fluid Responsive Layout Design

Date: 2026-03-08

## Goal

Make the embedded Thunderbird mailpane UI behave like a true fluid sidebar instead of an enlarged popup. The feature scope, button order, module order, and business behavior must remain aligned with the popup UI. Only the layout behavior in `mailpane` mode should change.

## Constraints

- Do not expand or reduce the current feature set.
- Do not change the host column implementation again unless blocked by a layout bug outside the panel.
- Keep `panel.html` and `panel.js` as the functional source of truth.
- Prefer CSS-driven changes with only minimal structural class adjustments if necessary.
- The mailpane should remain fully opaque; no dimming behavior.

## Layout Direction

In `body[data-layout="mailpane"]`, the panel should no longer behave like a fixed popup composition. Treat it as a resizable sidebar with three clear regions:

1. Top controls: naturally flowing controls that re-wrap as width changes.
2. Middle content: the `groups` region consumes remaining height and owns the primary scroll behavior.
3. Bottom information: a flowable footer that can stack instead of assuming wide horizontal space.

This keeps the same functional structure while allowing the UI to adapt to narrow widths and short heights.

## Module-Level Responsive Rules

### Top controls

The action bar and task controls should become fluid control groups rather than fixed rows or fixed grids.

- Preserve existing button order.
- Let buttons size to content first, then expand when there is spare space.
- Allow wrapping at any width without relying on coarse breakpoint-only behavior.
- Avoid fixed equal-width grids that preserve original coordinates while compressing text.

### Middle sections

Sections such as possible items, pending items, imported items, and status should become compressible cards.

- Keep header rows visible.
- Lower internal minimum heights in `mailpane` mode.
- Allow text and metadata lines to wrap instead of depending on aggressive single-line truncation.
- Keep the main scroll responsibility on the shared `groups` container rather than introducing competing scroll regions.

### Bottom area

The footer should become a stackable tail region.

- Keep the import action visually prioritized.
- Allow calendar count, status, and version info to flow into multiple rows.
- Avoid horizontal assumptions that make the footer look like a shrunk popup toolbar.

## Implementation Boundary

This change should stay mostly inside `sidebar/panel.css`, with only small HTML class refinements if required for better selector targeting. Avoid reworking the host experiment and avoid restructuring business DOM unless layout cannot be expressed cleanly with the existing markup.

## Success Criteria

The change is successful only if all of the following are true:

- Width changes cause real control reflow, not just narrower versions of the same layout.
- Height changes keep the top and bottom regions usable while the middle region absorbs the scroll pressure.
- Bottom information stacks naturally in narrow mailpane widths.
- Internal layout does not force the host column wider through popup-era minimum widths.
- Feature scope, button order, module order, and behavior remain equivalent to the popup UI.

## Validation

Verification should cover:

- CSS/layout tests for wrapping and min-height behavior in `mailpane` mode.
- Manual Thunderbird confirmation that controls and sections visibly reposition when pane width and height change.
- Regression check that opaque mailpane behavior remains intact.
