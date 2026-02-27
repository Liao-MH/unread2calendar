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
assert.match(panelCss, /border: 1px solid var\(--group-accent/, 'panel css should bind item border to group accent');
assert.match(panelJs, /function resolveGroupVisual\(groupKey, appearance\)/, 'panel should resolve group visual tokens');
assert.match(panelJs, /container\.style\.setProperty\('--group-accent'/, 'panel should write group accent style per group');

console.log('group decision color tests passed');
