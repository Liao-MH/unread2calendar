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
assert.match(background, /openTodoWindowInCurrentContext\(tab,\s*false\)/, 'toolbar button handlers should request show, not toggle away the pane');
assert.match(background, /if\s*\(!paneState\.visible\s*\|\|\s*\(!paneState\.contentReady\s*&&\s*paneState\.loadState\s*!==\s*['"]error['"]\)\)/, 'open helper should wait for either ready content or an in-pane error state');
assert.equal(schema[0]?.functions?.some((entry) => entry.name === 'markPanelReady'), true, 'TbMailPane should expose a panel ready bridge');
assert.equal(schema[0]?.functions?.some((entry) => entry.name === 'markPanelLoadFailed'), true, 'TbMailPane should expose a panel failure bridge');
assert.equal(schema[0]?.functions?.some((entry) => entry.name === 'reloadPanel'), true, 'TbMailPane should expose an explicit panel reload API');
assert.equal(manifest.experiment_apis?.TbMailPane?.parent?.script, 'api/tbMailPane/implementation.js', 'mailpane experiment should stay registered');
assert.doesNotMatch(impl, /"-moz-box"/, 'mailpane host should not rely on invalid -moz-box display values');
assert.match(impl, /host\.hidden\s*=\s*!visible/, 'mailpane host visibility should use the hidden state');
assert.match(impl, /splitter\.hidden\s*=\s*!visible/, 'mailpane splitter visibility should use the hidden state');
assert.match(impl, /function isPaneActuallyVisible\(/, 'mailpane experiment should expose a real visibility check');
assert.match(impl, /loadState:\s*["']loading["']/, 'mailpane host should track loading state');
assert.match(impl, /contentReady:\s*false/, 'mailpane host should track embedded panel readiness');
assert.match(impl, /function beginPanelLoad\(/, 'mailpane host should centralize embedded panel loading');
assert.match(impl, /function setPaneLoadState\(/, 'mailpane host should manage loading\/ready\/error state');
assert.match(impl, /function renderPaneFallback\(/, 'mailpane host should render an inline fallback instead of staying blank');
assert.match(impl, /async reloadPanel\(\)/, 'mailpane experiment should implement an explicit panel reload entry point');
assert.match(impl, /beginPanelLoad\(win,\s*paneState,\s*\{\s*force:\s*true\s*\}\)/, 'panel reload should force a fresh embedded panel load');
assert.match(impl, /await waitForPanelOutcome\(win,\s*paneState\)/, 'panel reload should wait for the refreshed panel outcome');
assert.match(impl, /loadState:\s*paneState\.loadState/, 'getState should expose the current load state');
assert.match(impl, /contentReady:\s*!!paneState\.contentReady/, 'getState should expose embedded content readiness');

console.log('mailpane open flow tests passed');
