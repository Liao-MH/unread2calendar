# Thunderbird UI/State Redesign (Validated)

Date: 2026-02-24  
Scope: Thunderbird addon panel interaction and grouping behavior  
Decision baseline: Mixed approach (`background.js` for state transitions, `panel.js` for display behavior)

---

## 1. Goals

1. Align panel behavior with confirmed UX consensus.
2. Keep state transitions deterministic and testable.
3. Minimize UI ambiguity by enforcing strict display rules.

---

## 2. Confirmed Rules (Frozen)

1. Event cards show only three fields: title, time, location.
2. If time/location is missing, hide that line (no placeholder text).
3. `Accepted Events` group is always last and collapsed by default.
4. Other regular groups are expanded by default.
5. Regular group names/order are LLM-driven, except fixed anchors:
   - `可能重要的事` goes first when present.
   - `已接受事件` goes last.
6. Accept action moves item out of source group into `已接受事件`.
7. Reject action keeps item in original group and original position, dimmed, recoverable.
8. Edit input fields appear only after double-clicking a `todo` card.
9. Duplicate items must show duplicate hint in title and support inline expansion of related emails.
10. Clicking an email in duplicate list jumps to that mail and shows full content.
11. Version text should be a single small line at the bottom, not a standalone panel block.

---

## 3. Architecture Split

### 3.1 Background Responsibilities

1. Normalize event status transitions (`pending`, `queued`, `rejected`, etc.).
2. Maintain stable per-item ordering key so rejected items can stay in-place.
3. Build ViewModel groups with source-of-truth item membership.
4. Attach duplicate metadata (`duplicateCount`, related message list).

### 3.2 Panel Responsibilities

1. Apply render anchors (important-first, accepted-last).
2. Manage default collapse state (`accepted` collapsed only).
3. Render three-line card format with conditional row visibility.
4. Handle click/double-click UI behavior and inline duplicate list expansion.

---

## 4. Interaction State Machine Addendum

1. `todo: pending -> queued`: remove from source group, insert into `已接受事件`.
2. `todo: pending/queued -> rejected`: keep source group and source index, apply dimmed style.
3. `todo: rejected -> pending`: restore active style at same index.
4. Single-click: select + open source mail only.
5. Double-click (`todo` only): open edit controls.

---

## 5. Error Handling

1. Backend actions return explicit failure reasons.
2. Panel status area uses unified format: `Action failed: reason`.
3. Partial UI failures (e.g., duplicate list load) must not block full list rendering.

---

## 6. Verification Checklist

1. All cards comply with 3-line rule.
2. Accepted/rejected transitions match expected group/position behavior.
3. Duplicate card click expands related email list.
4. Clicking related email jumps to message and loads full content.
5. Version line appears at footer in compact text style.
6. No edit controls appear on single click.

---

## 7. Implementation Order

1. Update panel layout/CSS (three-line card + footer version line).
2. Implement state/group transition adjustments in `background.js`.
3. Implement duplicate inline mail list and click-through behavior.
4. Run syntax checks and manual regression against checklist.
