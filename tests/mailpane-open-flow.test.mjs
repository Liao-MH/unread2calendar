import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const background = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/manifest.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/schema.json'), 'utf8'));
const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(background, /async function openTodoWindowInCurrentContext\(tab, toggle\)/, 'open helper should still exist');
assert.match(background, /if \(browser\.TbMailPane(?:\s*&&|\))/m, 'open helper should prefer TbMailPane');
assert.doesNotMatch(background, /browserAction\.openPopup/, 'mailpane mode should not call browserAction.openPopup');
assert.doesNotMatch(background, /browser\.tabs\.create\(/, 'open helper should fail fast instead of silently falling back to a tab');
assert.match(background, /await browser\.TbMailPane\.getState\(\)/, 'open helper should verify the injected pane state after requesting show');
assert.match(background, /if\s*\(!paneState\.visible\)/, 'open helper should hard-fail when the pane is still not visible');
assert.match(background, /await showTodoPaneOpenFailureAlert\(\)/, 'open helper should trigger a native failure alert');
assert.match(background, /openTodoWindowInCurrentContext\(tab,\s*false\)/, 'toolbar button handlers should request show, not toggle away the pane');
assert.equal(schema[0]?.functions?.some((entry) => entry.name === 'showFailureAlert'), true, 'TbMailPane should expose a native failure alert bridge');
assert.equal(manifest.experiment_apis?.TbMailPane?.parent?.script, 'api/tbMailPane/implementation.js', 'mailpane experiment should stay registered');
assert.doesNotMatch(impl, /"-moz-box"/, 'mailpane host should not rely on invalid -moz-box display values');
assert.match(impl, /host\.hidden\s*=\s*!visible/, 'mailpane host visibility should use the hidden state');
assert.match(impl, /splitter\.hidden\s*=\s*!visible/, 'mailpane splitter visibility should use the hidden state');
assert.match(impl, /function isPaneActuallyVisible\(/, 'mailpane experiment should expose a real visibility check');

console.log('mailpane open flow tests passed');
