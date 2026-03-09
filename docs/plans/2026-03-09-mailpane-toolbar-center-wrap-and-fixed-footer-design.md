# Mailpane Toolbar Centered Wrap And Fixed Footer Design

## Context

The mailpane toolbar is already split into two semantic groups, but the current behavior still does not match the intended interaction. The user provided three additional constraints:
- When space is sufficient, the original two toolbar rows should remain centered.
- When a group no longer fits on one row, only that group may wrap, and the wrapped lines must become left-aligned.
- The footer must remain visible at all times; height pressure should be absorbed by the middle todo content area alone.

This means the current CSS-only grouped wrap is still too coarse. It can preserve groups, but it cannot reliably express the state transition from “single-row centered” to “wrapped left-aligned”, nor can it guarantee that the footer remains visible while the middle section alone scrolls.

## Decision

The mailpane layout should keep the existing grouped toolbar structure, but add explicit per-group layout state:
- `toolbar-group--single`: single-row centered
- `toolbar-group--wrapped`: wrapped and left-aligned

These states should be applied independently to the primary action group and the task action group. In mailpane mode, `panel.js` should detect whether each group has wrapped by checking whether its buttons still share the same row. CSS then maps that state to alignment behavior.

At the page level, the panel should become a strict three-zone layout:
- top controls: always visible
- middle groups area: only main scroll container and only height-flex region
- footer: always visible and fixed at the bottom of the panel viewport

## Layout Rules

### 1. Toolbar group alignment
- Primary group order remains `扫描未读 / 刷新 / 全部展开 / 配置 / 清屏`.
- Task group order remains `暂停 / 继续 / 取消任务`.
- When a group is not wrapped, it uses `justify-content: center`.
- When a group wraps, it switches to `justify-content: flex-start`.
- Wrapping is still allowed only within each group; groups must never mix.

### 2. Button sizing
- Button labels must remain single-line.
- Button width remains content-driven.
- Inline padding should approximate “one Chinese character of extra width” on each side.
- Buttons must not stretch to fill the available row width.

### 3. Vertical layout
- `top-fixed` becomes a non-shrinking region.
- `groups` becomes the sole `flex: 1` and `overflow: auto` region.
- `footer` becomes a non-shrinking region that always remains visible.
- When height shrinks, only the middle groups area should lose visible space.

### 4. Spacing hierarchy
- Toolbar group internal row gaps stay tighter.
- Gap between the primary and task groups stays larger.
- Footer spacing should remain compact so it does not consume avoidable height.

## Implementation Boundary

This remains a narrow panel-level change:
- `panel.css`: add fixed top/middle/footer layout rules and state-driven toolbar alignment rules
- `panel.js`: add lightweight wrapped-state detection for each toolbar group in mailpane mode
- `panel.html`: no structural host changes; existing grouped toolbar wrappers are sufficient

The Thunderbird host implementation must not change in this iteration.

## Verification

The desired outcome is:
1. Wide mailpane: two centered toolbar rows
2. Narrower mailpane: wrapped groups become left-aligned, but only within their own group
3. Task group remains centered when single-line
4. Footer remains visible at all times
5. Middle content area alone handles height compression and scrolling
6. Button labels never wrap and buttons remain content-sized

Tests should cover:
- grouped toolbar state classes or their expected behavior hooks
- `groups` as the only main scroll container
- footer non-shrinking visibility contract in mailpane mode
