import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');

const saveSectionMatch = optionsJs.match(/async function saveLLMSection\(\) \{([\s\S]*?)\n\}/);
assert.ok(saveSectionMatch, 'saveLLMSection should exist');
const body = saveSectionMatch[1];

const llmIdx = body.indexOf('...collectLLMSettingsPayload()');
const promptIdx = body.indexOf('...collectPromptSettingsPayload()');
const groupsIdx = body.indexOf('...collectGroupsPayload()');
const processingIdx = body.indexOf('...collectProcessingPayload()');

assert.ok(llmIdx >= 0, 'saveLLMSection should include collectLLMSettingsPayload()');
assert.ok(promptIdx >= 0, 'saveLLMSection should include collectPromptSettingsPayload()');
assert.ok(groupsIdx >= 0, 'saveLLMSection should include collectGroupsPayload()');
assert.ok(processingIdx >= 0, 'saveLLMSection should include collectProcessingPayload()');

assert.ok(
  llmIdx > promptIdx && llmIdx > groupsIdx && llmIdx > processingIdx,
  'LLM fields must be applied last so stale state does not overwrite current Base URL / Model / API Key'
);

console.log('llm save payload order tests passed');
