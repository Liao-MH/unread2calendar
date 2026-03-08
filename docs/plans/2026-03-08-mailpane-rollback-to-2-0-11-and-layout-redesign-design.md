# Mailpane Rollback To 2.0.11 And Layout Redesign

Date: 2026-03-08
Branch: feat/mailpane-fourth-column
Status: validated design

## Goal

Restore the Thunderbird mailpane implementation to the stable `2.0.11` code and version baseline, then re-solve the remaining layout problem from that baseline: the Todo sidebar content does not truly reflow when the mailpane column width and window height change.

The rollback is intentional and narrow. The problem introduced after `2.0.11` is not the panel content itself; it is the host-layer experimentation added in `2.0.12` and `2.0.13`. The redesign therefore separates two phases:

1. Return code and release metadata to the `2.0.11` state.
2. Rebuild only the internal mailpane layout responsiveness without changing the host geometry again.

## Validated Decisions

- Roll back both code and version to the `2.0.11` baseline before starting new work.
- Treat `b7314ac` as the functional baseline for the sidebar layout and host behavior.
- Do not continue iterating on the `2.0.12` / `2.0.13` host insertion experiments.
- Keep the popup feature set unchanged; only change how the existing panel adapts inside the mailpane column.
- Keep implementation focus on panel-level layout behavior, not Thunderbird host geometry.
- Continue updating `docs/CHANGELOG.md` and main-repo `dist/` for each implementation milestone.

## Rollback Boundary

The rollback should be a controlled file-level rollback, not a repository-wide reset.

Files in scope for rollback:

- `thunderbird-addon/api/tbMailPane/implementation.js`
- tests that were changed to support the `2.0.12` / `2.0.13` host experiments, especially `tests/mailpane-real-column-scope.test.mjs`
- release/version metadata:
  - `thunderbird-addon/manifest.json`
  - `README.md`
  - `README.en.md`
  - `docs/CHANGELOG.md`
- built artifacts under main-repo `dist/`

`thunderbird-addon/sidebar/panel.css` also returns to the `2.0.11` baseline first, but only as the starting point for a new mailpane layout pass.

This rollback should avoid destructive git operations. The code should be restored intentionally so later work remains auditable.

## Post-Rollback Problem Statement

After the rollback, the remaining bug is defined narrowly:

The Todo sidebar appears, but its internal layout still behaves like a compressed popup instead of a true responsive side column. Button rows, task controls, section cards, and footer content do not sufficiently reflow when the sidebar becomes narrower or the Thunderbird window becomes shorter.

This is a panel-layer problem, not a host-layer problem.

## Architecture After Rollback

The restored `2.0.11` host behavior becomes the stable shell.

- `TbMailPane` is responsible only for showing the real right-side column in mail tabs.
- `panel.html` and `panel.js` remain the only business UI.
- `panel.css` in `data-layout="mailpane"` mode becomes the only target for the responsive redesign.

The host implementation should not be expanded again to chase Thunderbird DOM geometry. No more experiments around shared rows, `today-pane-panel`, or alternative insertion anchors should be added unless a fresh host-level bug is proven.

## Layout Redesign Scope

The redesign is limited to mailpane layout behavior inside the existing panel UI.

Allowed changes:

- `panel.css` responsive rules for `data-layout="mailpane"`
- minimal class-level or wrapper-level adjustments in `panel.html` if CSS alone cannot express the required layout behavior
- layout-focused tests

Disallowed changes for this pass:

- changing the popup feature set
- introducing new host geometry logic in `implementation.js`
- changing the visibility rules for non-mail tabs unless rollback restoration requires it
- adding new modules or removing current modules

## Target Responsive Behavior

The mailpane variant should behave like a fluid embedded sidebar, not a popup replica.

### Top controls

- Primary buttons keep their current order.
- Task control buttons keep their current order.
- Both groups reflow fluidly based on available width.
- Controls must move to new rows when space is constrained, rather than staying in popup-era positions and only shrinking.

### Middle content

- The groups area owns the remaining vertical space.
- Section cards may compress vertically, but the main scrolling responsibility stays in the groups container.
- Titles, metadata, and summary text must wrap instead of forcing overflow or fixed-height clipping.

### Footer

- Import actions remain prominent.
- Status, imported-calendar summary, and version information stack naturally in narrow or short layouts.
- The footer should no longer behave like a rigid popup footer pinned to fixed visual geometry.

### Width behavior

- Internal panel content must not indirectly push the host column wider through hidden minimum widths.
- Mailpane-specific rules must prefer wrapping and stacking over overflow.

## Testing Strategy

Validation happens in two stages.

### Stage 1: rollback validation

Confirm that the restored `2.0.11` code path still:

- shows the Todo sidebar in mail tabs
- loads the existing popup feature body in the mailpane
- does not regress into the `2.0.12` / `2.0.13` invisibility failures

### Stage 2: layout validation

Add or update tests that assert the mailpane layout contract instead of Thunderbird DOM experiments.

Test emphasis should move toward:

- fluid button-group layout in mailpane mode
- flexible footer stacking in mailpane mode
- groups container owning the main scroll/stretch behavior
- removal of internal minimum-width assumptions that block reflow

## Release And Verification

Implementation completion should include:

- explicit `✅` outcome summary
- updated `docs/CHANGELOG.md`
- rebuilt XPI copied to main-repo `dist/`
- automated verification before any success claim
- a clear callout of what still requires Thunderbird GUI verification

## Expected Outcome

After the rollback and redesign:

- the sidebar is back to the visible `2.0.11` baseline
- later host regressions are removed
- the remaining work is isolated to panel responsiveness
- the Todo sidebar behaves like a real embedded side column whose internal layout adapts to changing width and height without changing the popup feature set
