import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');
const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');
const appearanceJs = fs.readFileSync(path.resolve('thunderbird-addon/common/appearance.js'), 'utf8');

assert.match(optionsHtml, /id="appearanceTheme"/, 'options should expose a single appearance theme selector');
assert.doesNotMatch(optionsHtml, /id="appearanceMode"/, 'options should no longer expose a separate appearance mode selector');
assert.doesNotMatch(optionsHtml, /id="appearancePreset"/, 'options should no longer expose a separate preset selector');

assert.match(optionsJs, /const appearanceTheme = document\.getElementById\('appearanceTheme'\);/, 'options should bind the single appearance theme selector');
assert.match(optionsJs, /themeId:\s*appearanceTheme\.value/, 'options should persist appearance through a single themeId field');
assert.match(optionsJs, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/, 'options should observe Thunderbird dark-mode changes');
assert.match(optionsJs, /appearanceTheme\.value === 'follow_tb'/, 'options should only follow live dark-mode changes when theme follows Thunderbird');

assert.match(panelJs, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/, 'panel should observe Thunderbird dark-mode changes');
assert.match(panelJs, /vm && vm\.appearance && vm\.appearance\.themeId === 'follow_tb'/, 'panel should only live-reapply when appearance follows Thunderbird');

assert.match(appearanceJs, /themeId:\s*'follow_tb'/, 'appearance defaults should use a single follow-Thunderbird theme id');
assert.match(appearanceJs, /function legacyThemeIdFromAppearance\(/, 'appearance normalization should map legacy mode\/preset combinations into themeId');
assert.match(appearanceJs, /const followPresetId = isThunderbirdDark \? 'contrast_dark' : 'contrast_light';/, 'appearance should resolve follow-Thunderbird mode to explicit dark\/light presets');
assert.match(appearanceJs, /if \(themeId === 'follow_tb'\)/, 'appearance should branch explicitly for follow-Thunderbird mode');

console.log('appearance follow thunderbird tests passed');
