import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');
const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');
const appearanceJs = fs.readFileSync(path.resolve('thunderbird-addon/common/appearance.js'), 'utf8');
const backgroundJs = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.match(optionsHtml, /id="appearanceTheme"/, 'options should expose a single appearance theme selector');
assert.doesNotMatch(optionsHtml, /id="appearanceMode"/, 'options should no longer expose a separate appearance mode selector');
assert.doesNotMatch(optionsHtml, /id="appearancePreset"/, 'options should no longer expose a separate preset selector');

assert.match(optionsJs, /const appearanceTheme = document\.getElementById\('appearanceTheme'\);/, 'options should bind the single appearance theme selector');
assert.match(optionsJs, /themeId:\s*appearanceTheme\.value/, 'options should persist appearance through a single themeId field');
assert.match(optionsJs, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/, 'options should observe Thunderbird dark-mode changes');
assert.match(optionsJs, /state\.appearance && state\.appearance\.themeId === 'follow_tb'/, 'options should only follow live dark-mode changes when theme follows Thunderbird');
assert.doesNotMatch(optionsJs, /appearanceTheme\.value = 'custom'/, 'editing appearance fields should not force-switch the selected theme to custom');
assert.match(optionsJs, /type:\s*'todo:preview-appearance'/, 'options should push unsaved live appearance previews to the panel');
assert.match(optionsJs, /type:\s*'todo:clear-appearance-preview'/, 'options should clear unsaved panel previews when needed');

assert.match(panelJs, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/, 'panel should observe Thunderbird dark-mode changes');
assert.match(panelJs, /currentAppearance\(\) && currentAppearance\(\)\.themeId === 'follow_tb'/, 'panel should only live-reapply when appearance follows Thunderbird');
assert.match(panelJs, /message && message\.type === 'todo:apply-appearance-preview'/, 'panel should accept live appearance preview updates');
assert.match(panelJs, /message && message\.type === 'todo:clear-appearance-preview'/, 'panel should clear live appearance preview updates');

assert.match(appearanceJs, /themeId:\s*'follow_tb'/, 'appearance defaults should use a single follow-Thunderbird theme id');
assert.match(appearanceJs, /function legacyThemeIdFromAppearance\(/, 'appearance normalization should map legacy mode\/preset combinations into themeId');
assert.match(appearanceJs, /function resolvePresetId\(themeId,\s*options\)/, 'appearance should resolve follow-Thunderbird mode through an explicit preset resolver');
assert.match(appearanceJs, /if \(themeId === 'follow_tb'\)/, 'appearance should branch explicitly for follow-Thunderbird mode');
assert.match(appearanceJs, /overrides/, 'appearance normalization should preserve sparse manual overrides on top of the selected theme');

assert.match(backgroundJs, /case 'todo:preview-appearance': \{/, 'background should handle unsaved live appearance preview messages');
assert.match(backgroundJs, /case 'todo:clear-appearance-preview': \{/, 'background should handle live appearance preview clearing');
assert.match(backgroundJs, /type:\s*'todo:apply-appearance-preview'/, 'background should rebroadcast live appearance previews to the panel');

console.log('appearance follow thunderbird tests passed');
