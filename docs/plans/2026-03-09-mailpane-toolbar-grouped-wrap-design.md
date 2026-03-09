# Mailpane Toolbar Grouped Wrap Design

## Context

The Thunderbird mailpane host is already visible and stable enough for iteration, but the top toolbar still behaves like a generic responsive layout instead of a mail-style tool strip. In `v2.0.15`, the toolbar shrinks gaps and wraps, but it still lets the browser decide row composition too freely. That produces an unwanted result: even when the pane is visually wide enough, the toolbar may wrap earlier than desired, and the rows do not preserve the semantic grouping the user expects.

The user clarified the intended interaction precisely:
- Default layout should remain two grouped rows.
- Row 1: `扫描未读 / 刷新 / 全部展开 / 配置 / 清屏`
- Row 2: `暂停 / 继续 / 取消任务`
- When width is insufficient, wrapping must happen *within each group only*.
- Group order must never change, and controls from different groups must never mix on the same row.
- Button labels must always remain single-line.
- Button width should stay content-driven, roughly equivalent to text width plus about one Chinese character of padding on each side.
- In narrow layouts, line gaps inside a group should be smaller than the vertical gap between the main action group and the task group.

## Decision

The toolbar should stop using a free-flowing generic layout model and instead become a grouped mailpane toolbar with explicit semantic wrappers. The implementation should introduce two toolbar-group containers in `panel.html`:
- `toolbar-group toolbar-group-primary` for the five primary actions
- `toolbar-group toolbar-group-task` for the three task actions

Each group will own its own wrapping behavior. The parent `top-fixed` remains a vertical stack, but the grouped toolbar area becomes:
- one large gap between the primary group and the task group
- smaller internal row gaps within each group

Within each group, buttons keep source order and use `flex-wrap`. This allows the primary group to split into two rows when needed while leaving the task group on its own row. If the pane gets even narrower, the task group may also split into multiple rows, but still only within that group.

## Layout Rules

### 1. Group semantics
- Two explicit wrappers define the two logical rows.
- The default wide layout is naturally two rows because each group is a separate block.
- No cross-group reflow is allowed.

### 2. Button sizing
- Buttons remain `white-space: nowrap`.
- Buttons use content-driven width, not equal-width fill.
- CSS should express this with stable inline padding and `flex: 0 0 auto` or `flex: 0 1 auto`, depending on the final balance needed for shrink behavior.
- Buttons must not stretch to fill full row width.

### 3. Wrap behavior
- Group containers use `display: flex` and `flex-wrap: wrap`.
- Wrapping occurs only when the current group can no longer fit its buttons.
- The first wrap target is the primary group, because it has more controls.
- The task group may also wrap when the pane becomes narrower.

### 4. Spacing hierarchy
- Group-internal column gaps should be modest and compressible.
- Group-internal row gaps should be slightly smaller than the space between the two groups.
- The group-to-group gap should remain visually stronger so the toolbar still reads as “primary row” and “task row”.

## Implementation Boundary

This should remain a narrow UI-only change:
- `panel.html`: add grouping wrappers around the existing buttons
- `panel.css`: implement grouped mailpane toolbar rules under `body[data-layout="mailpane"]`
- `panel.js`: no behavior changes expected, assuming button ids remain unchanged

The Thunderbird host implementation should not be touched in this iteration.

## Verification

The desired outcome is:
1. Wide mailpane: exactly two grouped rows
2. Narrower mailpane: primary group wraps internally, task group stays below it
3. Very narrow mailpane: both groups may wrap internally
4. Button text never wraps
5. Buttons remain content-sized instead of full-width stretched
6. Intra-group row gap is smaller than inter-group gap

Tests should be updated to assert grouped wrappers and grouped wrap behavior rather than generic free-flowing toolbar behavior.
