# Thunderbird Mail Pane Full Panel Content Design

## Goal

Make the Thunderbird fourth-column mail pane render the full popup feature body as the primary UI, with only minimal mailpane layout adaptation, and never remain blank. If the embedded panel fails to load, the fourth column must show an inline error placeholder instead of an empty pane.

## Scope

- Reuse the existing popup feature body from `thunderbird-addon/sidebar/panel.html` and `thunderbird-addon/sidebar/panel.js` as the only functional UI inside the fourth column.
- Preserve the existing popup feature set and interaction structure.
- Allow only the minimum layout changes required for a wider and taller embedded mailpane container.
- Add a mailpane-local loading/error placeholder so the fourth column never appears blank.

Out of scope:
- Adding new business features or new control modules.
- Replacing the panel business logic with a second implementation.
- Reintroducing popup as the primary UI path.

## Current Problem

The fourth-column host is now able to appear, but the actual add-on feature body is still blank in the embedded area. That means the current bottleneck is no longer only host visibility. The mailpane host exists, but the content loading path for `panel.html?layout=mailpane` is not producing a visible, ready feature surface.

Because the user explicitly wants the original popup feature body, the correct target is not “show some diagnostics” or “build a new mailpane UI”. The target is: when the fourth column opens, the user should see the same main panel content that popup used to show, with the same controls, lists, status area, and workflows.

## Architecture

Use a strict two-layer model:

1. Host layer: `TbMailPane` experiment owns only the Thunderbird-integrated shell.
   - Create and position the right-side container.
   - Manage width, visibility, transparency, and loading state.
   - Load the feature page.
   - Detect success vs. blank/failure.
   - Render inline fallback content if the page does not become ready.

2. Feature layer: `panel.html` + `panel.js` remain the only functional add-on UI.
   - All existing buttons, task controls, groups, import actions, and status behavior continue to live here.
   - Mailpane mode only adapts layout sizing and embed readiness signaling.

This keeps the fourth column from turning into a second application shell. The host must not own business logic. It only guarantees that the feature page either renders successfully or visibly fails.

## Rendering Model

The fourth column should always have one of three explicit states:

- `loading`: host exists and is attempting to load the embedded feature page.
- `ready`: embedded feature page has emitted a minimal ready signal and is visibly present.
- `error`: embedded feature page did not reach ready, so the host shows an inline placeholder.

The inline placeholder is not a second feature UI. It is only a thin fallback surface inside the fourth column, with:
- a short failure message
- a retry action

This avoids the current “blank pane” failure mode.

## Embedded Feature Content

The embedded page should continue to be:
- `sidebar/panel.html?layout=mailpane`

And it should continue to provide the popup feature body:
- top button bar
- task control row
- setup/context hints
- grouped todo content
- footer import and status area
- account and calendar pickers

No new feature sections should be introduced.

Minimal mailpane adaptation is allowed only where popup assumptions break in a full-height embedded container:
- remove popup width/height caps
- fill the host height
- keep scrolling isolated to the content list area
- keep header/footer visible in a larger pane

Button order, section order, and feature scope should stay as close to popup as possible.

## Readiness Contract

Host-visible success must be upgraded from “the shell is visible” to “the feature body is ready”.

Recommended contract:
- the embedded page emits a lightweight ready signal once its main shell is mounted and key regions exist
- the host waits for that signal within a bounded timeout
- if the signal arrives, host enters `ready`
- if it does not arrive, host enters `error`

This ready signal should be minimal and structural. It should not depend on remote data, scanning results, or calendars loading. The requirement is only that the panel itself has rendered and initialized.

A suitable threshold is:
- DOM shell created
- top-level app container exists
- primary controls are mounted

This keeps readiness stable and fast.

## Error Handling

Failure behavior should prioritize visible in-pane feedback over hidden logs.

If embedded content does not become ready:
- the fourth column should not stay empty
- the host should switch to inline error placeholder mode
- a retry action should attempt to reload the embedded panel content in place

Console logging can remain for debugging, but the user-facing fallback is the in-pane placeholder.

The existing native alert path can remain as a secondary diagnostic tool if needed later, but it is not the main user-facing failure state for this design.

## Likely Implementation Areas

Primary files:
- `thunderbird-addon/api/tbMailPane/implementation.js`
- `thunderbird-addon/api/tbMailPane/schema.json`
- `thunderbird-addon/sidebar/panel.html`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/background.js`
- `tests/mailpane-open-flow.test.mjs`
- `tests/mailpane-layout.test.mjs`
- new tests for embedded readiness / fallback behavior

Probable changes:
- add explicit loading/error DOM inside the mailpane host layer
- add a minimal panel-ready signal from embedded content to host
- update the host to wait for ready before declaring success
- add inline retry for content load failure
- keep popup-aligned structure in `panel.html`
- extend tests so “blank but visible host” is treated as failure

## Validation Criteria

The design is successful if all of the following are true:

1. Opening the add-on in Thunderbird fourth-column mode shows the full popup feature body, not a blank panel.
2. The visible content matches popup feature scope, with only minimal layout adaptation.
3. The host declares success only after the embedded panel is structurally ready.
4. If the embedded content fails to become ready, the fourth column shows an inline error placeholder instead of empty space.
5. Existing mailpane host behavior for width, visibility, and opacity still works.

## Test Strategy

Tests should cover three levels:

1. Host behavior
- host still creates the fourth column
- visibility and opacity behavior remain intact
- content-load failure transitions to inline fallback instead of blank

2. Embedded panel contract
- `panel.html?layout=mailpane` remains the main feature entry
- mailpane mode still exposes the primary popup sections
- a structural ready signal exists and is emitted from panel startup

3. Open flow
- opening the pane requires both host visibility and embedded readiness
- no blank-visible state is treated as success
- retry path exists for inline fallback

## Decision Summary

Confirmed decisions from discussion:
- Render the original popup feature body inside the fourth column.
- Keep feature scope the same as popup.
- Allow only minimal mailpane layout adaptation.
- If content loading fails, show inline fallback content in the fourth column instead of leaving it blank.

