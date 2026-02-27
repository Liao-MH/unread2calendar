# Unread2Calendar Todo Sidebar

[中文](./README.md) | [English](./README.en.md)

> A Thunderbird add-on that extracts actionable events from emails and imports confirmed items into calendar.

## Table of Contents
- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Installation](#installation)
- [Quick Start (30s)](#quick-start-30s)
- [How to Use](#how-to-use)
- [Settings Guide](#settings-guide)
- [FAQ (Quick Lookup)](#faq-quick-lookup)
- [Privacy & Data](#privacy--data)
- [User-Relevant Project Paths](#user-relevant-project-paths)
- [Version & Updates](#version--updates)

## Overview
`Unread2Calendar Todo Sidebar` scans email content, extracts potential tasks/events, lets you review decisions, then imports accepted items into Thunderbird Calendar.

Typical scenarios:
- Scan unread mail and extract talks, classes, activities, reminders.
- Separate potentially important personal messages into a dedicated group.
- Review every extracted item before calendar import.
- Keep a 30-day import history for audit and validation. (If you want to use apple calendar, here could be the tutorial: www.youtube.com/watch?v=hBXJKkMuXZ0)

## Core Capabilities
- Extraction entry points:
  - `Scan Unread` (account picker, Inbox + subfolders)
  - `Refresh` (clear current list and process current email only)
  - Context menu `Recognize Todos` (selected emails)
- Extraction engines:
  - If LLM is configured: LLM-first.
  - If not configured: local rules fallback.
- LLM support:
  - Cloud OpenAI-compatible APIs.
  - Local models: OpenAI-compatible local endpoint + native Ollama endpoint.
- Groups and display:
  - Fixed first group: `Possibly Important`
  - Fixed last group: `No Todo Recognized`
  - Fixed bottom block: `Added to Calendar` (collapsed by default)
- Task controls: `Pause / Resume / Cancel`
- Calendar import:
  - Calendar picker before import
  - View jump after import
  - Import history for verification
- Settings center:
  - LLM, Prompt, Group Constraints, Local Rules, Appearance, Import/Export

## Installation
### 1) Locate XPI
Build artifacts are in `dist/`.

Example current package:
- `dist/unread2calendar-thunderbird-2.0.2.xpi`
- Latest release direct download:
  - `https://github.com/Liao-MH/unread2calendar/releases/download/v2.0.2/unread2calendar-thunderbird-2.0.2.xpi`

### 2) Install in Thunderbird
1. Open Thunderbird.
2. Go to `Add-ons and Themes`.
3. Click the gear icon, choose “Install Add-on From File...”.
4. Select the `.xpi` file.
5. Restart Thunderbird (recommended).

### 3) Verify button visibility
You should see a `Todo Sidebar` entry in toolbar or message-related entry points.

If not visible:
- Ensure the add-on is enabled.
- Add the button via toolbar customization.
- If shown as a menu-style action, open its dropdown and select the todo action.

## Quick Start (30s)
1. Click `Scan Unread`.
2. Select one or more mail accounts, then click `Start Scan`.
3. Watch the bottom status line (e.g., `Status: uploaded x/y emails`).
4. Click an item to open source email + expand details.
5. Decide each item (`Confirm/Reject/Mark Read/Convert`).
6. Click `Import Calendar`, choose calendar, confirm.
7. Validate records in `Added to Calendar`.

## How to Use
### 1) Main panel layout
- Top fixed action row: `Scan Unread`, `Refresh`, `Expand/Collapse All`, `Settings`, `Clear`
- Top fixed task row: `Pause`, `Resume`, `Cancel`
- Middle scroll area: groups + event cards
- Bottom fixed area: `Import Calendar`, `Added to Calendar`, status line, version line

### 2) Difference between entry actions
- `Scan Unread`:
  - Batch workflow
  - Account picker first
  - Scopes to Inbox + subfolders
- `Refresh`:
  - Single-email workflow
  - Clears current list first
  - Uses current active email only
- Context menu `Recognize Todos`:
  - User-selected emails
  - Clears current list first
  - Opens panel automatically with new progress/results

### 3) Event interaction
- Single click item:
  - Opens source email
  - Toggles details (title/time/location)
- Double click item:
  - In-place editing mode
- Decision actions:
  - Regular todo: `Confirm / Reject / Restore`
  - Possibly important: `Convert / Mark Read`

### 4) Groups
- `Possibly Important`: fixed first group.
- Regular groups: driven by configured group constraints + extraction result.
- `No Todo Recognized`: fixed last group with one-line summaries.
- `Added to Calendar`: fixed bottom block, collapsed by default.

### 5) Task controls
- `Pause`: freeze current processing but keep progress and results.
- `Resume`: continue from paused state.
- `Cancel`: terminate current recognition job.
- `Clear`: clear todos/status for a fresh run.

## Settings Guide
Open via `Settings` button in main panel.

### General
- Debug mode toggle for troubleshooting context visibility.

### LLM
- Provider preset + model preset
- “Refresh provider/model presets” button
- Optional parameter switches:
  - Temperature
  - Max Tokens
  - Top P
  - Unchecked means not sent
- Connection test with full diagnostics

Local model notes:
- `Local Model (OpenAI-compatible)` for LM Studio/vLLM-like endpoints
- `Local Model (Ollama)` for native Ollama service
- API key can be empty for local models

### Prompt
- Custom prompt template
- Reset to default prompt

### Group Constraints
- Define allowed group names
- Drag-and-drop sorting
- Shared ordering for LLM constraints/local rules/appearance group style

### Local Rules
- Time keywords, location keywords, group keywords
- Case-insensitive matching
- LLM-derived category keywords can be auto-written back with deduplication

### Appearance
- Basic + advanced customization
- Group-level accent (border/button) and optional group background
- Interactive preview
- Per-module reset to defaults

### Import / Export
- Export settings as JSON
- Import settings from JSON
- Success/failure feedback provided

## FAQ (Quick Lookup)
1. I cannot find `Todo Sidebar` button.
- Ensure add-on is enabled; add button via toolbar customization; check action dropdown menu.

2. Why does panel show “LLM not configured. Running local rules.”?
- LLM config is incomplete/unavailable, so it falls back to local rules.

3. Why does LLM test fail?
- Run `Test Connection` in settings and inspect status code/response body/log text.

4. Do local models require API key?
- Usually no. Cloud providers usually do.

5. Why does `Refresh` return nothing?
- `Refresh` processes the currently active email only. Select an email first.

6. Scan is slow for many emails.
- Reduce body char limit / batch size in settings; use Pause/Resume for chunked processing.

7. “No writable calendar” on import.
- Ensure calendars exist and are writable in Thunderbird; verify add-on permissions.

8. Import says success but event not visible.
- Check selected calendar and target date/time window; verify in `Added to Calendar` history.

9. Displayed time differs from imported calendar time.
- Panel may show source/event timezone while calendar displays local timezone.

10. Why are emails listed under `No Todo Recognized`?
- Extraction found no actionable event; a one-line summary is kept for review.

11. Can I edit extracted items?
- Yes, double-click an event card for in-place editing.

12. Are save/import/export actions acknowledged?
- Yes, success/failure feedback is shown after each operation.

## Privacy & Data
- Local storage includes settings, extracted items, and ~30-day import history.
- Email text is sent to model service only when LLM mode is used.
- You can stay on local-rule mode to avoid sending email text to external services.
- In local model mode, traffic can remain local depending on your model service setup.

## User-Relevant Project Paths
- Add-on code: `thunderbird-addon/`
- Build artifacts: `dist/`
- Build script: `scripts/build_thunderbird_xpi.sh`
- Dev changelog: `docs/CHANGELOG.md`

## Version & Updates
- This README targets add-on version: `v2.0.2`
- Full release history: [docs/CHANGELOG.md](./docs/CHANGELOG.md)
