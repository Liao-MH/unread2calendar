import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const background = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.match(background, /async function openTodoWindowInCurrentContext\(tab, toggle\)/, 'open helper should still exist');
assert.match(background, /if \(browser\.TbMailPane(?:\s*&&|\))/m, 'open helper should prefer TbMailPane');
assert.doesNotMatch(background, /browserAction\.openPopup/, 'mailpane mode should not call browserAction.openPopup');
assert.match(background, /browser\.tabs\.create\(/, 'open helper should retain tab fallback');

console.log('mailpane open flow tests passed');
