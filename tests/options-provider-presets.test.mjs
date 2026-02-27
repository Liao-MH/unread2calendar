import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');

assert.match(optionsHtml, /id="llmProvider"/, 'options should render provider preset selector');
assert.match(optionsHtml, /id="llmModelPreset"/, 'options should render model preset selector');
assert.match(optionsHtml, /id="refreshPresetsBtn"/, 'options should render refresh preset button');

assert.match(optionsJs, /function buildBuiltinProviderCatalog\(\)/, 'options should define builtin provider catalog');
assert.match(optionsJs, /id:\s*'local'/, 'options should include local-model provider preset');
assert.match(optionsJs, /id:\s*'ollama'/, 'options should include ollama provider preset');
assert.match(optionsJs, /refreshProviderPresets/, 'options should support refreshing provider presets');
assert.match(optionsJs, /applyLocalizedUi\(\)/, 'options should apply localized labels for key controls');
assert.match(optionsJs, /"nonTodo":\s*\{\s*"summary":\s*"\.\.\."/, 'options default prompt should include nonTodo.summary contract');
assert.match(optionsJs, /for \(let attempt = 1; attempt <= 3; attempt \+= 1\)/, 'options remote model fetch should retry transient failures');
assert.match(optionsJs, /controller\.abort\(\)/, 'options remote model fetch should enforce timeout via AbortController');

console.log('options provider preset tests passed');
