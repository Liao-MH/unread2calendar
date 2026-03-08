import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /getElementById\("tabmail-container"\)/, 'mailpane host should attach to tabmail-container instead of the window root');
assert.doesNotMatch(impl, /host\.style\.position\s*=\s*"fixed"/, 'mailpane host should no longer be a fixed overlay');
assert.doesNotMatch(impl, /splitter\.style\.position\s*=\s*"fixed"/, 'mailpane splitter should no longer be a fixed overlay');
assert.match(impl, /currentTabInfo/, 'mailpane host should inspect the currently selected tab');
assert.match(impl, /mail3PaneTab/, 'mailpane host should only stay visible for the mail3PaneTab');
assert.match(impl, /function isMailThreePaneTabActive\(/, 'mailpane host should centralize main mail tab detection');
assert.match(impl, /function shouldShowPaneInWindow\(/, 'mailpane host should centralize visibility policy for the active tab');

console.log('mailpane real column scope tests passed');
