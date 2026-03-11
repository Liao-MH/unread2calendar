import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /getElementById\("tabmail-container"\)/, 'mailpane host should attach to tabmail-container instead of the window root');
assert.match(impl, /paneContainer\.appendChild\(splitter\)/, 'mailpane splitter should append directly to the tabmail container in the 2.0.11 host baseline');
assert.match(impl, /paneContainer\.appendChild\(host\)/, 'mailpane host should append directly to the tabmail container in the 2.0.11 host baseline');
assert.doesNotMatch(impl, /getElementById\("today-pane-panel"\)/, 'mailpane host should not depend on today pane DOM internals');
assert.doesNotMatch(impl, /getElementById\("today-splitter"\)/, 'mailpane host should not depend on today splitter DOM internals');
assert.doesNotMatch(impl, /function getPaneInsertionPoint\(/, 'mailpane host should not introduce a shared-row insertion helper');
assert.doesNotMatch(impl, /insertBefore\(/, 'mailpane host should not reorder Thunderbird internal siblings');
assert.doesNotMatch(impl, /host\.style\.position\s*=\s*"fixed"/, 'mailpane host should no longer be a fixed overlay');
assert.doesNotMatch(impl, /splitter\.style\.position\s*=\s*"fixed"/, 'mailpane splitter should no longer be a fixed overlay');
assert.match(impl, /currentTabInfo/, 'mailpane host should inspect the currently selected tab');
assert.match(impl, /mail3PaneTab/, 'mailpane host should only stay visible for the mail3PaneTab');
assert.match(impl, /function isMailThreePaneTabActive\(/, 'mailpane host should centralize main mail tab detection');
assert.match(impl, /function shouldShowPaneInWindow\(/, 'mailpane host should centralize visibility policy for the active tab');
assert.doesNotMatch(impl, /alignSelf\s*=\s*"stretch"/, 'mailpane host baseline should not rely on manual stretch overrides');

console.log('mailpane real column scope tests passed');
