import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');
const panelCss = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.css'), 'utf8');
const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');
const appearanceJs = fs.readFileSync(path.resolve('thunderbird-addon/common/appearance.js'), 'utf8');

assert.match(optionsHtml, /id="appearanceGroupAccentImportant"/, 'options should render important-group accent color input');
assert.match(optionsHtml, /id="appearanceGroupBgImportant"/, 'options should render important-group optional bg input');
assert.match(optionsHtml, /id="appearanceGroupAccentAcademic"/, 'options should render academic-group accent color input');
assert.match(optionsHtml, /id="appearanceGroupAccentUnrecognized"/, 'options should render unrecognized-group accent color input');

assert.match(optionsJs, /groupStyles:\s*\{[\s\S]*important:/, 'options should collect group style payload');
assert.match(optionsJs, /appearanceGroupBgInputs/, 'options should track optional group bg inputs');
assert.match(optionsJs, /appearanceGroupAccentImportant\.value/, 'options should apply saved group accent color values');

assert.match(appearanceJs, /DEFAULT_GROUP_STYLES/, 'appearance module should define default group styles');
assert.match(appearanceJs, /groupStyles:\s*normalizedGroupStyles/, 'appearance normalization should keep group styles');

assert.match(panelCss, /\.group \.item-actions \.primary \{/, 'panel css should style primary action button by group variables');
assert.match(panelCss, /\.group\s*\{[\s\S]*border: 1px solid var\(--group-accent, var\(--e2c-card-border\)\);/, 'panel css should expose group container borders through group accent variables');
assert.match(panelCss, /\.group\s*\{[\s\S]*background: var\(--group-bg, var\(--e2c-card-bg\)\);/, 'panel css should expose group container backgrounds through group background variables');
assert.match(panelCss, /\.group\s*\{[\s\S]*overflow:\s*hidden;/, 'panel group containers should clip inner regions to the card radius');
assert.match(panelCss, /\.group-header\s*\{[\s\S]*border-bottom: 1px solid var\(--group-accent, var\(--e2c-card-border\)\);/, 'panel css should tint group headers with the group accent');
assert.match(panelCss, /\.group-header\s*\{[\s\S]*background: var\(--group-header-bg, transparent\);/, 'panel css should expose group-header background variables');
assert.doesNotMatch(panelCss, /\.group-header\s*\{[^}]*border-radius:/, 'panel group headers should not own a separate radius once the outer group clips content');
assert.match(panelCss, /\.item\s*\{[\s\S]*border: 1px solid var\(--group-accent/, 'panel css should bind item border to group accent');
assert.match(panelCss, /\.item\s*\{[\s\S]*overflow:\s*hidden;/, 'panel item cards should clip inner content to the card radius');
assert.match(panelJs, /function resolveGroupVisual\(groupKey, appearance\)/, 'panel should resolve group visual tokens');
assert.match(panelJs, /container\.style\.setProperty\('--group-accent'/, 'panel should write group accent style per group');
assert.match(panelJs, /container\.style\.setProperty\('--group-bg'/, 'panel should write group container background styles per group');
assert.match(panelJs, /container\.style\.setProperty\('--group-header-bg'/, 'panel should write group header background styles per group');

console.log('group decision color tests passed');
