import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');

assert.match(optionsHtml, /id="settingsNav"/, 'options should render left nav container');
assert.match(optionsHtml, /data-page="general"/, 'options nav should include general page');
assert.match(optionsHtml, /data-page="llm"/, 'options nav should include llm page');
assert.match(optionsHtml, /data-page="rules"/, 'options nav should include local-rules page');
assert.match(optionsHtml, /data-page="appearance"/, 'options nav should include appearance page');
assert.match(optionsHtml, /data-page="io"/, 'options nav should include import-export page');

assert.match(optionsJs, /function switchSettingsPage\(/, 'options should support page switching');
assert.match(optionsJs, /dirtyPages/, 'options should track dirty pages');
assert.match(optionsJs, /当前页有未保存修改，请先保存/, 'options should block unsaved page switch with warning');

assert.match(optionsJs, /groupDefinitions/, 'options should define unified group source');
assert.match(optionsJs, /syncGroupDerivedViews\(/, 'options should sync derived group views');
assert.match(optionsJs, /renderDynamicGroupKeywordRows\(/, 'options should render local-rule groups from unified source');
assert.match(optionsJs, /renderDynamicAppearanceGroupRows\(/, 'options should render appearance groups from unified source');
assert.match(optionsJs, /llmGroupConstraints:\s*state\.groupDefinitions\.map/, 'options should persist llmGroupConstraints from unified groups');

console.log('options nav and group unification tests passed');
