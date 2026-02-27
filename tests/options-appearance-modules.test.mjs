import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');

assert.match(optionsHtml, /id="appearanceResetAllTopBtn"/, 'options should render top reset-all button for appearance');
assert.match(optionsHtml, /id="appearanceResetAllBottomBtn"/, 'options should render bottom reset-all button for appearance');
assert.match(optionsHtml, /id="appearanceTopModule"/, 'options should render top-area appearance module');
assert.match(optionsHtml, /id="appearanceMiddleModule"/, 'options should render middle-area appearance module');
assert.match(optionsHtml, /id="appearanceBottomModule"/, 'options should render bottom-area appearance module');
assert.match(optionsHtml, /id="appearanceResetTopModuleBtn"/, 'options should render module-level reset button for top area');
assert.match(optionsHtml, /id="appearanceResetMiddleModuleBtn"/, 'options should render module-level reset button for middle area');
assert.match(optionsHtml, /id="appearanceResetBottomModuleBtn"/, 'options should render module-level reset button for bottom area');

assert.match(optionsJs, /function resetAppearanceModule\(moduleKey\)/, 'options should support module-level appearance reset');
assert.match(optionsJs, /function resetAppearanceAll\(\)/, 'options should support reset-all appearance');
assert.match(optionsJs, /window\.confirm\(/, 'options reset-all should require confirmation');
assert.match(optionsJs, /window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\)/, 'options reset-all should scroll to top after reset');
assert.match(optionsJs, /外观已恢复默认，待保存/, 'options should show pending-save status after reset');

console.log('options appearance modules tests passed');
