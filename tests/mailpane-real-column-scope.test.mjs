import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /getElementById\("tabmail-container"\)/, 'mailpane host should attach to tabmail-container instead of the window root');
assert.match(impl, /getElementById\("today-pane-panel"\)/, 'mailpane host should account for the today pane when choosing its row container');
assert.match(impl, /getElementById\("today-splitter"\)/, 'mailpane host should account for the today splitter when choosing its row container');
assert.match(impl, /function getPaneInsertionPoint\(/, 'mailpane host should centralize the shared row insertion point');
assert.match(impl, /anchor:\s*todaySplitter\s*\|\|\s*todayPane\s*\|\|\s*null/, 'mailpane host should define an insertion anchor before the today pane area');
assert.match(impl, /insertBefore\(splitter,\s*insertionAnchor\)/, 'mailpane splitter should be inserted before the today pane area');
assert.match(impl, /insertBefore\(host,\s*insertionAnchor\)/, 'mailpane host should be inserted before the today pane area');
assert.doesNotMatch(impl, /host\.style\.position\s*=\s*"fixed"/, 'mailpane host should no longer be a fixed overlay');
assert.doesNotMatch(impl, /splitter\.style\.position\s*=\s*"fixed"/, 'mailpane splitter should no longer be a fixed overlay');
assert.match(impl, /currentTabInfo/, 'mailpane host should inspect the currently selected tab');
assert.match(impl, /mail3PaneTab/, 'mailpane host should only stay visible for the mail3PaneTab');
assert.match(impl, /function isMailThreePaneTabActive\(/, 'mailpane host should centralize main mail tab detection');
assert.match(impl, /function shouldShowPaneInWindow\(/, 'mailpane host should centralize visibility policy for the active tab');
assert.match(impl, /host\.style\.alignSelf\s*=\s*"stretch"/, 'mailpane host should stretch vertically with the shared row container');
assert.match(impl, /splitter\.style\.alignSelf\s*=\s*"stretch"/, 'mailpane splitter should stretch vertically with the shared row container');

console.log('mailpane real column scope tests passed');
