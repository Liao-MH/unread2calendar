# Mailpane Real Column And Mail Tab Scope Design

## Background

Current `TbMailPane` behavior has improved from a blank host to a working embedded panel, but three structural issues remain:

1. The Todo pane is rendered as a fixed overlay on top of the message body instead of a real fourth column.
2. Width changes do not participate in Thunderbird's layout, so the message area does not reflow as the pane width changes.
3. The pane is visible across the whole `mail:3pane` window, including non-mail tabs such as Settings and Add-ons Manager.

The user wants the Todo pane to behave as a true fourth column:

- It must sit at the far right of the main mail workspace.
- It must only appear in the main mail three-pane tab.
- It must resize as a real column so the mail workspace narrows alongside it.
- Existing popup functionality must remain the functional body of the pane.

## Decisions

### 1. Replace fixed overlay geometry with a real layout column

The current host uses `position: fixed` and is appended to the window root. That is the direct cause of the overlap bug. The host and splitter will instead be inserted into the `about:3pane` mail workspace as normal layout children.

The Todo pane will be placed at the far right of the whole mail workspace, not just to the right of the message body. This matches the user's requirement that it become the rightmost fourth column for the main mail page.

`TbMailPane` remains responsible for host injection, splitter management, width persistence, opacity-on-leave, and pane visibility. `panel.html` and `panel.js` remain the only business UI and continue to provide the popup's full functionality.

### 2. Scope visibility to the main mail three-pane tab only

Visibility will no longer be keyed only to the `mail:3pane` window. The host must also inspect the active `tabmail` tab and determine whether the selected tab is the main mail three-pane tab.

If the current tab is the main mail tab, the host participates in layout and remains visible.

If the current tab is Settings, Add-ons Manager, or any other non-mail content tab, the host and splitter are hidden. This is not an error condition; it is the intended visibility rule. Internal panel state and persisted width should be preserved so that returning to the mail tab is fast and stateful.

### 3. Make width changes affect real layout

Width drag behavior will continue to use a visible splitter, but drag updates will now change the width of a real layout column rather than move a fixed overlay. That gives the desired behavior:

- the mail workspace narrows when the Todo pane expands
- the pane width responds naturally to container size
- `panel.html` can continue to rely on normal responsive CSS instead of workaround geometry

Existing mailpane-specific CSS should stay minimal. The business UI should remain as close as possible to the popup structure, with only the container rules needed for embedded layout.

## Host Responsibilities

`TbMailPane` should own:

- locating the correct `about:3pane` mail workspace container
- inserting and removing the host column and splitter
- determining whether the selected tab is the main mail three-pane tab
- persisting width and visible state
- managing load states: `loading`, `ready`, `error`
- retaining the existing inline fallback if embedded panel loading fails
- keeping opacity behavior active only when the pane is actually visible

`panel.html` / `panel.js` should continue to own:

- rendering the popup-equivalent Todo UI
- scanning, refresh, import, and item action flows
- ready/failure signaling back to `TbMailPane`

This keeps layout policy in the experiment layer and business behavior in the extension page.

## Success Criteria

The implementation is correct only if all of the following are true:

1. In the main mail three-pane tab, the Todo pane appears as a real right-side column instead of covering the message content.
2. Dragging the pane width causes the mail workspace to reflow.
3. Switching to Settings, Add-ons Manager, or other non-mail tabs hides the pane.
4. Switching back to the main mail tab restores the pane with its previous width and internal state.
5. If `panel.html` fails to initialize, the pane shows the existing inline fallback inside the column rather than leaving a blank or overlapping shell.

## Testing Strategy

Add or update tests in three groups:

### Layout regression

- assert the mailpane host no longer relies on `position: fixed`
- assert geometry logic targets an inserted workspace column instead of root overlay placement

### Scope regression

- assert host visibility depends on the active `tabmail` tab type
- assert non-mail tabs are treated as hidden-by-policy, not host load failures

### Interaction regression

- assert width persistence remains intact
- assert the splitter still exists and updates stored width
- assert mailpane panel loading and fallback behavior still work after the host is moved into real layout

## Implementation Notes

- Prefer incremental change in the experiment host rather than rewriting the panel.
- Do not broaden feature scope beyond these three structural fixes.
- Preserve the existing mailpane load handshake and error fallback path.
- Keep the final user-facing result aligned with the popup feature body, not a redesigned interface.
