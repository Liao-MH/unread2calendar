import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync(path.resolve('thunderbird-addon/manifest.json'), 'utf8'));
const background = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.equal(manifest.browser_action?.default_popup, undefined, 'browser_action must not declare popup in mailpane mode');
assert.equal(manifest.message_display_action?.default_popup, undefined, 'message_display_action must not declare popup in mailpane mode');
assert.equal(manifest.experiment_apis?.TbMailPane?.parent?.script, 'api/tbMailPane/implementation.js', 'TbMailPane experiment must be registered');
assert.match(background, /browser\.TbMailPane\.show\(/, 'background should show the injected mail pane first');

console.log('mailpane mode tests passed');
