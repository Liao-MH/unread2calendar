import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('thunderbird-addon/manifest.json');
const backgroundPath = path.resolve('thunderbird-addon/background.js');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const background = fs.readFileSync(backgroundPath, 'utf8');

assert.equal(manifest.browser_action?.default_popup, 'sidebar/panel.html', 'browser_action must use sidebar/panel.html popup');
assert.equal(manifest.message_display_action?.default_popup, 'sidebar/panel.html', 'message_display_action must use sidebar/panel.html popup');

const experiments = manifest.experiment_apis || {};
assert.equal(Object.prototype.hasOwnProperty.call(experiments, 'TbMailPane'), false, 'TbMailPane must be removed in full-popup mode');

assert.equal(background.includes('showErrorPopup('), false, 'full-popup mode should not trigger error popup calls; use status line errors instead');

console.log('popup mode tests passed');
