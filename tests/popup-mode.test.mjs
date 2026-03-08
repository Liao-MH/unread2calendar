import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('thunderbird-addon/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.equal(manifest.browser_action?.default_popup, undefined, 'browser_action should not declare a popup in mailpane mode');
assert.equal(manifest.message_display_action?.default_popup, undefined, 'message_display_action should not declare a popup in mailpane mode');

const experiments = manifest.experiment_apis || {};
assert.equal(Object.prototype.hasOwnProperty.call(experiments, 'TbMailPane'), true, 'TbMailPane must be registered in mailpane mode');

console.log('mailpane manifest compatibility tests passed');
