# Mailpane Responsive Layout And Opaque Host Design

## Background

The Todo pane now loads as a real column in the mail tab, but two issues remain:

1. The embedded panel layout still behaves like a popup. Buttons and modules do not reflow well as the mailpane width or window height changes.
2. The host still keeps mouse-enter and mouse-leave opacity behavior, but the user no longer wants any dimming. The pane should remain normally visible at all times.

The user explicitly wants:

- the existing popup feature body to stay intact
- mailpane mode to adapt its internal layout automatically to available width and height
- no opacity changes at all

## Decisions

### 1. Keep one functional UI, but give mailpane mode its own responsive container rules

`panel.html` and `panel.js` remain the only functional Todo UI. No business modules are added, removed, hidden behind menus, or reordered.

The change is purely about how the existing structure behaves inside a resizable mailpane column. Mailpane mode will keep the same top toolbar, task bar, group list, and footer modules, but `panel.css` will apply container-aware rules under `body[data-layout="mailpane"]`.

This avoids introducing a second UI while making the embedded panel behave like a real resizable column rather than a popup pasted into a taller container.

### 2. Make top and task controls wrap naturally in mailpane mode

The fixed-column grids used by the popup are the main cause of poor resizing behavior. In mailpane mode:

- `.topbar` should become a wrapping flex row or auto-fit layout
- `.taskbar` should also wrap
- button order must stay unchanged
- buttons should keep usable minimum sizes without forcing the pane wider than the host allows

The goal is that shrinking the column causes controls to wrap to additional rows instead of clipping, overlapping, or forcing awkward spacing.

### 3. Preserve vertical hierarchy: top grows naturally, groups scroll, footer stays usable

The panel should continue to use a three-part shell:

- top controls
- group list
- footer

In mailpane mode:

- the top area should size to content
- the middle `groups` area should absorb remaining height and remain the primary scroll region
- the footer should remain visible and stack cleanly in narrower widths

This keeps scanning, import, status, and version information available even when the pane is short.

### 4. Remove host dimming entirely

Host opacity changes are no longer wanted. The host should always render at normal opacity.

Implementation should remove:

- `mouseenter` / `mouseleave` opacity handlers
- host transition rules that only existed for dimming
- dimming-specific tests that assert `0.3` opacity behavior

This is not a configurable feature anymore. The desired behavior is simply “always opaque”.

## Success Criteria

The implementation is correct only if all of the following are true:

1. In mailpane mode, narrowing the Todo pane causes the top buttons and task buttons to wrap naturally instead of staying in rigid fixed columns.
2. Reducing window height keeps the top and footer usable while the center list scrolls.
3. Footer content remains readable and can stack vertically in narrow columns.
4. The pane stays fully opaque at all times.
5. Popup mode remains functionally unchanged apart from shared safe CSS improvements.

## Testing Strategy

### Layout regression

Add or update tests to assert that:

- mailpane layout no longer depends on rigid fixed toolbar grids
- mailpane mode explicitly allows wrapping in top and task controls
- mailpane mode keeps the central list as the scrolling region

### Host behavior regression

Update tests to assert that:

- host dimming handlers are removed
- no mailpane host logic sets opacity to `0.3`

### Release validation

As with recent iterations:

- update versioned references in manifest and READMEs
- update `docs/CHANGELOG.md`
- rebuild the Thunderbird XPI into main-repo `dist/`

## Implementation Notes

- Prefer CSS-first changes in `panel.css`, with only minimal structural or class changes if required.
- Do not add a more-menu or hide controls; the user chose automatic wrapping while preserving order.
- Keep the current mailpane host structure unless it is directly needed to support permanent opacity.
