import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const backgroundSource = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.match(
  backgroundSource,
  /const keywordWritebackEntries = Array\.isArray\(llmResult\.keywordWritebackEntries\)\s*\?\s*llmResult\.keywordWritebackEntries\s*:\s*validEvents;/,
  'shared extraction flow should prefer normalized keyword writeback entries over raw event arrays'
);

function extractFunctionDeclaration(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing declaration: ${marker}`);
  const braceStart = source.indexOf('{', start);
  assert.notEqual(braceStart, -1, `missing opening brace for: ${marker}`);
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;
  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (inSingle) {
      if (ch === '\'') inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }
    if (inTemplate) {
      if (ch === '`') inTemplate = false;
      continue;
    }
    if (ch === '\'') {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        let end = i + 1;
        while (end < source.length && /\s/.test(source[end])) end += 1;
        if (source.slice(end, end + 1) === ';') end += 1;
        return source.slice(start, end);
      }
    }
  }
  throw new Error(`unterminated declaration: ${marker}`);
}

function extractConstDeclaration(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing declaration: ${marker}`);
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (inSingle) {
      if (ch === '\'') inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }
    if (inTemplate) {
      if (ch === '`') inTemplate = false;
      continue;
    }
    if (ch === '\'') {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }
    if (ch === '(') depthParen += 1;
    if (ch === ')') depthParen -= 1;
    if (ch === '{') depthBrace += 1;
    if (ch === '}') depthBrace -= 1;
    if (ch === '[') depthBracket += 1;
    if (ch === ']') depthBracket -= 1;
    if (ch === ';' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      return source.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated declaration: ${marker}`);
}

const harnessSource = [
  extractConstDeclaration(backgroundSource, 'const GROUP_KEYS ='),
  extractConstDeclaration(backgroundSource, 'const GROUP_LABELS_BY_LANG ='),
  extractConstDeclaration(backgroundSource, 'const DEFAULT_LOCAL_RULES ='),
  extractFunctionDeclaration(backgroundSource, 'function normalizeText('),
  extractFunctionDeclaration(backgroundSource, 'function toLowerNorm('),
  extractFunctionDeclaration(backgroundSource, 'function slugGroup('),
  extractFunctionDeclaration(backgroundSource, 'function normalizeKeywordArray('),
  extractFunctionDeclaration(backgroundSource, 'function normalizeLocalRules('),
  extractFunctionDeclaration(backgroundSource, 'function uiLangTag('),
  extractFunctionDeclaration(backgroundSource, 'function groupLabelsForCurrentUi('),
  extractFunctionDeclaration(backgroundSource, 'function resolveAllowedGroupLabel('),
  extractFunctionDeclaration(backgroundSource, 'function isKnownGroup('),
  extractFunctionDeclaration(backgroundSource, 'function normalizeGroup('),
  extractFunctionDeclaration(backgroundSource, 'function resolveGroup('),
  extractFunctionDeclaration(backgroundSource, 'function isImportantGroupLabel('),
  extractFunctionDeclaration(backgroundSource, 'function extractLlmKeywordPayload('),
  extractFunctionDeclaration(backgroundSource, 'function normalizeLlmKeywordList('),
  extractFunctionDeclaration(backgroundSource, 'function normalizeKeywordWritebackEntry('),
  extractFunctionDeclaration(backgroundSource, 'function collectKeywordWritebackEntries('),
  extractFunctionDeclaration(backgroundSource, 'function sanitizeSingleEvent('),
  extractFunctionDeclaration(backgroundSource, 'function resolveGroupDefinitionIdByLabel('),
  extractFunctionDeclaration(backgroundSource, 'function resolveGroupDefinitionIdForEvent('),
  extractFunctionDeclaration(backgroundSource, 'function mergeLlmKeywordsIntoLocalRules(')
].join('\n\n');

const context = {
  console,
  browser: {
    i18n: {
      getUILanguage: () => 'en'
    }
  },
  globalThis: null
};
context.globalThis = context;

vm.runInNewContext(`
function extractTimeZoneFromHeaderLike() { return ''; }
function formatDisplayTimeRange() { return ''; }
${harnessSource}
globalThis.__testApi = {
  normalizeLlmKeywordList,
  collectKeywordWritebackEntries,
  sanitizeSingleEvent,
  resolveGroupDefinitionIdForEvent,
  mergeLlmKeywordsIntoLocalRules
};
`, context, { filename: 'background-keyword-harness.js' });

const api = context.__testApi;
assert.ok(api, 'background keyword harness should expose tested helpers');

assert.deepEqual(
  Array.from(api.normalizeLlmKeywordList([' deadline ', 'deadline', '报名'])),
  ['deadline', '报名'],
  'keyword normalization should trim and deduplicate case-insensitively'
);

const allowedGroups = ['Possibly Important', 'Academic Events', 'Course Related', 'Other'];
const sanitizedWithKeywordAliases = api.sanitizeSingleEvent({
  kind: 'todo',
  groupLabel: 'Course Related',
  title: 'Project milestone reminder',
  keywords: ['project', 'deadline'],
  tags: ['deadline', 'submission']
}, { headerDate: '', date: '' }, allowedGroups, 'Asia/Hong_Kong');
assert.deepEqual(
  Array.from(sanitizedWithKeywordAliases.categoryKeywords),
  ['project', 'deadline'],
  'event sanitization should accept alternate keyword fields without dropping them'
);

const groupDefinitions = [
  { id: 'grp-course-related', label: 'Course Related' },
  { id: 'grp-academic-events', label: 'Academic Events' }
];

const collectedFromTopLevelMap = api.collectKeywordWritebackEntries({
  groupKeywordMap: {
    'Course Related': ['project', 'deadline'],
    'Academic Events': { keywords: ['seminar'] }
  }
}, [], allowedGroups);
assert.equal(collectedFromTopLevelMap.length, 2, 'top-level group keyword maps should be collected into normalized writeback entries');
assert.deepEqual(
  Array.from(collectedFromTopLevelMap[0].keywords),
  ['project', 'deadline'],
  'top-level keyword map entries should preserve their keyword lists'
);

assert.equal(
  api.resolveGroupDefinitionIdForEvent(
    { groupLabel: 'Course Related', group: 'llm-course-related' },
    groupDefinitions
  ),
  'grp-course-related',
  'event-to-group resolution should normalize llm-prefixed groups'
);

const mergedFromEventKeywords = api.mergeLlmKeywordsIntoLocalRules(
  {
    groupKeywords: {
      'grp-course-related': ['assignment']
    }
  },
  groupDefinitions,
  [{
    groupLabel: 'Course Related',
    group: 'llm-course-related',
    categoryKeywords: ['project', 'deadline']
  }]
);
assert.equal(mergedFromEventKeywords.changed, true, 'event-level keywords should still write back into local rules');
assert.deepEqual(
  Array.from(mergedFromEventKeywords.localRules.groupKeywords['grp-course-related']),
  ['assignment', 'project', 'deadline'],
  'event-level keyword writeback should merge into the resolved group id bucket'
);

const mergedFromTopLevelLikeEntry = api.mergeLlmKeywordsIntoLocalRules(
  {
    groupKeywords: {
      'grp-course-related': ['assignment']
    }
  },
  groupDefinitions,
  [{
    groupLabel: 'Course Related',
    keywords: ['project', 'deadline']
  }]
);
assert.equal(mergedFromTopLevelLikeEntry.changed, true, 'keyword writeback should also accept normalized top-level group entries');
assert.deepEqual(
  Array.from(mergedFromTopLevelLikeEntry.localRules.groupKeywords['grp-course-related']),
  ['assignment', 'project', 'deadline'],
  'normalized keyword entries should merge into local rules without requiring categoryKeywords specifically'
);

console.log('llm keyword writeback tests passed');
