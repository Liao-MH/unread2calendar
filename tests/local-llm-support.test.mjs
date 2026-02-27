import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const backgroundJs = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');

assert.match(backgroundJs, /\/api\/chat/, 'background should support Ollama /api/chat endpoint');
assert.match(backgroundJs, /isLocalLikeLLMBaseUrl/, 'background should detect local-like LLM base URL');
assert.match(backgroundJs, /settings\.llmApiKey \|\| isLocalLikeLLMBaseUrl/, 'local-like base URL should allow no API key');
assert.match(optionsJs, /本地模型（OpenAI兼容）/, 'options should list local OpenAI-compatible preset');
assert.match(optionsJs, /本地模型（Ollama）/, 'options should list Ollama preset');

console.log('local llm support tests passed');
