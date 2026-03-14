import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const backgroundJs = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.match(backgroundJs, /function resolveGroupDefinitionIdForEvent\(/, 'background should expose a dedicated event-to-group-definition resolver for keyword writeback');
assert.match(backgroundJs, /resolveGroupDefinitionIdByLabel\(event && event\.groupLabel,\s*groupDefinitions\)/, 'keyword writeback should still try exact label matching first');
assert.match(backgroundJs, /slugGroup\(event && event\.groupLabel\)/, 'keyword writeback should derive a slug from the returned group label');
assert.match(backgroundJs, /String\(event && event\.group \|\| ''\)\.replace\(\s*\/\^llm-\//, 'keyword writeback should normalize llm-prefixed fallback groups before matching');
assert.match(backgroundJs, /const groupId = resolveGroupDefinitionIdForEvent\(event,\s*groupDefinitions\);/, 'keyword merge should use the stronger event resolver');

console.log('llm keyword writeback tests passed');
