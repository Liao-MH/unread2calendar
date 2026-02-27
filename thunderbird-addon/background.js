'use strict';

const STORAGE_KEY = 'todoItems.v1';
const IMPORT_LOG_STORAGE_KEY = 'todoImportLogs.v1';
const SETTINGS_KEY = 'todoSettings.v1';
const LLM_TIMEOUT_MS = 20000;
const MENU_EXTRACT_TODO = 'todo-extract-from-selection';
const MENU_OPEN_FROM_ACTION = 'todo-open-from-action-menu';

const GROUP_KEYS = ['academic', 'course', 'activity', 'important', 'other', 'unrecognized'];
const GROUP_LABELS_BY_LANG = {
  zh: {
    academic: '学术讲座',
    course: '课程相关提示',
    activity: '课外活动',
    important: '可能重要的事',
    other: '其他',
    accepted: '已接受事件',
    imported: '已添加日历',
    unrecognized: '未识别到待办'
  },
  en: {
    academic: 'Academic',
    course: 'Course',
    activity: 'Activities',
    important: 'Possibly Important',
    other: 'Other',
    accepted: 'Accepted Events',
    imported: 'Imported Calendar',
    unrecognized: 'No Todo Detected'
  }
};
const ACCEPTED_GROUP_KEY = 'accepted';
const IMPORTED_GROUP_KEY = 'imported';
const UNRECOGNIZED_GROUP_KEY = 'unrecognized';
const IMPORT_LOG_RETENTION_DAYS = 30;
const DEFAULT_LLM_GROUP_CONSTRAINTS = {
  zh: [
    '可能重要的事',
    '学术活动',
    '课程相关',
    '截止日期',
    '会议与约见',
    '行政与事务',
    '奖学金与资助',
    '招聘与实习',
    '课外活动',
    '健康与安全',
    '出行与后勤',
    '其他'
  ],
  en: [
    'Possibly Important',
    'Academic Events',
    'Course Related',
    'Deadlines',
    'Meetings & Appointments',
    'Administration & Affairs',
    'Scholarships & Funding',
    'Jobs & Internships',
    'Extracurricular Activities',
    'Health & Safety',
    'Travel & Logistics',
    'Other'
  ]
};
const DEFAULT_LOCAL_RULES = Object.freeze({
  timeKeywords: ['date', 'time', 'when', 'schedule', 'deadline', 'due', 'today', 'tomorrow'],
  locationKeywords: ['venue', 'location', 'room', 'building', 'hall', 'meeting link', 'zoom'],
  groupKeywords: {
    academic: ['seminar', 'lecture', 'talk', 'colloquium', 'symposium', 'workshop'],
    course: ['course', 'class', 'homework', 'assignment', 'exam', 'syllabus', 'office hour'],
    activity: ['activity', 'club', 'event', 'social', 'volunteer', 'meetup'],
    important: ['remind', 'important', 'urgent', 'deadline', 'due', 'meeting', 'tomorrow', 'today'],
    other: []
  }
});
const DEFAULT_LLM_PROMPT_TEMPLATE = `你是邮件待办识别器。请基于单封邮件内容尽可能完整识别所有待办事件。
只能输出 JSON，不要输出解释、不要 Markdown、不要代码块。

约束：
1) 输出 events 数组，可为 0 到多条。
2) groupLabel 必须从 allowedGroups 里选；如果都不合适，选“其他/Other”。
3) 若邮件更像提醒型个人重要信息，可归入“可能重要的事/Possibly Important”。
4) 若没有可行动待办，events 返回空数组，并填写 nonTodo.summary（一句话标题，可直接用于列表展示）。
5) 每个事件都要给出 categoryKeywords（1-5个短关键词），说明为何归入该分组；只输出关键词数组，不要长句。
6) 时间展示：
   - 同日："YYYY-MM-DD HH:mm-HH:mm (TZ)"
   - 跨日："YYYY-MM-DD HH:mm-MM-DD HH:mm (TZ)"
   - 无法识别：startText=null
7) timezone 优先邮件头，缺失用 defaultTimeZone。

输入：
- uiLanguage: {{uiLanguage}}
- defaultTimeZone: {{defaultTimeZone}}
- allowedGroupsJson: {{allowedGroupsJson}}
- messageJson: {{messageJson}}

输出 JSON：
{
  "messageId": "...",
  "events": [
    {
      "kind": "todo|important|ignore",
      "groupLabel": "...",
      "title": "...",
      "startText": "..." | null,
      "endText": "..." | null,
      "location": "..." | null,
      "notes": "..." | null,
      "categoryKeywords": ["...", "..."],
      "confidence": 0.0
    }
  ],
  "nonTodo": {
    "summary": "..."
  } | null
}`;
const LEGACY_PROMPT_SIGNATURES = [
  '只输出 1 条结果',
  '最可能的待办事件',
  '"kind": "todo|important|ignore"',
  '根据输入的整批邮件识别所有潜在事件/活动',
  '"groups": [',
  '"events": [\n    {\n      "messageId": "..."'
];

const DEFAULT_PROCESSING_SETTINGS = Object.freeze({
  llmBodyMaxChars: 12000,
  llmBatchSize: 20,
  llmRetryCount: 1,
  llmBatchDelayMs: 100
});
const APPEARANCE_API = globalThis.Unread2CalendarAppearance || null;

const state = {
  selectedTodoId: null,
  scan: {
    running: false,
    paused: false,
    cancelRequested: false,
    phase: 'idle',
    total: 0,
    processed: 0,
    extracted: 0,
    failed: 0,
    line: ''
  },
  statusText: 'Ready.',
  errorText: ''
};

function now() {
  return Date.now();
}

function cloneDefaultLocalRules() {
  return JSON.parse(JSON.stringify(DEFAULT_LOCAL_RULES));
}

function normalizeKeywordArray(input) {
  if (!Array.isArray(input)) return [];
  const dedup = new Set();
  const output = [];
  for (const raw of input) {
    const keyword = normalizeText(raw);
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (dedup.has(key)) continue;
    dedup.add(key);
    output.push(keyword);
  }
  return output;
}

function normalizeLocalRules(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const groupSrc = src.groupKeywords && typeof src.groupKeywords === 'object' ? src.groupKeywords : {};
  const normalizedGroups = {};
  for (const [key, value] of Object.entries(groupSrc)) {
    const groupKey = normalizeText(key);
    if (!groupKey) continue;
    normalizedGroups[groupKey] = normalizeKeywordArray(value);
  }
  for (const [key, value] of Object.entries(DEFAULT_LOCAL_RULES.groupKeywords)) {
    if (!Object.prototype.hasOwnProperty.call(normalizedGroups, key)) {
      normalizedGroups[key] = normalizeKeywordArray(value);
    }
  }
  return {
    timeKeywords: normalizeKeywordArray(src.timeKeywords),
    locationKeywords: normalizeKeywordArray(src.locationKeywords),
    groupKeywords: normalizedGroups
  };
}

function effectiveLocalRules(localRules) {
  const normalized = normalizeLocalRules(localRules);
  const defaults = cloneDefaultLocalRules();
  const mergedGroups = {};
  for (const [key, list] of Object.entries(normalized.groupKeywords || {})) {
    mergedGroups[key] = Array.isArray(list) && list.length > 0 ? list : [];
  }
  for (const [key, list] of Object.entries(defaults.groupKeywords)) {
    if (!Array.isArray(mergedGroups[key]) || mergedGroups[key].length === 0) {
      mergedGroups[key] = list;
    }
  }
  return {
    timeKeywords: normalized.timeKeywords.length > 0 ? normalized.timeKeywords : defaults.timeKeywords,
    locationKeywords: normalized.locationKeywords.length > 0 ? normalized.locationKeywords : defaults.locationKeywords,
    groupKeywords: mergedGroups
  };
}

function normalizeGroupDefinitions(raw, fallbackConstraints) {
  const source = Array.isArray(raw) ? raw : [];
  const dedup = new Set();
  const out = [];
  for (const item of source) {
    const label = normalizeText(item && typeof item === 'object' ? item.label : item);
    if (!label) continue;
    const key = label.toLowerCase();
    if (dedup.has(key)) continue;
    dedup.add(key);
    out.push({
      id: normalizeText(item && typeof item === 'object' ? item.id : '') || `grp-${slugGroup(label)}`,
      label
    });
  }
  if (out.length > 0) return out;
  const fallback = normalizeGroupConstraints(fallbackConstraints);
  return fallback.map((label) => ({ id: `grp-${slugGroup(label)}`, label }));
}

function clampInteger(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return Math.max(min, Math.min(max, i));
}

function defaultGroupConstraints() {
  const isZh = /^zh\b/.test(uiLangTag());
  return [...(isZh ? DEFAULT_LLM_GROUP_CONSTRAINTS.zh : DEFAULT_LLM_GROUP_CONSTRAINTS.en)];
}

function normalizeGroupConstraints(raw) {
  const source = Array.isArray(raw) ? raw : [];
  const dedup = new Set();
  const output = [];
  for (const value of source) {
    const name = String(value || '').replace(/\s+/g, ' ').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (dedup.has(key)) continue;
    dedup.add(key);
    output.push(name);
  }
  const defaults = defaultGroupConstraints();
  for (const name of defaults) {
    const key = name.toLowerCase();
    if (dedup.has(key)) continue;
    dedup.add(key);
    output.push(name);
  }
  return output;
}

function normalizeProcessingSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    llmBodyMaxChars: clampInteger(src.llmBodyMaxChars, DEFAULT_PROCESSING_SETTINGS.llmBodyMaxChars, 1000, 100000),
    llmBatchSize: clampInteger(src.llmBatchSize, DEFAULT_PROCESSING_SETTINGS.llmBatchSize, 1, 200),
    llmRetryCount: clampInteger(src.llmRetryCount, DEFAULT_PROCESSING_SETTINGS.llmRetryCount, 0, 5),
    llmBatchDelayMs: clampInteger(src.llmBatchDelayMs, DEFAULT_PROCESSING_SETTINGS.llmBatchDelayMs, 0, 5000)
  };
}

function normalizePromptTemplate(rawPrompt) {
  const src = typeof rawPrompt === 'string' ? rawPrompt.trim() : '';
  if (!src) return DEFAULT_LLM_PROMPT_TEMPLATE;

  // Force-upgrade legacy single-result/batch templates to multi-event template.
  const hitLegacy = LEGACY_PROMPT_SIGNATURES.some((key) => src.includes(key));
  if (hitLegacy) return DEFAULT_LLM_PROMPT_TEMPLATE;

  return src;
}

async function getTodos() {
  const data = await browser.storage.local.get(STORAGE_KEY);
  const raw = data[STORAGE_KEY];
  return Array.isArray(raw) ? raw : [];
}

async function setTodos(todos) {
  await browser.storage.local.set({ [STORAGE_KEY]: todos });
}

async function resetTodos() {
  await setTodos([]);
  state.selectedTodoId = null;
}

function importLogRetentionCutoffMs() {
  return now() - IMPORT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function sanitizeImportLog(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = normalizeText(raw.id) || `import-log-${Math.random().toString(36).slice(2)}`;
  const importedAt = Number(raw.importedAt);
  const normalizedAt = Number.isFinite(importedAt) ? importedAt : now();
  return {
    id,
    todoId: normalizeText(raw.todoId),
    sourceMessageId: normalizeText(raw.sourceMessageId),
    calendarId: normalizeText(raw.calendarId),
    calendarName: normalizeText(raw.calendarName),
    importStatus: normalizeText(raw.importStatus) || 'failed',
    importReason: normalizeText(raw.importReason),
    parsedTimeZone: normalizeText(raw.parsedTimeZone),
    importTimeZone: normalizeText(raw.importTimeZone),
    sourceTimeText: normalizeText(raw.sourceTimeText),
    importLocalTimeText: normalizeText(raw.importLocalTimeText),
    writtenStartISO: normalizeText(raw.writtenStartISO),
    writtenEndISO: normalizeText(raw.writtenEndISO),
    title: normalizeText(raw.title) || 'Untitled',
    startText: normalizeText(raw.startText),
    location: normalizeText(raw.location),
    importedAt: normalizedAt
  };
}

function pruneImportLogs(logs) {
  const cutoff = importLogRetentionCutoffMs();
  const list = Array.isArray(logs) ? logs : [];
  return list
    .map(sanitizeImportLog)
    .filter((item) => item && item.importedAt >= cutoff)
    .sort((a, b) => b.importedAt - a.importedAt);
}

async function getImportLogs() {
  const data = await browser.storage.local.get(IMPORT_LOG_STORAGE_KEY);
  const raw = Array.isArray(data[IMPORT_LOG_STORAGE_KEY]) ? data[IMPORT_LOG_STORAGE_KEY] : [];
  const pruned = pruneImportLogs(raw);
  if (pruned.length !== raw.length) {
    await browser.storage.local.set({ [IMPORT_LOG_STORAGE_KEY]: pruned });
  }
  return pruned;
}

async function appendImportLogs(entries) {
  const base = await getImportLogs();
  const appended = pruneImportLogs([...entries, ...base]);
  await browser.storage.local.set({ [IMPORT_LOG_STORAGE_KEY]: appended });
}

async function getSettings() {
  const data = await browser.storage.local.get(SETTINGS_KEY);
  const settings = data[SETTINGS_KEY] || {};
  const processing = normalizeProcessingSettings(settings);
  const normalizedPrompt = normalizePromptTemplate(settings.llmPromptTemplate);
  if (normalizedPrompt !== (typeof settings.llmPromptTemplate === 'string' ? settings.llmPromptTemplate : '')) {
    await browser.storage.local.set({
      [SETTINGS_KEY]: {
        ...settings,
        llmPromptTemplate: normalizedPrompt
      }
    });
  }
  const appearanceResult = APPEARANCE_API
    ? APPEARANCE_API.normalizeAppearance(settings.appearance)
    : { appearance: null };
  return {
    llmBaseUrl: settings.llmBaseUrl || '',
    llmModel: settings.llmModel || '',
    llmApiKey: settings.llmApiKey || '',
    llmPromptTemplate: normalizedPrompt,
    useTemperature: !!settings.useTemperature,
    llmTemperature: Number.isFinite(Number(settings.llmTemperature)) ? Number(settings.llmTemperature) : 0.1,
    useMaxTokens: !!settings.useMaxTokens,
    llmMaxTokens: Number.isFinite(Number(settings.llmMaxTokens)) ? Number(settings.llmMaxTokens) : 1024,
    useTopP: !!settings.useTopP,
    llmTopP: Number.isFinite(Number(settings.llmTopP)) ? Number(settings.llmTopP) : 1,
    debugMode: !!settings.debugMode,
    lastSelectedAccountIds: Array.isArray(settings.lastSelectedAccountIds) ? settings.lastSelectedAccountIds.map(String) : [],
    localRules: normalizeLocalRules(settings.localRules || cloneDefaultLocalRules()),
    llmGroupConstraints: normalizeGroupConstraints(settings.llmGroupConstraints),
    groupDefinitions: normalizeGroupDefinitions(settings.groupDefinitions, settings.llmGroupConstraints),
    llmBodyMaxChars: processing.llmBodyMaxChars,
    llmBatchSize: processing.llmBatchSize,
    llmRetryCount: processing.llmRetryCount,
    llmBatchDelayMs: processing.llmBatchDelayMs,
    appearance: appearanceResult.appearance,
    llmConnectionStatus: normalizeLlmConnectionStatus(settings.llmConnectionStatus),
    llmConnectionError: normalizeText(settings.llmConnectionError),
    llmConnectionTestedAt: normalizeText(settings.llmConnectionTestedAt)
  };
}

async function setSettings(settings) {
  const current = await getSettings();
  const tempNum = Number(settings.llmTemperature);
  const maxTokensNum = Number(settings.llmMaxTokens);
  const topPNum = Number(settings.llmTopP);
  const temperature = Number.isFinite(tempNum) ? Math.min(2, Math.max(0, tempNum)) : 0.1;
  const maxTokens = Number.isFinite(maxTokensNum) ? Math.max(1, Math.floor(maxTokensNum)) : 1024;
  const topP = Number.isFinite(topPNum) ? Math.min(1, Math.max(0, topPNum)) : 1;
  const processing = normalizeProcessingSettings({
    llmBodyMaxChars: settings.llmBodyMaxChars != null ? settings.llmBodyMaxChars : current.llmBodyMaxChars,
    llmBatchSize: settings.llmBatchSize != null ? settings.llmBatchSize : current.llmBatchSize,
    llmRetryCount: settings.llmRetryCount != null ? settings.llmRetryCount : current.llmRetryCount,
    llmBatchDelayMs: settings.llmBatchDelayMs != null ? settings.llmBatchDelayMs : current.llmBatchDelayMs
  });
  const appearanceResult = APPEARANCE_API
    ? APPEARANCE_API.normalizeAppearance(
      settings.appearance != null ? settings.appearance : current.appearance
    )
    : { appearance: null };
  const normalized = {
    llmBaseUrl: (settings.llmBaseUrl || '').trim(),
    llmModel: (settings.llmModel || '').trim(),
    llmApiKey: (settings.llmApiKey || '').trim(),
    llmPromptTemplate: normalizePromptTemplate(
      typeof settings.llmPromptTemplate === 'string' ? settings.llmPromptTemplate : current.llmPromptTemplate
    ),
    useTemperature: !!settings.useTemperature,
    llmTemperature: temperature,
    useMaxTokens: !!settings.useMaxTokens,
    llmMaxTokens: maxTokens,
    useTopP: !!settings.useTopP,
    llmTopP: topP,
    debugMode: !!settings.debugMode,
    lastSelectedAccountIds: Array.isArray(settings.lastSelectedAccountIds)
      ? settings.lastSelectedAccountIds.map(String)
      : current.lastSelectedAccountIds,
    localRules: normalizeLocalRules(settings.localRules || current.localRules || {}),
    llmGroupConstraints: normalizeGroupConstraints(settings.llmGroupConstraints || current.llmGroupConstraints || []),
    groupDefinitions: normalizeGroupDefinitions(
      settings.groupDefinitions || current.groupDefinitions || [],
      settings.llmGroupConstraints || current.llmGroupConstraints || []
    ),
    llmBodyMaxChars: processing.llmBodyMaxChars,
    llmBatchSize: processing.llmBatchSize,
    llmRetryCount: processing.llmRetryCount,
    llmBatchDelayMs: processing.llmBatchDelayMs,
    appearance: appearanceResult.appearance,
    llmConnectionStatus: normalizeLlmConnectionStatus(settings.llmConnectionStatus || current.llmConnectionStatus),
    llmConnectionError: normalizeText(settings.llmConnectionError || current.llmConnectionError),
    llmConnectionTestedAt: normalizeText(settings.llmConnectionTestedAt || current.llmConnectionTestedAt)
  };
  const llmChanged = normalized.llmBaseUrl !== current.llmBaseUrl
    || normalized.llmModel !== current.llmModel
    || normalized.llmApiKey !== current.llmApiKey;
  if (llmChanged) {
    normalized.llmConnectionStatus = 'unknown';
    normalized.llmConnectionError = '';
    normalized.llmConnectionTestedAt = '';
  }
  await browser.storage.local.set({ [SETTINGS_KEY]: normalized });
  return normalized;
}

function renderPromptTemplate(template, vars) {
  let rendered = String(template || '').trim();
  if (!rendered) {
    rendered = DEFAULT_LLM_PROMPT_TEMPLATE;
  }
  const map = vars || {};
  for (const [key, value] of Object.entries(map)) {
    const token = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(token, String(value || ''));
  }
  return rendered;
}

function buildLLMOptionalParams(settings, isResponsesApi) {
  const params = {};
  if (settings.useTemperature) {
    params.temperature = settings.llmTemperature;
  }
  if (settings.useTopP) {
    params.top_p = settings.llmTopP;
  }
  if (settings.useMaxTokens) {
    if (isResponsesApi) {
      params.max_output_tokens = settings.llmMaxTokens;
    } else {
      params.max_tokens = settings.llmMaxTokens;
    }
  }
  return params;
}

function isLocalLikeLLMBaseUrl(baseUrl) {
  const input = normalizeText(baseUrl);
  if (!input) return false;
  try {
    const parsed = new URL(input);
    const host = String(parsed.hostname || '').toLowerCase();
    if (!host) return false;
    if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host === 'host.docker.internal') return true;
    if (host === '127.0.0.1') return true;
    if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
    if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
    const m = host.match(/^172\.(\d+)\.\d+\.\d+$/);
    if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
    return false;
  } catch (_) {
    return /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(input);
  }
}

function hasLLM(settings) {
  if (!(settings.llmBaseUrl && settings.llmModel)) return false;
  return !!(settings.llmApiKey || isLocalLikeLLMBaseUrl(settings.llmBaseUrl));
}

function normalizeLlmConnectionStatus(value) {
  const status = normalizeText(value);
  if (status === 'ok' || status === 'failed' || status === 'unknown') return status;
  return 'unknown';
}

function setStatus(text) {
  state.statusText = text;
  state.errorText = '';
}

function setError(action, error) {
  const reason = (error && error.message) ? error.message : String(error || 'unknown');
  state.errorText = `${action} failed: ${reason}`;
  state.statusText = state.errorText;
}

function formatErrorDetail(error) {
  if (!error) return 'unknown';
  const parts = [];
  const name = error && error.name ? String(error.name) : '';
  const message = error && error.message ? String(error.message) : String(error);
  const code = error && error.code ? String(error.code) : '';
  if (name) parts.push(`name: ${name}`);
  parts.push(`message: ${message}`);
  if (code) parts.push(`code: ${code}`);
  if (error && Number.isFinite(error.status)) parts.push(`status: ${error.status}`);
  if (error && error.fileName) parts.push(`file: ${error.fileName}`);
  if (error && Number.isFinite(error.lineNumber)) parts.push(`line: ${error.lineNumber}`);
  if (error && error.stack) parts.push(`stack:\n${String(error.stack)}`);
  return parts.join('\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
}

function initRecognitionScan(total, phase) {
  state.scan.running = true;
  state.scan.paused = false;
  state.scan.cancelRequested = false;
  state.scan.phase = phase || 'running';
  state.scan.total = Math.max(0, Number(total) || 0);
  state.scan.processed = 0;
  state.scan.extracted = 0;
  state.scan.failed = 0;
  state.scan.line = '';
}

function stopRecognitionScan(phase) {
  state.scan.running = false;
  state.scan.paused = false;
  state.scan.cancelRequested = false;
  state.scan.phase = phase || 'done';
}

function markRecognitionCancelRequested() {
  if (!state.scan.running) return false;
  state.scan.cancelRequested = true;
  return true;
}

async function waitForScanToStop(timeoutMs) {
  const deadline = now() + Math.max(100, Number(timeoutMs) || 8000);
  while (state.scan.running && now() < deadline) {
    await sleep(80);
  }
  return !state.scan.running;
}

function makeCancelledError() {
  const err = new Error('Recognition cancelled by user.');
  err.code = 'SCAN_CANCELLED';
  return err;
}

async function waitIfScanPaused() {
  while (state.scan.running && state.scan.paused && !state.scan.cancelRequested) {
    await sleep(120);
  }
  if (state.scan.cancelRequested) throw makeCancelledError();
}

async function broadcastStateChanged() {
  try {
    await browser.runtime.sendMessage({ type: 'todo:state-changed' });
  } catch (_) {
    // No active listeners.
  }
}

function isKnownGroup(group) {
  return GROUP_KEYS.includes(group);
}

function normalizeGroup(group) {
  return isKnownGroup(group) ? group : 'other';
}

function uiLangTag() {
  try {
    if (browser.i18n && typeof browser.i18n.getUILanguage === 'function') {
      return String(browser.i18n.getUILanguage() || '').toLowerCase();
    }
  } catch (_) {
    // Ignore.
  }
  return 'en';
}

function groupLabelsForCurrentUi() {
  return /^zh\b/.test(uiLangTag()) ? GROUP_LABELS_BY_LANG.zh : GROUP_LABELS_BY_LANG.en;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function toLowerNorm(value) {
  return normalizeText(value).toLowerCase();
}

function slugGroup(value) {
  const raw = toLowerNorm(value).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  return raw || 'other';
}

function resolveGroup(rawGroup, rawGroupLabel) {
  const labels = groupLabelsForCurrentUi();
  const group = normalizeText(rawGroup);
  const groupLabel = normalizeText(rawGroupLabel);

  if (isKnownGroup(group)) {
    return { group, groupLabel: labels[group] };
  }

  if (groupLabel) {
    return { group: `llm-${slugGroup(groupLabel)}`, groupLabel };
  }

  if (group) {
    return { group: `llm-${slugGroup(group)}`, groupLabel: group };
  }

  return { group: 'other', groupLabel: labels.other };
}

function createTodoId() {
  return `todo-${now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultRangeText() {
  const start = new Date();
  const end = new Date(start);
  end.setHours(23, 59, 0, 0);
  return {
    startText: start.toISOString(),
    endText: end.toISOString()
  };
}

function computeDuplicateKey(item) {
  const title = toLowerNorm(item.title);
  const hour = extractHourToken(item.startText);
  return `${title}::${hour}`;
}

function extractHourToken(text) {
  if (!text) return 'unknown';
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}-${date.getUTCHours()}`;
  }
  const m = String(text).match(/(\d{1,2})(?::\d{2})?\s*(am|pm)?/i);
  if (!m) return 'unknown';
  let h = parseInt(m[1], 10);
  const ampm = (m[2] || '').toLowerCase();
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return String(h);
}

function recomputeDuplicates(items) {
  const buckets = new Map();
  for (const item of items) {
    const key = computeDuplicateKey(item);
    const list = buckets.get(key) || [];
    list.push(item);
    buckets.set(key, list);
  }

  return items.map((item) => {
    const key = computeDuplicateKey(item);
    const peers = buckets.get(key) || [item];
    const duplicateCount = peers.length;
    const displayTitle = duplicateCount > 1 ? `[重复x${duplicateCount}] ${item.title}` : item.title;
    const duplicateMessages = duplicateCount > 1
      ? peers.map((peer) => ({
        todoId: peer.id,
        sourceMessageId: peer.sourceMessageId,
        subject: peer.title || '',
        author: peer.sourceAuthor || '',
        startText: peer.startText || ''
      }))
      : [];
    return {
      ...item,
      duplicateCount,
      displayTitle,
      duplicateMessages
    };
  });
}

function escapeRegexLiteral(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKeyword(haystackLower, keywords) {
  for (const keyword of keywords || []) {
    const k = toLowerNorm(keyword);
    if (!k) continue;
    if (haystackLower.includes(k)) return true;
  }
  return false;
}

function extractTimeStrings(text, timeKeywords) {
  const src = String(text || '');
  const dateMatches = [...src.matchAll(/\b(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g)].map((m) => m[1]);
  const timeMatch = src.match(/\b(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))\b/i);
  let startText = dateMatches[0] ? `${dateMatches[0]} ${timeMatch ? timeMatch[1] : ''}`.trim() : (timeMatch ? timeMatch[1] : '');
  const endText = dateMatches[1] ? `${dateMatches[1]} ${timeMatch ? timeMatch[1] : ''}`.trim() : '';

  if (!startText) {
    for (const keyword of timeKeywords || []) {
      const pattern = new RegExp(`\\b${escapeRegexLiteral(keyword)}\\b\\s*[:：]\\s*([^\\n,;]+)`, 'i');
      const match = src.match(pattern);
      if (match && match[1]) {
        startText = normalizeText(match[1]);
        break;
      }
    }
  }
  return { startText, endText };
}

function extractLocation(text, locationKeywords) {
  const src = String(text || '');
  const keywords = Array.isArray(locationKeywords) && locationKeywords.length > 0
    ? locationKeywords
    : DEFAULT_LOCAL_RULES.locationKeywords;

  for (const keyword of keywords) {
    const tagPattern = new RegExp(`\\b${escapeRegexLiteral(keyword)}\\b\\s*[:：]\\s*([^\\n,;]+)`, 'i');
    const tagMatch = src.match(tagPattern);
    if (tagMatch && tagMatch[1]) return normalizeText(tagMatch[1]);
  }

  for (const keyword of keywords) {
    const inlinePattern = new RegExp(`\\b(${escapeRegexLiteral(keyword)}[^\\n,.]*)`, 'i');
    const inlineMatch = src.match(inlinePattern);
    if (inlineMatch && inlineMatch[1]) return normalizeText(inlineMatch[1]);
  }
  return '';
}

function localExtract(message, localRules) {
  const subject = normalizeText(message.subject || '');
  const snippet = normalizeText(message.snippet || '');
  const author = normalizeText(message.author || '');
  const combined = `${subject} ${snippet}`;
  const hay = combined.toLowerCase();
  const rules = effectiveLocalRules(localRules || {});

  const time = extractTimeStrings(combined, rules.timeKeywords);
  const location = extractLocation(combined, rules.locationKeywords);
  const hasTime = !!normalizeText(time.startText);
  const hasLocation = !!normalizeText(location) || /(zoom|teams|meet\.google|webex|venue|location|room|hall)/i.test(combined);
  const hasActionVerb = /(submit|register|attend|join|reply|pay|complete|fill|sign|confirm|upload|apply|报名|提交|参加|回复|缴费|完成|填写|签到|确认|上传|申请)/i.test(combined);
  const isAutomated = /no[-_]?reply|donotreply|automated|notification/i.test(author);
  const actionable = hasTime || hasLocation || hasActionVerb;

  let group = 'other';
  let kind = 'todo';
  let confidence = actionable ? 0.68 : 0.45;

  if (hasKeyword(hay, rules.groupKeywords.academic)) {
    group = 'academic';
    confidence = 0.85;
  } else if (hasKeyword(hay, rules.groupKeywords.course)) {
    group = 'course';
    confidence = 0.8;
  } else if (hasKeyword(hay, rules.groupKeywords.activity)) {
    group = 'activity';
    confidence = 0.75;
  } else if (!isAutomated && hasKeyword(hay, rules.groupKeywords.important) && !actionable) {
    group = 'important';
    kind = 'important';
    confidence = 0.7;
  } else {
    for (const [groupKey, keywords] of Object.entries(rules.groupKeywords || {})) {
      if (['academic', 'course', 'activity', 'important', 'other'].includes(groupKey)) continue;
      if (hasKeyword(hay, keywords)) {
        group = `llm-${slugGroup(groupKey)}`;
        confidence = 0.72;
        break;
      }
    }
  }

  if (isAutomated && !actionable) {
    return { kind: 'ignore' };
  }

  if (confidence < 0.5 && !hasTime && !hasActionVerb) {
    return { kind: 'ignore' };
  }

  return {
    kind,
    group,
    groupLabel: groupLabelsForCurrentUi()[group] || normalizeText(group).replace(/^llm-/, '') || groupLabelsForCurrentUi().other,
    title: subject || 'Untitled item',
    startText: time.startText,
    endText: time.endText,
    location,
    notes: snippet,
    confidence
  };
}

function sanitizeLLMResult(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const kind = ['todo', 'important', 'ignore'].includes(raw.kind) ? raw.kind : 'ignore';
  const resolvedGroup = resolveGroup(raw.group, raw.groupLabel);
  const confidenceNum = Number(raw.confidence);
  return {
    kind,
    group: resolvedGroup.group,
    groupLabel: resolvedGroup.groupLabel,
    title: normalizeText(raw.title),
    startText: normalizeText(raw.startText),
    endText: normalizeText(raw.endText),
    location: normalizeText(raw.location),
    notes: normalizeText(raw.notes),
    confidence: Number.isFinite(confidenceNum) ? Math.max(0, Math.min(1, confidenceNum)) : 0.5
  };
}

function buildProgressLine(kind, index, total, extractedCount) {
  const x = Math.max(1, Number(index) || 1);
  const y = Math.max(1, Number(total) || 1);
  const n = Math.max(0, Number(extractedCount) || 0);
  const zh = /^zh\b/.test(uiLangTag());
  if (kind === 'uploading') return zh ? `上传 ${x}/${y} 封邮件` : `Uploading ${x}/${y} email(s)`;
  if (kind === 'waiting') return zh ? `等待 LLM 回复（${x}/${y}）` : `Waiting for LLM reply (${x}/${y})`;
  if (kind === 'returned') return zh ? `已返回 ${x}/${y} 封，新增 ${n} 个事件` : `Returned ${x}/${y}, +${n} event(s)`;
  if (kind === 'failed') return zh ? `${x}/${y} 封处理失败` : `Failed on ${x}/${y}`;
  return zh ? `处理中 ${x}/${y}` : `Processing ${x}/${y}`;
}

function buildFinalSummaryLine(processed, extracted) {
  const p = Math.max(0, Number(processed) || 0);
  const e = Math.max(0, Number(extracted) || 0);
  return /^zh\b/.test(uiLangTag())
    ? `已处理 ${p} 封邮件，识别到 ${e} 个事件`
    : `Processed ${p} emails, recognized ${e} events`;
}

function parseLooseJson(text) {
  const src = String(text || '').trim();
  if (!src) return null;

  try {
    return JSON.parse(src);
  } catch (_) {
    const fenced = src.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch (__){
        return null;
      }
    }
    const firstBrace = src.indexOf('{');
    const lastBrace = src.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = src.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (__){
        return null;
      }
    }
  }
  return null;
}

function extractLLMText(data) {
  const chatContent = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (typeof chatContent === 'string' && chatContent.trim()) return chatContent;
  if (Array.isArray(chatContent)) {
    const firstText = chatContent.find((part) => part && part.type === 'text' && typeof part.text === 'string');
    if (firstText && firstText.text) return firstText.text;
  }

  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
  const ollamaMessage = data && data.message && data.message.content;
  if (typeof ollamaMessage === 'string' && ollamaMessage.trim()) return ollamaMessage;
  if (typeof data.response === 'string' && data.response.trim()) return data.response;
  if (Array.isArray(data.output)) {
    for (const out of data.output) {
      if (Array.isArray(out.content)) {
        const textPart = out.content.find((part) => part && part.type === 'output_text' && typeof part.text === 'string');
        if (textPart && textPart.text) return textPart.text;
      }
    }
  }

  return '';
}

function buildLLMEndpointCandidates(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  if (/\/chat\/completions$/i.test(base) || /\/responses$/i.test(base) || /\/api\/chat$/i.test(base)) {
    return [base];
  }
  const urls = [];
  if (/\/v1$/i.test(base)) {
    const root = base.replace(/\/v1$/i, '');
    urls.push(`${base}/chat/completions`, `${base}/responses`, `${root}/api/chat`);
  } else {
    urls.push(`${base}/api/chat`, `${base}/chat/completions`, `${base}/responses`);
  }
  return [...new Set(urls)];
}

async function fetchLLMJson(url, settings, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    const isResponsesApi = /\/responses$/i.test(url);
    const isOllamaChatApi = /\/api\/chat$/i.test(url);
    const optionalParams = buildLLMOptionalParams(settings, isResponsesApi);
    const ollamaOptions = {};
    if (settings.useTemperature) ollamaOptions.temperature = settings.llmTemperature;
    if (settings.useTopP) ollamaOptions.top_p = settings.llmTopP;
    if (settings.useMaxTokens) ollamaOptions.num_predict = settings.llmMaxTokens;
    const payload = isOllamaChatApi
      ? {
        model: settings.llmModel,
        messages: [
          { role: 'system', content: 'You are an extractor. Return JSON only.' },
          { role: 'user', content: JSON.stringify(prompt) }
        ],
        stream: false,
        options: ollamaOptions
      }
      : isResponsesApi
      ? {
        model: settings.llmModel,
        input: JSON.stringify(prompt),
        ...optionalParams
      }
      : {
        model: settings.llmModel,
        messages: [
          { role: 'system', content: 'You are an extractor. Return JSON only.' },
          { role: 'user', content: JSON.stringify(prompt) }
        ],
        ...optionalParams
      };
    const headers = {
      'Content-Type': 'application/json'
    };
    if (settings.llmApiKey) {
      headers.Authorization = `Bearer ${settings.llmApiKey}`;
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!resp.ok) {
      let responseBody = '';
      try {
        responseBody = await resp.text();
      } catch (_) {
        responseBody = '';
      }
      const err = new Error(`LLM HTTP ${resp.status} ${resp.statusText || ''}`.trim());
      err.code = 'LLM_HTTP_ERROR';
      err.status = resp.status;
      err.statusText = resp.statusText || '';
      err.endpoint = url;
      err.responseBody = responseBody.slice(0, 4000);
      throw err;
    }
    try {
      return await resp.json();
    } catch (error) {
      const err = new Error('LLM response is not JSON');
      err.code = 'LLM_BAD_JSON';
      err.endpoint = url;
      err.cause = error;
      throw err;
    }
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const err = new Error(`LLM request timed out after ${LLM_TIMEOUT_MS}ms`);
      err.code = 'LLM_TIMEOUT';
      err.endpoint = url;
      throw err;
    }
    if (error && error.code) throw error;
    const err = new Error(error && error.message ? error.message : 'LLM request failed');
    err.code = 'LLM_NETWORK_ERROR';
    err.endpoint = url;
    err.cause = error;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function getSystemTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return normalizeText(tz) || 'UTC';
  } catch (_) {
    return 'UTC';
  }
}

function extractTimeZoneFromHeaderLike(rawDate) {
  const src = String(rawDate || '');
  if (!src) return '';
  const iana = src.match(/\b([A-Za-z_]+\/[A-Za-z_]+)\b/);
  if (iana && iana[1]) return iana[1];
  const gmt = src.match(/\b(?:GMT|UTC)\s*([+-]\d{1,2})(?::?(\d{2}))?\b/i);
  if (gmt && gmt[1]) {
    const h = String(gmt[1]).replace(/^([+-]\d)$/, '$10');
    const m = gmt[2] ? String(gmt[2]).padStart(2, '0') : '00';
    return `${h}:${m}`;
  }
  const offset = src.match(/\b([+-]\d{2}:?\d{2})\b/);
  if (offset && offset[1]) {
    const cleaned = offset[1].replace(/^([+-]\d{2})(\d{2})$/, '$1:$2');
    return cleaned;
  }
  return '';
}

function isValidIanaTimeZone(timeZone) {
  const tz = normalizeText(timeZone);
  if (!tz || /[+-]\d{2}:?\d{2}/.test(tz)) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch (_) {
    return false;
  }
}

function formatDateInTimeZone(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = fmt.formatToParts(date);
  const map = Object.create(null);
  for (const p of parts) map[p.type] = p.value;
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`
  };
}

function formatDateFromIsoText(isoText) {
  const m = String(isoText || '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  return {
    date: `${m[1]}-${m[2]}-${m[3]}`,
    time: `${m[4]}:${m[5]}`
  };
}

function formatDisplayTimeRange(startISO, endISO, timeZone, fallbackTimeZone) {
  const startRaw = normalizeText(startISO);
  if (!startRaw) return '';
  const endRaw = normalizeText(endISO);
  const zoneRaw = normalizeText(timeZone) || normalizeText(fallbackTimeZone) || getSystemTimeZone();
  const startDate = new Date(startRaw);
  const endDate = new Date(endRaw);
  const hasStartDate = !Number.isNaN(startDate.getTime());
  if (!hasStartDate) return '';

  let startParts = null;
  let endParts = null;
  let zoneLabel = zoneRaw || 'UTC';

  if (isValidIanaTimeZone(zoneRaw)) {
    startParts = formatDateInTimeZone(startDate, zoneRaw);
    if (!Number.isNaN(endDate.getTime())) endParts = formatDateInTimeZone(endDate, zoneRaw);
  } else {
    startParts = formatDateFromIsoText(startRaw);
    if (endRaw) endParts = formatDateFromIsoText(endRaw);
    if (!startParts) {
      const local = formatDateInTimeZone(startDate, getSystemTimeZone());
      startParts = local;
      if (!Number.isNaN(endDate.getTime())) endParts = formatDateInTimeZone(endDate, getSystemTimeZone());
      zoneLabel = getSystemTimeZone();
    }
  }

  if (!startParts) return '';
  if (!endParts) return `${startParts.date} ${startParts.time} (${zoneLabel})`;
  if (startParts.date === endParts.date) {
    return `${startParts.date} ${startParts.time}-${endParts.time} (${zoneLabel})`;
  }
  return `${startParts.date} ${startParts.time}-${endParts.date} ${endParts.time} (${zoneLabel})`;
}

function stripHtmlToText(html) {
  const src = String(html || '');
  if (!src) return '';
  return src
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, '\'')
    .replace(/&quot;/gi, '"')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function collectBodyParts(node, buckets) {
  if (!node || typeof node !== 'object') return;
  const disposition = String(node.contentDisposition || '').toLowerCase();
  if (disposition === 'attachment') return;
  const contentType = String(node.contentType || '').toLowerCase();
  const body = typeof node.body === 'string' ? node.body : '';

  if (body) {
    if (contentType.startsWith('text/plain')) {
      buckets.plain.push(body);
    } else if (contentType.startsWith('text/html')) {
      buckets.html.push(body);
    }
  }

  const children = Array.isArray(node.parts) ? node.parts : [];
  for (const child of children) {
    collectBodyParts(child, buckets);
  }
}

async function getMessageBodyInfo(messageId, maxChars) {
  const fallback = { bodyText: '', headerDate: '' };
  if (!messageId || !browser.messages || typeof browser.messages.getFull !== 'function') return fallback;
  try {
    const full = await browser.messages.getFull(messageId);
    const buckets = { plain: [], html: [] };
    collectBodyParts(full, buckets);
    const plain = normalizeText(buckets.plain.join('\n'));
    const htmlAsText = stripHtmlToText(buckets.html.join('\n'));
    const merged = plain || htmlAsText;
    const bodyText = normalizeText(merged).slice(0, Math.max(0, Number(maxChars) || 0));
    const headers = full && typeof full.headers === 'object' ? full.headers : {};
    const headerDate = Array.isArray(headers.date) ? normalizeText(headers.date[0]) : '';
    return { bodyText, headerDate };
  } catch (_) {
    return fallback;
  }
}

function resolveAllowedGroupLabel(rawLabel, allowedGroups) {
  const src = normalizeText(rawLabel);
  const list = Array.isArray(allowedGroups) ? allowedGroups : [];
  if (!list.length) return '';
  if (src) {
    const exact = list.find((label) => normalizeText(label).toLowerCase() === src.toLowerCase());
    if (exact) return exact;
  }
  const labels = groupLabelsForCurrentUi();
  const other = list.find((label) => {
    const lower = normalizeText(label).toLowerCase();
    return lower === normalizeText(labels.other).toLowerCase() || lower === 'other' || lower === '其他';
  });
  return other || list[list.length - 1];
}

function isImportantGroupLabel(label) {
  const src = normalizeText(label).toLowerCase();
  const labels = groupLabelsForCurrentUi();
  return src === normalizeText(labels.important).toLowerCase() || src === 'important' || src === 'possibly important' || src === '可能重要的事';
}

function sanitizeSingleEvent(raw, message, allowedGroups, fallbackTimeZone) {
  if (!raw || typeof raw !== 'object') return null;
  const rawKind = normalizeText(raw.kind).toLowerCase();
  const groupLabel = resolveAllowedGroupLabel(raw.groupLabel || raw.group, allowedGroups);
  const isImportant = isImportantGroupLabel(groupLabel);
  const kind = ['todo', 'important', 'ignore'].includes(rawKind) ? rawKind : (isImportant ? 'important' : 'todo');
  if (kind === 'ignore') return { kind: 'ignore' };

  const displayTime = normalizeText(raw.startText || raw.displayTime);
  const sourceTz = normalizeText(raw.timeZone) || extractTimeZoneFromHeaderLike(message.headerDate || message.date);
  const startText = displayTime || formatDisplayTimeRange(raw.startISO || raw.startText, raw.endISO || raw.endText, sourceTz, fallbackTimeZone);
  const endText = normalizeText(raw.endText || raw.endISO);
  const confidenceNum = Number(raw.confidence);
  const categoryKeywords = normalizeLlmKeywordList(
    raw.categoryKeywords || raw.classificationKeywords || raw.reasonKeywords || raw.groupKeywords
  );

  return {
    kind: isImportant ? 'important' : kind,
    group: isImportant ? 'important' : resolveGroup('', groupLabel).group,
    groupLabel: isImportant ? groupLabelsForCurrentUi().important : groupLabel,
    parentTitle: normalizeText(raw.parentTitle || ''),
    title: normalizeText(raw.title),
    startText,
    endText,
    location: normalizeText(raw.location),
    notes: normalizeText(raw.notes),
    categoryKeywords,
    confidence: Number.isFinite(confidenceNum) ? Math.max(0, Math.min(1, confidenceNum)) : 0.5
  };
}

function normalizeLlmKeywordList(raw) {
  if (Array.isArray(raw)) return normalizeKeywordArray(raw);
  const text = normalizeText(raw);
  if (!text) return [];
  const parts = text.split(/[，,、;；|]/).map((item) => normalizeText(item)).filter(Boolean);
  return normalizeKeywordArray(parts);
}

function resolveGroupDefinitionIdByLabel(groupLabel, groupDefinitions) {
  const label = toLowerNorm(groupLabel);
  if (!label) return '';
  const defs = Array.isArray(groupDefinitions) ? groupDefinitions : [];
  for (const def of defs) {
    const defLabel = toLowerNorm(def && typeof def === 'object' ? def.label : def);
    if (!defLabel) continue;
    if (defLabel === label) {
      return normalizeText(def && typeof def === 'object' ? def.id : '');
    }
  }
  return '';
}

function mergeLlmKeywordsIntoLocalRules(localRulesInput, groupDefinitions, events) {
  const localRules = normalizeLocalRules(localRulesInput || {});
  let changed = false;
  for (const event of events || []) {
    const keywords = normalizeLlmKeywordList(event && event.categoryKeywords);
    if (keywords.length === 0) continue;
    const groupId = resolveGroupDefinitionIdByLabel(event && event.groupLabel, groupDefinitions);
    const fallbackGroupKey = normalizeText(event && event.group);
    const targetKey = groupId || fallbackGroupKey;
    if (!targetKey) continue;
    const existing = Array.isArray(localRules.groupKeywords[targetKey]) ? localRules.groupKeywords[targetKey] : [];
    const merged = normalizeKeywordArray([...existing, ...keywords]);
    if (merged.length !== existing.length) {
      localRules.groupKeywords[targetKey] = merged;
      changed = true;
    }
  }
  return { changed, localRules };
}

function sanitizeLLMEventsResult(raw, message, allowedGroups, fallbackTimeZone) {
  if (!raw || typeof raw !== 'object') return [];
  const events = Array.isArray(raw.events) ? raw.events : [raw];
  const output = [];
  for (const event of events) {
    const normalized = sanitizeSingleEvent(event, message, allowedGroups, fallbackTimeZone);
    if (normalized) output.push(normalized);
  }
  return output;
}

function oneLineSummaryFromText(text, fallback) {
  const src = normalizeText(text);
  if (!src) return normalizeText(fallback) || 'No actionable todo detected';
  const line = src
    .split(/[\n。！？!?]/)
    .map((part) => normalizeText(part))
    .find(Boolean) || src;
  const maxLen = 110;
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen - 1)}…`;
}

function fallbackNonTodoSummary(message) {
  const subject = normalizeText(message && message.subject);
  const snippet = normalizeText(message && message.snippet);
  const body = normalizeText(message && message.bodyText);
  return oneLineSummaryFromText(snippet || body || subject, subject || 'No actionable todo detected');
}

function normalizeLLMResponse(parsed, messagePayload, allowedGroups, fallbackTimeZone) {
  const events = sanitizeLLMEventsResult(parsed, messagePayload, allowedGroups, fallbackTimeZone)
    .filter((event) => event && event.kind !== 'ignore');
  let nonTodoSummary = '';
  if (parsed && typeof parsed === 'object' && parsed.nonTodo && typeof parsed.nonTodo === 'object') {
    nonTodoSummary = normalizeText(parsed.nonTodo.summary);
  }
  if (!events.length && !nonTodoSummary) {
    nonTodoSummary = fallbackNonTodoSummary(messagePayload);
  }
  return {
    events,
    nonTodoSummary
  };
}

async function llmExtract(message, settings) {
  const uiLanguage = uiLangTag();
  const defaultTimeZone = getSystemTimeZone();
  const allowedGroups = normalizeGroupConstraints(settings.llmGroupConstraints || []);
  const messagePayload = {
    messageId: String(message.id),
    subject: message.subject || '',
    author: message.author || '',
    date: message.date || '',
    headerDate: message.headerDate || '',
    snippet: message.snippet || '',
    bodyText: message.bodyText || ''
  };
  const promptText = renderPromptTemplate(settings.llmPromptTemplate, {
    uiLanguage,
    defaultTimeZone,
    allowedGroupsJson: JSON.stringify(allowedGroups, null, 2),
    messageJson: JSON.stringify(messagePayload, null, 2),
    messagesJson: JSON.stringify([messagePayload], null, 2),
    subject: message.subject || '',
    author: message.author || '',
    snippet: message.snippet || '',
    bodyText: message.bodyText || ''
  });
  const prompt = {
    uiLanguage,
    defaultTimeZone,
    allowedGroups,
    message: messagePayload,
    instruction: promptText
  };

  const urls = buildLLMEndpointCandidates(settings.llmBaseUrl);
  let lastError = null;
  for (const url of urls) {
    try {
      const data = await fetchLLMJson(url, settings, prompt);
      const content = extractLLMText(data);
      const parsed = parseLooseJson(content);
      if (parsed) {
        const normalized = normalizeLLMResponse(parsed, messagePayload, allowedGroups, defaultTimeZone);
        return normalized;
      }
      lastError = new Error('LLM response is not valid JSON');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('LLM request failed');
}

async function testLLMConnection(settingsInput) {
  const settings = {
    llmBaseUrl: normalizeText(settingsInput && settingsInput.llmBaseUrl),
    llmModel: normalizeText(settingsInput && settingsInput.llmModel),
    llmApiKey: normalizeText(settingsInput && settingsInput.llmApiKey)
  };
  if (!hasLLM(settings)) {
    const localLike = isLocalLikeLLMBaseUrl(settings.llmBaseUrl);
    return {
      ok: false,
      error: {
        message: localLike ? 'Base URL / Model is required' : 'Base URL / Model / API Key is required',
        code: 'LLM_CONFIG_MISSING',
        timestamp: new Date().toISOString()
      },
      attempts: []
    };
  }

  const prompt = {
    instruction: 'Return JSON only: {\"ok\":true}',
    ping: true
  };

  const urls = buildLLMEndpointCandidates(settings.llmBaseUrl);
  const attempts = [];
  let lastError = null;
  for (const url of urls) {
    try {
      await fetchLLMJson(url, settings, prompt);
      return { ok: true, endpoint: url };
    } catch (error) {
      attempts.push({
        endpoint: url,
        ok: false,
        code: error && error.code ? error.code : 'LLM_TEST_FAILED',
        status: error && Number.isFinite(error.status) ? error.status : null,
        statusText: error && error.statusText ? error.statusText : '',
        message: error && error.message ? error.message : String(error || 'unknown'),
        responseBody: error && error.responseBody ? error.responseBody : ''
      });
      lastError = error;
    }
  }
  return {
    ok: false,
    error: {
      message: lastError && lastError.message ? lastError.message : 'Connection failed',
      code: lastError && lastError.code ? lastError.code : 'LLM_TEST_FAILED',
      status: lastError && Number.isFinite(lastError.status) ? lastError.status : null,
      statusText: lastError && lastError.statusText ? lastError.statusText : '',
      endpoint: lastError && lastError.endpoint ? lastError.endpoint : '',
      responseBody: lastError && lastError.responseBody ? lastError.responseBody : '',
      stack: lastError && lastError.stack ? lastError.stack : '',
      timestamp: new Date().toISOString()
    },
    attempts
  };
}

function createTodoFromExtract(message, extract) {
  const isTodoKind = extract.kind !== 'important';
  const hasStartText = !!normalizeText(extract.startText);
  const needsFallback = isTodoKind && !hasStartText;
  const reminderPolicy = needsFallback ? 'fallback_plus_1h' : 'standard_two';
  const resolvedGroup = resolveGroup(extract.group, extract.groupLabel);

  return {
    id: createTodoId(),
    sourceMessageId: message.id,
    sourceAuthor: normalizeText(message.author),
    parentTitle: normalizeText(extract.parentTitle) || normalizeText(message.subject) || 'Untitled activity',
    kind: isTodoKind ? 'todo' : 'important',
    status: 'pending',
    title: extract.title || normalizeText(message.subject) || 'Untitled item',
    startText: extract.startText || '',
    endText: extract.endText || '',
    location: extract.location || '',
    notes: extract.notes || normalizeText(message.snippet || ''),
    confidence: Number.isFinite(extract.confidence) ? extract.confidence : 0.5,
    group: resolvedGroup.group,
    groupLabel: resolvedGroup.groupLabel,
    duplicateCount: 1,
    displayTitle: extract.title || normalizeText(message.subject) || 'Untitled item',
    duplicateMessages: [],
    reminderPolicy,
    edited: false,
    manualOverride: false,
    createdAt: now(),
    updatedAt: now()
  };
}

function createNonTodoItem(message, summary) {
  const labels = groupLabelsForCurrentUi();
  const subject = normalizeText(message.subject);
  const author = normalizeText(message.author);
  const snippet = normalizeText(message.snippet);
  const title = oneLineSummaryFromText(summary, fallbackNonTodoSummary(message));
  return {
    id: createTodoId(),
    sourceMessageId: message.id,
    sourceAuthor: author,
    parentTitle: subject || 'Non-todo email',
    kind: 'non_todo',
    status: 'unseen',
    title,
    startText: '',
    endText: '',
    location: author || '',
    notes: snippet || subject || '',
    confidence: 1,
    group: UNRECOGNIZED_GROUP_KEY,
    groupLabel: labels.unrecognized,
    duplicateCount: 1,
    displayTitle: title,
    duplicateMessages: [],
    reminderPolicy: 'standard_two',
    edited: false,
    manualOverride: false,
    createdAt: now(),
    updatedAt: now()
  };
}

function getFolderChildren(folder) {
  if (!folder) return [];
  const children = Array.isArray(folder.subFolders) ? folder.subFolders : [];
  return children;
}

function isInboxFolder(folder) {
  if (!folder) return false;
  const type = String(folder.type || '').toLowerCase();
  if (type === 'inbox') return true;
  const name = String(folder.name || '').trim().toLowerCase();
  if (name === 'inbox' || name === '收件箱' || name === '收件匣') return true;
  const path = String(folder.path || '').trim().toLowerCase();
  if (/(^|\/|\\)inbox$/.test(path)) return true;
  return false;
}

function collectInboxRoots(folders) {
  const roots = [];
  const walk = (folder) => {
    if (!folder) return;
    if (isInboxFolder(folder)) {
      roots.push(folder);
      return;
    }
    for (const child of getFolderChildren(folder)) walk(child);
  };
  for (const folder of folders) walk(folder);
  return roots;
}

async function listInboxFoldersByAccountIds(accountIds) {
  const accounts = await browser.accounts.list();
  const folders = [];
  const selectedSet = new Set((Array.isArray(accountIds) ? accountIds : []).map(String));

  function walk(folder) {
    if (!folder) return;
    folders.push(folder);
    for (const child of getFolderChildren(folder)) walk(child);
  }

  for (const account of accounts) {
    if (selectedSet.size > 0 && !selectedSet.has(String(account.id))) continue;
    const roots = Array.isArray(account.folders) ? account.folders : [];
    const inboxRoots = collectInboxRoots(roots);
    for (const root of inboxRoots) walk(root);
  }

  return { accounts, folders };
}

async function listUnreadMessagesInFolder(folder) {
  const unread = [];
  let page;
  try {
    page = await browser.messages.list(folder);
  } catch (_) {
    return unread;
  }

  while (page) {
    const list = Array.isArray(page.messages) ? page.messages : [];
    for (const msg of list) {
      if (!msg.read) unread.push(msg);
    }
    if (!page.id) break;
    page = await browser.messages.continueList(page.id);
  }
  return unread;
}

async function scanUnreadByAccounts(accountIds) {
  const { folders } = await listInboxFoldersByAccountIds(accountIds);
  initRecognitionScan(0, 'counting');
  setStatus(/^zh\b/.test(uiLangTag()) ? '统计未读邮件中...' : 'Counting unread...');
  await broadcastStateChanged();

  const allUnread = [];
  for (const folder of folders) {
    await waitIfScanPaused();
    if (state.scan.cancelRequested) {
      state.scan.line = buildFinalSummaryLine(0, 0);
      setStatus(state.scan.line);
      stopRecognitionScan('cancelled');
      await broadcastStateChanged();
      return;
    }
    const msgs = await listUnreadMessagesInFolder(folder);
    allUnread.push(...msgs);
  }

  const uniqueUnread = [];
  const seenMessageIds = new Set();
  for (const msg of allUnread) {
    if (!msg || !msg.id || seenMessageIds.has(msg.id)) continue;
    seenMessageIds.add(msg.id);
    uniqueUnread.push(msg);
  }

  state.scan.total = uniqueUnread.length;
  state.scan.phase = 'running';
  setStatus(/^zh\b/.test(uiLangTag())
    ? `开始识别，共 ${uniqueUnread.length} 封邮件`
    : `Start processing ${uniqueUnread.length} emails`);
  await broadcastStateChanged();

  const result = await extractFromMessages(uniqueUnread, {
    onProgress: async (progress) => {
      state.scan.processed = progress.processed;
      state.scan.extracted = progress.extracted;
      state.scan.failed = progress.failed;
      await broadcastStateChanged();
    }
  });
  state.scan.processed = result.processed;
  state.scan.extracted = result.extracted;
  state.scan.failed = result.failed;
  await broadcastStateChanged();

  stopRecognitionScan(result.cancelled ? 'cancelled' : 'done');
  state.scan.line = buildFinalSummaryLine(state.scan.processed, state.scan.extracted);
  setStatus(state.scan.line);
  await broadcastStateChanged();
}

async function scanAllUnread() {
  await scanUnreadByAccounts([]);
}

async function stopRunningRecognitionIfNeeded() {
  if (!state.scan.running) return;
  markRecognitionCancelRequested();
  setStatus(/^zh\b/.test(uiLangTag()) ? '正在取消当前识别任务...' : 'Cancelling current recognition task...');
  await broadcastStateChanged();
  await waitForScanToStop(10000);
}

function mergeScannedItems(existing, scanned) {
  const kept = existing.filter((t) => t.status !== 'done');
  const keyToIndex = new Map();
  const itemKey = (item) => {
    if (item && item.kind === 'non_todo') {
      return `${item.sourceMessageId}::non_todo`;
    }
    return `${item.sourceMessageId}::${item.kind}::${toLowerNorm(item.title)}::${toLowerNorm(item.startText)}::${toLowerNorm(item.location)}`;
  };

  for (let i = 0; i < kept.length; i += 1) {
    const item = kept[i];
    keyToIndex.set(itemKey(item), i);
  }

  const isStickyConflict = (incoming) => {
    const inTitle = toLowerNorm(incoming && incoming.title);
    const inSource = String((incoming && incoming.sourceMessageId) || '');
    const inKind = String((incoming && incoming.kind) || '');
    if (!inSource || !inKind) return false;
    return kept.some((old) => {
      if (!old || !old.manualOverride) return false;
      if (String(old.sourceMessageId || '') !== inSource) return false;
      if (String(old.kind || '') !== inKind) return false;
      const oldTitle = toLowerNorm(old.title);
      if (!oldTitle || !inTitle) return true;
      if (oldTitle === inTitle) return true;
      if (oldTitle.length >= 12 && inTitle.includes(oldTitle)) return true;
      if (inTitle.length >= 12 && oldTitle.includes(inTitle)) return true;
      return false;
    });
  };

  for (const item of scanned) {
    const key = itemKey(item);
    if (isStickyConflict(item)) {
      continue;
    }
    if (!keyToIndex.has(key)) {
      keyToIndex.set(key, kept.length);
      kept.push(item);
      continue;
    }

    const idx = keyToIndex.get(key);
    const existingItem = kept[idx];
    if (!existingItem || existingItem.manualOverride || existingItem.edited || existingItem.status !== 'pending') {
      continue;
    }

    kept[idx] = {
      ...existingItem,
      title: item.title,
      startText: item.startText,
      endText: item.endText,
      location: item.location,
      notes: item.notes,
      confidence: item.confidence,
      group: item.group,
      groupLabel: item.groupLabel,
      reminderPolicy: item.reminderPolicy,
      updatedAt: now()
    };
  }

  return kept;
}

async function tryMarkRead(messageId) {
  if (!messageId) return false;
  try {
    await browser.messages.update(messageId, { read: true });
    return true;
  } catch (_) {
    return false;
  }
}

function parseDateOrFallback(text, fallback) {
  const src = normalizeText(text);
  const range = src.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?:-\d{2}:\d{2}|\-\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})?\s*(?:\(([^)]+)\))?$/);
  if (range) {
    const d = new Date(`${range[1]}T${range[2]}:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date(src);
  if (Number.isNaN(d.getTime())) return new Date(fallback);
  return d;
}

function parseTimeZoneFromText(text) {
  const src = normalizeText(text);
  if (!src) return '';
  const m = src.match(/\(([^)]+)\)\s*$/);
  return m && m[1] ? normalizeText(m[1]) : '';
}

function stripTimeZoneSuffix(text) {
  const src = normalizeText(text);
  return src.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

function isValidIanaTimeZoneName(timeZone) {
  const tz = normalizeText(timeZone);
  if (!tz) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch (_) {
    return false;
  }
}

function parseOffsetTimeZoneMinutes(timeZone) {
  const src = normalizeText(timeZone).toUpperCase().replace(/^UTC|^GMT/, '').trim();
  if (!src) return null;
  const m = src.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!m) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const hh = Number(m[2]);
  const mm = Number(m[3] || '0');
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return sign * (hh * 60 + mm);
}

function parseYmdHm(text) {
  const m = normalizeText(text).match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5])
  };
}

function parseDisplayRangeText(text) {
  const src = stripTimeZoneSuffix(text);
  const full = src.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})-(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  if (full) {
    return {
      start: parseYmdHm(`${full[1]} ${full[2]}`),
      end: parseYmdHm(`${full[3]} ${full[4]}`)
    };
  }
  const sameDay = src.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (sameDay) {
    return {
      start: parseYmdHm(`${sameDay[1]} ${sameDay[2]}`),
      end: parseYmdHm(`${sameDay[1]} ${sameDay[3]}`)
    };
  }
  const single = src.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  if (single) {
    return {
      start: parseYmdHm(`${single[1]} ${single[2]}`),
      end: null
    };
  }
  return null;
}

function zonedPartsFromDate(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  const parts = fmt.formatToParts(date);
  const map = Object.create(null);
  for (const part of parts) map[part.type] = part.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute)
  };
}

function partsToUtcMillis(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
}

function toDateInTimeZone(parts, timeZone) {
  if (!parts) return null;
  const offsetMinutes = parseOffsetTimeZoneMinutes(timeZone);
  if (Number.isFinite(offsetMinutes)) {
    return new Date(partsToUtcMillis(parts) - offsetMinutes * 60 * 1000);
  }
  if (isValidIanaTimeZoneName(timeZone)) {
    let guess = partsToUtcMillis(parts);
    for (let i = 0; i < 5; i += 1) {
      const actual = zonedPartsFromDate(new Date(guess), timeZone);
      const diff = partsToUtcMillis(parts) - partsToUtcMillis(actual);
      if (Math.abs(diff) < 1000) break;
      guess += diff;
    }
    return new Date(guess);
  }
  return null;
}

function parseEventDateRange(item) {
  const startTextRaw = normalizeText(item.startText);
  const endTextRaw = normalizeText(item.endText);
  const timeZone = parseTimeZoneFromText(startTextRaw) || parseTimeZoneFromText(endTextRaw) || getSystemTimeZone();

  const fromStartRange = parseDisplayRangeText(startTextRaw);
  let startDate = null;
  let endDate = null;
  if (fromStartRange && fromStartRange.start) {
    startDate = toDateInTimeZone(fromStartRange.start, timeZone);
    if (fromStartRange.end) {
      endDate = toDateInTimeZone(fromStartRange.end, timeZone);
    }
  }

  if (!endDate && endTextRaw) {
    const fromEndRange = parseDisplayRangeText(endTextRaw);
    if (fromEndRange && fromEndRange.start) {
      endDate = toDateInTimeZone(fromEndRange.start, timeZone);
    } else {
      const fallbackEnd = parseDateOrFallback(endTextRaw, now() + 60 * 60 * 1000);
      endDate = Number.isNaN(fallbackEnd.getTime()) ? null : fallbackEnd;
    }
  }

  if (!startDate) {
    const fallbackStart = parseDateOrFallback(startTextRaw, now());
    startDate = Number.isNaN(fallbackStart.getTime()) ? new Date(now()) : fallbackStart;
  }
  if (!endDate) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }
  if (endDate.getTime() <= startDate.getTime()) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  return { startDate, endDate, timeZone };
}

function pad2(v) {
  return String(v).padStart(2, '0');
}

function formatLocalDateTimeInZone(date, timeZone) {
  const zone = isValidIanaTimeZoneName(timeZone) ? timeZone : getSystemTimeZone();
  const p = zonedPartsFromDate(date, zone);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)} ${pad2(p.hour)}:${pad2(p.minute)}`;
}

function dateToICS(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeICS(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function toEventPayload(item) {
  const range = parseEventDateRange(item);
  const sourceStart = range.startDate;
  const sourceEnd = range.endDate;
  const importTimeZone = getSystemTimeZone();
  const importStartLocal = formatLocalDateTimeInZone(sourceStart, importTimeZone);
  const importEndLocal = formatLocalDateTimeInZone(sourceEnd, importTimeZone);
  const start = parseDateOrFallback(importStartLocal, now());
  const end = parseDateOrFallback(importEndLocal, start.getTime() + 60 * 60 * 1000);
  const description = [item.notes || '', `From: ${item.sourceAuthor || ''}`].filter(Boolean).join('\n');

  return {
    title: item.title,
    start,
    end,
    sourceTimeZone: range.timeZone || '',
    importTimeZone,
    sourceStartText: normalizeText(item.startText),
    sourceEndText: normalizeText(item.endText),
    importStartLocal,
    importEndLocal,
    writtenStartISO: start.toISOString(),
    writtenEndISO: end.toISOString(),
    location: item.location || '',
    description,
    reminderPolicy: item.reminderPolicy || 'standard_two'
  };
}

async function importViaCalendarApi(eventPayloads) {
  if (!browser.calendar && !browser.calendars) {
    throw new Error('Calendar API unavailable');
  }

  if (browser.calendar && typeof browser.calendar.createEvent === 'function') {
    for (const ev of eventPayloads) {
      await browser.calendar.createEvent({
        title: ev.title,
        startDate: ev.start.toISOString(),
        endDate: ev.end.toISOString(),
        location: ev.location,
        description: ev.description
      });
    }
    return;
  }

  if (browser.calendars && typeof browser.calendars.list === 'function' && browser.calendars && typeof browser.calendars.createEvent === 'function') {
    const calendars = await browser.calendars.list();
    if (!Array.isArray(calendars) || calendars.length === 0) {
      throw new Error('No calendar found');
    }
    const calendarId = calendars[0].id;
    for (const ev of eventPayloads) {
      await browser.calendars.createEvent(calendarId, {
        title: ev.title,
        startDate: ev.start.toISOString(),
        endDate: ev.end.toISOString(),
        location: ev.location,
        description: ev.description
      });
    }
    return;
  }

  throw new Error('No compatible calendar methods');
}

function getCalendarUtils() {
  if (globalThis.CalendarUtils) return globalThis.CalendarUtils;
  return {
    priorityScore: () => 1,
    toCalendarIdentity: (calendar, idx) => String((calendar && calendar.id) || `calendar-${idx + 1}`),
    toCalendarDisplayName: (calendar, fallbackId) => String((calendar && calendar.name) || fallbackId || ''),
    isCalendarWritable: (calendar) => !(calendar && calendar.readOnly),
    normalizeCalendars: (rawCalendars) => Array.isArray(rawCalendars) ? rawCalendars : []
  };
}

function summarizeCalendarForDebug(calendar, index) {
  const raw = calendar || {};
  return {
    index,
    id: raw.id ?? null,
    calendarId: raw.calendarId ?? null,
    uid: raw.uid ?? raw.uuid ?? null,
    name: raw.name ?? raw.displayName ?? raw.title ?? null,
    type: raw.type ?? null,
    readOnly: raw.readOnly ?? raw.readonly ?? raw.isReadOnly ?? null,
    disabled: raw.disabled ?? raw.isDisabled ?? null,
    enabled: raw.enabled ?? null,
    uri: raw.uri && (raw.uri.spec || raw.uri.path || String(raw.uri))
      ? String(raw.uri.spec || raw.uri.path || raw.uri)
      : null
  };
}

async function listWritableCalendars(options) {
  const includeDebug = !!(options && options.includeDebug);
  const utils = getCalendarUtils();
  const debug = {
    path: '',
    totalRaw: 0,
    writableCount: 0,
    excludedCount: 0,
    excludedReasons: [],
    sample: []
  };

  if (browser.calendars && typeof browser.calendars.list === 'function') {
    debug.path = 'browser.calendars.list';
    const calendarsRaw = await browser.calendars.list();
    const calendars = Array.isArray(calendarsRaw) ? calendarsRaw : [];
    debug.totalRaw = calendars.length;
    const writable = calendars
      .map((c, idx) => ({ raw: c, idx }))
      .filter(({ raw, idx }) => {
        if (!raw || typeof raw !== 'object') {
          debug.excludedReasons.push(`calendar #${idx + 1}: invalid object`);
          return false;
        }
        if (!utils.isCalendarWritable(raw)) {
          const name = utils.toCalendarDisplayName(raw, `#${idx + 1}`);
          debug.excludedReasons.push(`${name}: read-only or disabled`);
          return false;
        }
        return true;
      })
      .map(({ raw, idx }) => {
        const id = utils.toCalendarIdentity(raw, idx);
        return {
          id,
          name: utils.toCalendarDisplayName(raw, id),
          type: String(raw.type || ''),
          readOnly: !!(raw.readOnly || raw.readonly || raw.isReadOnly)
        };
      })
      .sort((a, b) => {
        const sa = utils.priorityScore(a);
        const sb = utils.priorityScore(b);
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name);
      });
    debug.writableCount = writable.length;
    debug.excludedCount = Math.max(0, calendars.length - writable.length);
    debug.sample = calendars.slice(0, 5).map((c, index) => summarizeCalendarForDebug(c, index + 1));
    if (writable.length > 0) {
      return includeDebug ? { calendars: writable, debug } : writable;
    }
  }

  if (browser.TbCalendarAccess && typeof browser.TbCalendarAccess.listCalendars === 'function') {
    try {
      debug.path = 'experiment.TbCalendarAccess.listCalendars';
      const calendarsRaw = await browser.TbCalendarAccess.listCalendars();
      const calendars = Array.isArray(calendarsRaw) ? calendarsRaw : [];
      debug.totalRaw = calendars.length;
      debug.sample = calendars.slice(0, 5).map((c, index) => summarizeCalendarForDebug(c, index + 1));
      const writable = utils.normalizeCalendars(calendars);
      debug.writableCount = writable.length;
      debug.excludedCount = Math.max(0, calendars.length - writable.length);
      if (writable.length > 0) {
        return includeDebug ? { calendars: writable, debug } : writable;
      }
    } catch (error) {
      const reason = error && error.message ? error.message : String(error || 'unknown');
      debug.excludedReasons.push(`experiment listCalendars failed: ${reason}`);
    }
  }

  if (browser.calendar && typeof browser.calendar.createEvent === 'function') {
    const fallback = [{
      id: '__default__',
      name: 'Default Calendar',
      type: 'default',
      readOnly: false
    }];
    debug.path = debug.path || 'browser.calendar.createEvent';
    debug.writableCount = 1;
    return includeDebug ? { calendars: fallback, debug } : fallback;
  }
  return includeDebug ? { calendars: [], debug } : [];
}

async function importViaCalendarApiWithTarget(eventPayloads, calendarId) {
  if (!browser.calendar && !browser.calendars && !(browser.TbCalendarAccess && typeof browser.TbCalendarAccess.createEvents === 'function')) {
    throw new Error('Calendar API unavailable');
  }

  if (browser.calendars && typeof browser.calendars.list === 'function' && typeof browser.calendars.createEvent === 'function') {
    const writable = await listWritableCalendars();
    if (!writable.length) throw new Error('No writable calendar found');
    let targetId = writable[0].id;
    if (calendarId) {
      const target = writable.find((c) => c.id === String(calendarId));
      if (!target) throw new Error('Selected calendar is unavailable');
      targetId = target.id;
    }
    const targetMeta = writable.find((c) => c.id === targetId) || { id: targetId, name: targetId };
    const results = [];
    for (const ev of eventPayloads) {
      await browser.calendars.createEvent(targetId, {
        title: ev.title,
        startDate: ev.start.toISOString(),
        endDate: ev.end.toISOString(),
        location: ev.location,
        description: ev.description
      });
      results.push({
        status: 'unverified',
        title: ev.title,
        startDate: ev.start.toISOString(),
        endDate: ev.end.toISOString(),
        location: ev.location || '',
        reason: 'No post-write verification on browser.calendars API.'
      });
    }
    return { targetId, targetName: targetMeta.name || targetId, results };
  }

  if (browser.calendar && typeof browser.calendar.createEvent === 'function') {
    const results = [];
    for (const ev of eventPayloads) {
      await browser.calendar.createEvent({
        title: ev.title,
        startDate: ev.start.toISOString(),
        endDate: ev.end.toISOString(),
        location: ev.location,
        description: ev.description
      });
      results.push({
        status: 'unverified',
        title: ev.title,
        startDate: ev.start.toISOString(),
        endDate: ev.end.toISOString(),
        location: ev.location || '',
        reason: 'No post-write verification on browser.calendar API.'
      });
    }
    return { targetId: '__default__', targetName: 'Default Calendar', results };
  }

  if (browser.TbCalendarAccess && typeof browser.TbCalendarAccess.createEvents === 'function') {
    const writable = await listWritableCalendars();
    if (!writable.length) throw new Error('No writable calendar found');
    let targetId = writable[0].id;
    if (calendarId) {
      const target = writable.find((c) => c.id === String(calendarId));
      if (!target) throw new Error('Selected calendar is unavailable');
      targetId = target.id;
    }
    const targetMeta = writable.find((c) => c.id === targetId) || { id: targetId, name: targetId };
    const response = await browser.TbCalendarAccess.createEvents(targetId, eventPayloads.map((ev) => ({
      title: ev.title,
      startDate: ev.start.toISOString(),
      endDate: ev.end.toISOString(),
      startLocal: ev.importStartLocal || '',
      endLocal: ev.importEndLocal || '',
      importTimeZone: ev.importTimeZone || '',
      location: ev.location,
      description: ev.description
    })));
    const results = Array.isArray(response && response.results) ? response.results : [];
    return { targetId, targetName: targetMeta.name || targetId, results };
  }

  throw new Error('No compatible calendar methods');
}

function alarmBlocks(policy) {
  if (policy === 'fallback_plus_1h') {
    return [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'TRIGGER:PT1H',
      'END:VALARM'
    ];
  }

  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-P1DT4H',
    'END:VALARM'
  ];
}

function buildICS(items) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//unread2calendar//thunderbird-addon//EN'];

  for (const item of items) {
    const ev = toEventPayload(item);
    const uid = `${item.id}@unread2calendar.addon`;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dateToICS(new Date())}`);
    lines.push(`DTSTART:${dateToICS(ev.start)}`);
    lines.push(`DTEND:${dateToICS(ev.end)}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    lines.push(`LOCATION:${escapeICS(ev.location)}`);
    lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    lines.push(...alarmBlocks(ev.reminderPolicy));
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

async function downloadICS(items) {
  const ics = buildICS(items);
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  try {
    await browser.downloads.download({
      url,
      filename: `unread2calendar-${new Date().toISOString().slice(0, 10)}.ics`,
      saveAs: true
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function getDisplayedContext() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab || !browser.messageDisplay || typeof browser.messageDisplay.getDisplayedMessage !== 'function') {
      return null;
    }

    const msg = await browser.messageDisplay.getDisplayedMessage(tab.id);
    if (!msg) return null;

    return {
      messageId: msg.id,
      subject: msg.subject || '',
      author: msg.author || '',
      date: msg.date || '',
      snippet: msg.snippet || ''
    };
  } catch (_) {
    return null;
  }
}

async function extractFromCurrentMessage(options) {
  const context = await getDisplayedContext();
  if (!context || !context.messageId) {
    return { context: null, extracted: false, reason: 'No active message.' };
  }

  const message = {
    id: context.messageId,
    subject: context.subject || '',
    author: context.author || '',
    date: context.date || '',
    snippet: context.snippet || ''
  };

  const result = await extractFromMessages([message], options);
  if (result.extracted === 0) {
    return { context, extracted: false, reason: 'No actionable candidate extracted.' };
  }
  return { context, extracted: true, reason: 'Updated from active message.' };
}

async function extractFromMessages(messages, options) {
  const settings = await getSettings();
  const localRules = settings.localRules || {};
  const useLLM = hasLLM(settings);
  const onProgress = options && typeof options.onProgress === 'function' ? options.onProgress : null;
  const list = Array.isArray(messages) ? messages.filter((m) => m && m.id) : [];
  if (!state.scan.running) {
    initRecognitionScan(list.length, 'running');
    await broadcastStateChanged();
  } else {
    state.scan.total = list.length;
    state.scan.phase = 'running';
  }
  if (list.length === 0) {
    stopRecognitionScan('done');
    return { processed: 0, extracted: 0, ignored: 0, failed: 0, cancelled: false };
  }

  let workingTodos = await getTodos();
  let extracted = 0;
  let processed = 0;
  let ignored = 0;
  let failed = 0;
  let llmRuleKeywordsChanged = false;
  let llmRuleKeywordsState = normalizeLocalRules(settings.localRules || {});

  const progressTick = async (line) => {
    if (line) {
      state.scan.line = String(line).replace(/\s+/g, ' ').trim();
      setStatus(state.scan.line);
    }
    if (!onProgress) return;
    await onProgress({
      processed,
      extracted,
      ignored,
      failed,
      total: list.length,
      line: state.scan.line
    });
  };

  if (useLLM) {
    const batchSize = Math.max(1, settings.llmBatchSize || DEFAULT_PROCESSING_SETTINGS.llmBatchSize);
    const retryCount = Math.max(0, settings.llmRetryCount || 0);
    const delayMs = Math.max(0, settings.llmBatchDelayMs || 0);

    for (let i = 0; i < list.length; i += 1) {
      await waitIfScanPaused();
      if (state.scan.cancelRequested) break;
      const message = list[i];
      const index = i + 1;
      await progressTick(buildProgressLine('uploading', index, list.length, 0));
      const full = await getMessageBodyInfo(message.id, settings.llmBodyMaxChars || DEFAULT_PROCESSING_SETTINGS.llmBodyMaxChars);
      const payload = {
        ...message,
        headerDate: full.headerDate || '',
        bodyText: full.bodyText || ''
      };
      await progressTick(buildProgressLine('waiting', index, list.length, 0));

      try {
        let attempt = 0;
        let llmResult = { events: [], nonTodoSummary: '' };
        while (attempt <= retryCount) {
          await waitIfScanPaused();
          if (state.scan.cancelRequested) throw makeCancelledError();
          try {
            llmResult = await llmExtract(payload, settings);
            break;
          } catch (error) {
            attempt += 1;
            if (attempt > retryCount) throw error;
          }
        }

        const validEvents = (Array.isArray(llmResult.events) ? llmResult.events : [])
          .filter((ev) => ev && ev.kind !== 'ignore');
        if (validEvents.length > 0) {
          const mergedKeywords = mergeLlmKeywordsIntoLocalRules(
            llmRuleKeywordsState,
            settings.groupDefinitions || [],
            validEvents
          );
          if (mergedKeywords.changed) {
            llmRuleKeywordsState = mergedKeywords.localRules;
            llmRuleKeywordsChanged = true;
          }
          const newTodos = validEvents.map((ev) => createTodoFromExtract(message, ev));
          workingTodos = recomputeDuplicates(mergeScannedItems(workingTodos, newTodos));
          await setTodos(workingTodos);
          extracted += validEvents.length;
          await progressTick(buildProgressLine('returned', index, list.length, validEvents.length));
        } else {
          const nonTodo = createNonTodoItem(message, llmResult.nonTodoSummary || fallbackNonTodoSummary(payload));
          workingTodos = recomputeDuplicates(mergeScannedItems(workingTodos, [nonTodo]));
          await setTodos(workingTodos);
          ignored += 1;
          await progressTick(buildProgressLine('returned', index, list.length, 0));
        }
      } catch (error) {
        if (error && error.code === 'SCAN_CANCELLED') {
          break;
        }
        failed += 1;
        await progressTick(buildProgressLine('failed', index, list.length, 0));
      }
      processed += 1;
      await progressTick();

      const batchEnd = (i + 1) % batchSize === 0;
      if (batchEnd && delayMs > 0 && i + 1 < list.length) {
        await waitIfScanPaused();
        if (state.scan.cancelRequested) break;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  } else {
    for (const message of list) {
      await waitIfScanPaused();
      if (state.scan.cancelRequested) break;
      const index = processed + 1;
      await progressTick(buildProgressLine('uploading', index, list.length, 0));
      try {
        const extract = localExtract(message, localRules);
        if (extract && extract.kind !== 'ignore') {
          workingTodos = recomputeDuplicates(mergeScannedItems(workingTodos, [createTodoFromExtract(message, extract)]));
          await setTodos(workingTodos);
          extracted += 1;
          await progressTick(buildProgressLine('returned', index, list.length, 1));
        } else {
          const nonTodo = createNonTodoItem(message, fallbackNonTodoSummary(message));
          workingTodos = recomputeDuplicates(mergeScannedItems(workingTodos, [nonTodo]));
          await setTodos(workingTodos);
          ignored += 1;
          await progressTick(buildProgressLine('returned', index, list.length, 0));
        }
      } catch (error) {
        if (error && error.code === 'SCAN_CANCELLED') {
          break;
        }
        failed += 1;
        await progressTick(buildProgressLine('failed', index, list.length, 0));
      }
      processed += 1;
      await progressTick();
    }
  }

  const cancelled = !!state.scan.cancelRequested;
  if (useLLM && llmRuleKeywordsChanged) {
    try {
      await setSettings({
        ...settings,
        localRules: llmRuleKeywordsState
      });
    } catch (_) {
      // Do not block todo extraction flow when keyword write-back fails.
    }
  }
  stopRecognitionScan(cancelled ? 'cancelled' : 'done');
  state.scan.line = buildFinalSummaryLine(processed, extracted);
  setStatus(state.scan.line);
  await progressTick();

  return {
    processed,
    extracted,
    ignored,
    failed,
    cancelled
  };
}

async function listActiveSelectedMessages() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs && tabs[0];
  if (!tab) return [];

  if (browser.mailTabs && typeof browser.mailTabs.getSelectedMessages === 'function') {
    try {
      let page = await browser.mailTabs.getSelectedMessages(tab.id);
      const selected = [];
      while (page) {
        const msgs = Array.isArray(page.messages) ? page.messages : [];
        selected.push(...msgs);
        if (!page.id) break;
        page = await browser.messages.continueList(page.id);
      }
      if (selected.length > 0) return selected;
    } catch (_) {
      // Fallback below.
    }
  }

  const context = await getDisplayedContext();
  if (context && context.messageId) {
    return [{
      id: context.messageId,
      subject: context.subject || '',
      author: context.author || '',
      date: context.date || '',
      snippet: context.snippet || ''
    }];
  }
  return [];
}

function nextStep(todos) {
  const active = todos.filter((t) => t.status !== 'done');
  const pendingTodo = active.filter((t) => t.kind === 'todo' && t.status === 'pending').length;
  const pendingImportant = active.filter((t) => t.kind === 'important' && t.status === 'pending').length;
  const queuedTodo = active.filter((t) => t.kind === 'todo' && t.status === 'queued').length;
  const rejectedTodo = active.filter((t) => t.kind === 'todo' && t.status === 'rejected').length;

  return {
    pendingTodo,
    pendingImportant,
    queuedTodo,
    rejectedTodo,
    readyForImport: queuedTodo > 0 || (pendingTodo === 0 && pendingImportant === 0 && rejectedTodo > 0)
  };
}

function processedCount(todos) {
  const list = Array.isArray(todos) ? todos : [];
  return list.filter((item) => {
    if (item.kind === 'todo') return ['queued', 'rejected', 'done'].includes(item.status);
    if (item.kind === 'important') return ['read_marked', 'converted', 'done'].includes(item.status);
    if (item.kind === 'non_todo') return ['seen', 'done'].includes(item.status);
    return false;
  }).length;
}

async function buildViewModel() {
  const todos = await getTodos();
  const importLogs = await getImportLogs();
  const settings = await getSettings();
  const context = await getDisplayedContext();
  const labels = groupLabelsForCurrentUi();

  const activeTodos = recomputeDuplicates(todos).filter((item) => item.status !== 'done');
  const zh = /^zh\b/.test(uiLangTag());
  const importedText = zh ? '已导入' : 'Imported';
  const unverifiedText = zh ? '待核验' : 'Unverified';
  const failedText = zh ? '失败' : 'Failed';
  const importLogItems = importLogs.map((log) => ({
    id: log.id,
    sourceMessageId: log.sourceMessageId,
    sourceAuthor: '',
    kind: 'import-log',
    status: 'history',
    title: `${log.title}${log.importStatus === 'failed' ? ` [${failedText}]` : (log.importStatus === 'unverified' ? ` [${unverifiedText}]` : '')}`,
    startText: log.startText || '',
    endText: '',
    location: log.calendarName
      ? `${log.calendarName} | ${log.importStatus === 'imported' ? importedText : (log.importStatus === 'unverified' ? unverifiedText : failedText)}`
      : (log.importStatus === 'imported' ? importedText : (log.importStatus === 'unverified' ? unverifiedText : failedText)),
    notes: [
      log.importReason || '',
      log.sourceTimeText ? `源时间: ${log.sourceTimeText}` : '',
      log.parsedTimeZone ? `源时区: ${log.parsedTimeZone}` : '',
      log.importLocalTimeText ? `本地时间: ${log.importLocalTimeText}` : '',
      log.importTimeZone ? `本地时区: ${log.importTimeZone}` : '',
      log.writtenStartISO ? `写入ISO: ${log.writtenStartISO}` : ''
    ]
      .filter(Boolean)
      .join('\n'),
    confidence: 1,
    group: IMPORTED_GROUP_KEY,
    groupLabel: labels.imported,
    duplicateCount: 1,
    displayTitle: `${log.title}${log.importStatus === 'failed' ? ` [${failedText}]` : (log.importStatus === 'unverified' ? ` [${unverifiedText}]` : '')}`,
    duplicateMessages: [],
    reminderPolicy: 'standard_two',
    edited: false,
    manualOverride: false,
    createdAt: log.importedAt,
    updatedAt: log.importedAt
  }));

  const active = [...activeTodos, ...importLogItems];
  const acceptedItems = active.filter((item) => item.kind === 'todo' && item.status === 'queued');
  const regularItems = active.filter((item) => !(item.kind === 'todo' && item.status === 'queued') && item.group !== IMPORTED_GROUP_KEY);

  const groupMap = new Map();
  for (const item of regularItems) {
    const key = item.group || 'other';
    const label = isKnownGroup(key) ? labels[normalizeGroup(key)] : (item.groupLabel || labels.other);
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        label,
        count: 0,
        items: []
      });
    }
    const target = groupMap.get(key);
    target.items.push(item);
    target.count = target.items.length;
  }
  if (regularItems.length > 0 && !groupMap.has('important')) {
    groupMap.set('important', {
      key: 'important',
      label: labels.important,
      count: 0,
      items: []
    });
  }

  const regularGroups = [...groupMap.values()];
  const importantIndex = regularGroups.findIndex((group) => group.key === 'important');
  const unrecognizedIndex = regularGroups.findIndex((group) => group.key === UNRECOGNIZED_GROUP_KEY);
  const orderedRegularGroups = [];
  if (importantIndex >= 0) {
    orderedRegularGroups.push(regularGroups[importantIndex]);
  }
  for (let i = 0; i < regularGroups.length; i += 1) {
    if (i === importantIndex || i === unrecognizedIndex) continue;
    orderedRegularGroups.push(regularGroups[i]);
  }
  if (unrecognizedIndex >= 0) {
    orderedRegularGroups.push(regularGroups[unrecognizedIndex]);
  }

  const groups = [...orderedRegularGroups];
  if (acceptedItems.length > 0) {
    groups.push({
      key: ACCEPTED_GROUP_KEY,
      label: labels.accepted,
      count: acceptedItems.length,
      items: acceptedItems
    });
  }
  groups.push({
    key: IMPORTED_GROUP_KEY,
    label: labels.imported,
    count: importLogItems.length,
    items: importLogItems
  });

  return {
    context: context || {
      messageId: null,
      subject: '',
      author: '',
      date: '',
      snippet: ''
    },
    selectedTodoId: state.selectedTodoId,
    needsLLMSetup: !hasLLM(settings),
    llmConnectionStatus: settings.llmConnectionStatus || 'unknown',
    llmConnectionError: settings.llmConnectionError || '',
    debugMode: !!settings.debugMode,
    groups,
    nextStep: nextStep(active),
    processedCount: processedCount(activeTodos),
    scan: { ...state.scan },
    statusText: state.statusText,
    errorText: state.errorText,
    version: browser.runtime.getManifest().version,
    appearance: settings.appearance || (APPEARANCE_API ? APPEARANCE_API.DEFAULT_APPEARANCE : null)
  };
}

async function selectTodo(todoId, openMessage) {
  state.selectedTodoId = todoId;
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === todoId);
  if (!todo || !openMessage) return;

  await openMessageById(todo.sourceMessageId);
}

async function openMessageById(messageId) {
  const id = Number(messageId);
  if (!Number.isFinite(id) || id <= 0) return;
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    if (!tab) return;

    if (browser.mailTabs && typeof browser.mailTabs.setSelectedMessages === 'function') {
      await browser.mailTabs.setSelectedMessages(tab.id, [id]);
    }
  } catch (_) {
    // Best effort.
  }
}

function patchTodo(item, patch) {
  return {
    ...item,
    ...patch,
    updatedAt: now()
  };
}

async function updateTodo(todoId, patch) {
  const todos = await getTodos();
  const updated = recomputeDuplicates(todos.map((item) => {
    if (item.id !== todoId) return item;
    return patchTodo(item, { ...patch, edited: true, manualOverride: true });
  }));
  await setTodos(updated);
}

async function queueTodo(todoId) {
  const todos = await getTodos();
  const updated = recomputeDuplicates(todos.map((item) => {
    if (item.id !== todoId || item.kind !== 'todo') return item;
    if (item.status === 'pending' || item.status === 'rejected') {
      return patchTodo(item, { status: 'queued', manualOverride: true });
    }
    return item;
  }));
  await setTodos(updated);
}

async function rejectTodo(todoId) {
  const todos = await getTodos();
  const updated = recomputeDuplicates(todos.map((item) => {
    if (item.id !== todoId || item.kind !== 'todo') return item;
    if (item.status === 'pending' || item.status === 'queued') {
      return patchTodo(item, { status: 'rejected', manualOverride: true });
    }
    return item;
  }));
  await setTodos(updated);
}

async function restoreTodo(todoId) {
  const todos = await getTodos();
  const updated = recomputeDuplicates(todos.map((item) => {
    if (item.id !== todoId || item.kind !== 'todo') return item;
    if (item.status === 'rejected') {
      return patchTodo(item, { status: 'pending', manualOverride: false });
    }
    return item;
  }));
  await setTodos(updated);
}

async function markImportantRead(todoId) {
  const todos = await getTodos();
  let msgId = null;
  const updated = recomputeDuplicates(todos.map((item) => {
    if (item.id !== todoId || item.kind !== 'important') return item;
    msgId = item.sourceMessageId;
    if (item.status === 'pending') {
      return patchTodo(item, { status: 'read_marked', manualOverride: true });
    }
    return item;
  }));

  if (msgId) await tryMarkRead(msgId);
  await setTodos(updated);
}

async function markNonTodoSeen(todoId) {
  const todos = await getTodos();
  const updated = recomputeDuplicates(todos.map((item) => {
    if (item.id !== todoId || item.kind !== 'non_todo') return item;
    if (item.status === 'unseen') {
      return patchTodo(item, { status: 'seen', manualOverride: true });
    }
    return item;
  }));
  await setTodos(updated);
}

async function convertImportant(todoId, payload) {
  const todos = await getTodos();
  const additional = [];
  const updated = todos.map((item) => {
    if (item.id !== todoId || item.kind !== 'important') return item;

    const fallback = defaultRangeText();
    const title = normalizeText(payload.title || item.title || 'Converted todo');
    const startText = normalizeText(payload.startText || '') || fallback.startText;
    const endText = normalizeText(payload.endText || '') || fallback.endText;
    const location = normalizeText(payload.location || '') || item.location;

    const newTodo = {
      id: createTodoId(),
      sourceMessageId: item.sourceMessageId,
      sourceAuthor: item.sourceAuthor,
      kind: 'todo',
      status: 'pending',
      title,
      startText,
      endText,
      location,
      notes: item.notes,
      confidence: item.confidence,
      group: 'other',
      groupLabel: groupLabelsForCurrentUi().other,
      duplicateCount: 1,
      displayTitle: title,
      duplicateMessages: [],
      reminderPolicy: payload.startText ? 'standard_two' : 'fallback_plus_1h',
      edited: true,
      manualOverride: true,
      createdAt: now(),
      updatedAt: now()
    };

    additional.push(newTodo);
    return patchTodo(item, { status: 'converted', manualOverride: true });
  });

  await setTodos(recomputeDuplicates([...updated, ...additional]));
}

async function batchImport(calendarId) {
  const todos = await getTodos();
  const importItems = todos.filter((t) => t.kind === 'todo' && t.status === 'queued');
  const rejectedItems = todos.filter((t) => t.kind === 'todo' && t.status === 'rejected');

  if (importItems.length === 0 && rejectedItems.length === 0) {
    return { imported: 0, markedRead: 0, method: 'none', finalizedRejected: 0 };
  }

  let method = 'calendar-api-direct';
  let importResult = { targetId: '', targetName: '', results: [] };
  if (importItems.length > 0) {
    const payloadEntries = importItems.map((item) => ({ item, payload: toEventPayload(item) }));
    const payloads = payloadEntries.map((entry) => entry.payload);
    try {
      importResult = await importViaCalendarApiWithTarget(payloads, calendarId);
    } catch (error) {
      let reason = (error && error.message) ? error.message : String(error || 'unknown');
      if (
        browser.TbCalendarAccess &&
        typeof browser.TbCalendarAccess.getLastError === 'function' &&
        /unexpected error/i.test(reason)
      ) {
        try {
          const experimentError = await browser.TbCalendarAccess.getLastError();
          if (experimentError) {
            reason = `${reason} | experiment=${experimentError}`;
          }
        } catch (_) {
          // Ignore diagnostic fetch failure.
        }
      }
      const target = calendarId ? String(calendarId) : 'auto';
      const wrapped = new Error(`Direct calendar import failed | phase=direct-import | calendarId=${target} | events=${payloads.length} | reason=${reason}`);
      wrapped.code = 'DIRECT_IMPORT_FAILED';
      wrapped.phase = 'direct-import';
      wrapped.calendarId = target;
      wrapped.events = payloads.length;
      wrapped.cause = reason;
      throw wrapped;
    }
  }

  const resultRows = Array.isArray(importResult.results) ? importResult.results : [];
  const payloadEntries = importItems.map((item) => ({ item, payload: toEventPayload(item) }));
  const normalizedRows = payloadEntries.map((entry, idx) => {
    const item = entry.item;
    const payload = entry.payload;
    const row = resultRows[idx] || {};
    const status = normalizeText(row.status) || 'failed';
    const safeStatus = ['imported', 'unverified', 'failed'].includes(status) ? status : 'failed';
    const reason = normalizeText(row.reason);
    return {
      item,
      status: safeStatus,
      reason,
      calendarId: normalizeText(importResult.targetId) || normalizeText(calendarId),
      calendarName: normalizeText(importResult.targetName) || normalizeText(calendarId),
      startDate: normalizeText(row.startDate) || payload.writtenStartISO,
      endDate: normalizeText(row.endDate) || payload.writtenEndISO,
      sourceTimeZone: normalizeText(payload.sourceTimeZone),
      importTimeZone: normalizeText(payload.importTimeZone),
      sourceStartText: normalizeText(payload.sourceStartText),
      importStartLocal: normalizeText(payload.importStartLocal)
    };
  });

  const importedRows = normalizedRows.filter((row) => row.status === 'imported');
  const unverifiedRows = normalizedRows.filter((row) => row.status === 'unverified');
  const failedRows = normalizedRows.filter((row) => row.status === 'failed');

  if (normalizedRows.length > 0) {
    const logs = normalizedRows.map((row) => ({
      id: `import-log-${row.item.id}-${now()}`,
      todoId: row.item.id,
      sourceMessageId: row.item.sourceMessageId || '',
      calendarId: row.calendarId || '',
      calendarName: row.calendarName || '',
      importStatus: row.status,
      importReason: row.reason || '',
      parsedTimeZone: row.sourceTimeZone || '',
      importTimeZone: row.importTimeZone || '',
      sourceTimeText: row.sourceStartText || '',
      importLocalTimeText: row.importStartLocal || '',
      writtenStartISO: row.startDate || '',
      writtenEndISO: row.endDate || '',
      title: row.item.title || '',
      startText: row.item.startText || '',
      location: row.item.location || '',
      importedAt: now()
    }));
    await appendImportLogs(logs);
  }

  const importedIds = new Set(importedRows.map((row) => row.item.id));

  let markedRead = 0;
  for (const item of [...importedRows.map((row) => row.item), ...rejectedItems]) {
    if (await tryMarkRead(item.sourceMessageId)) markedRead += 1;
  }

  const rejectedIds = new Set(rejectedItems.map((i) => i.id));
  const updated = recomputeDuplicates(todos.map((item) => {
    if (importedIds.has(item.id)) return patchTodo(item, { status: 'done' });
    if (rejectedIds.has(item.id)) return patchTodo(item, { status: 'done' });
    return item;
  }));

  await setTodos(updated);
  const lastImported = importedRows.length > 0 ? importedRows[importedRows.length - 1] : null;
  if (lastImported && browser.TbCalendarAccess && typeof browser.TbCalendarAccess.openCalendarAt === 'function') {
    try {
      await browser.TbCalendarAccess.openCalendarAt(lastImported.startDate);
    } catch (_) {
      // Keep import result even if navigation fails.
    }
  }

  return {
    imported: importedRows.length,
    unverified: unverifiedRows.length,
    failed: failedRows.length,
    markedRead,
    method,
    finalizedRejected: rejectedItems.length
  };
}

function setupContextMenus() {
  if (!browser.menus || typeof browser.menus.create !== 'function') return;
  try {
    browser.menus.remove(MENU_EXTRACT_TODO);
  } catch (_) {
    // Ignore.
  }
  try {
    browser.menus.remove(MENU_OPEN_FROM_ACTION);
  } catch (_) {
    // Ignore.
  }
  try {
    browser.menus.create({
      id: MENU_EXTRACT_TODO,
      title: '识别待办事项',
      contexts: ['message_list', 'all']
    });
  } catch (_) {
    // Keep extension alive even if one context is unsupported.
  }
  try {
    browser.menus.create({
      id: MENU_OPEN_FROM_ACTION,
      title: '打开 Todo Sidebar',
      contexts: ['browser_action_menu', 'message_display_action_menu']
    });
  } catch (_) {
    // Keep extension alive even if one context is unsupported.
  }
}

async function openTodoWindowInCurrentContext(tab, toggle) {
  const errors = [];
  void toggle;
  const windowId = tab && Number.isInteger(tab.windowId) ? tab.windowId : undefined;

  try {
    if (browser.browserAction && typeof browser.browserAction.openPopup === 'function') {
      await browser.browserAction.openPopup();
      return;
    }
  } catch (error) {
    errors.push(`browserAction.openPopup: ${formatErrorDetail(error)}`);
  }

  try {
    await browser.tabs.create({
      url: browser.runtime.getURL('sidebar/panel.html'),
      active: true,
      ...(windowId ? { windowId } : {})
    });
    return;
  } catch (error) {
    errors.push(`tabs.create: ${formatErrorDetail(error)}`);
  }

  const err = new Error(`All UI open methods failed.\n${errors.join('\n\n')}`);
  err.code = 'OPEN_TODO_UI_FAILED';
  throw err;
}

browser.menus.onClicked.addListener(async (info, tab) => {
  if (!info) return;
  if (info.menuItemId === MENU_OPEN_FROM_ACTION) {
    try {
      await openTodoWindowInCurrentContext(tab, true);
    } catch (error) {
      setError('Open from action menu', error);
      await broadcastStateChanged();
    }
    return;
  }
  if (info.menuItemId !== MENU_EXTRACT_TODO) return;
  try {
    await openTodoWindowInCurrentContext(tab, false);
    await stopRunningRecognitionIfNeeded();
    await resetTodos();
    setStatus(/^zh\b/.test(uiLangTag()) ? '已清空待办，开始识别所选邮件' : 'Cleared todos, processing selected messages');
    await broadcastStateChanged();
    const selected = await listActiveSelectedMessages();
    if (!selected.length) {
      setStatus('No selected messages to extract.');
      await broadcastStateChanged();
      return;
    }
    const result = await extractFromMessages(selected, {
      onProgress: broadcastStateChanged
    });
    if (result.processed === 0) {
      setStatus('No selected messages to extract.');
    }
    await broadcastStateChanged();
  } catch (error) {
    setError('Extract selected', error);
    await broadcastStateChanged();
  }
});

if (browser.runtime && browser.runtime.onInstalled) {
  browser.runtime.onInstalled.addListener(() => {
    setupContextMenus();
  });
}
setupContextMenus();

if (browser.browserAction && browser.browserAction.onClicked) {
  browser.browserAction.onClicked.addListener(async (tab) => {
    try {
      await openTodoWindowInCurrentContext(tab, true);
    } catch (error) {
      setError('Toggle pane', error);
      await broadcastStateChanged();
    }
  });
}

if (browser.messageDisplayAction && browser.messageDisplayAction.onClicked) {
  browser.messageDisplayAction.onClicked.addListener(async (tab) => {
    try {
      await openTodoWindowInCurrentContext(tab, true);
    } catch (error) {
      setError('Toggle pane', error);
      await broadcastStateChanged();
    }
  });
}

browser.runtime.onMessage.addListener((message) => {
  if (!message || !message.type) return undefined;

  const handler = async () => {
    switch (message.type) {
      case 'todo:get-view-model': {
        return buildViewModel();
      }
      case 'todo:open-pane': {
        try {
          await openTodoWindowInCurrentContext(null, false);
          return { ok: true };
        } catch (error) {
          setError('Open pane', error);
          await broadcastStateChanged();
          throw error;
        }
      }
      case 'todo:get-ui-error': {
        return null;
      }
      case 'todo:refresh-active': {
        await stopRunningRecognitionIfNeeded();
        await resetTodos();
        setStatus(/^zh\b/.test(uiLangTag()) ? '已清空待办，开始识别当前邮件' : 'Cleared todos, processing current email');
        await broadcastStateChanged();
        const result = await extractFromCurrentMessage({
          onProgress: broadcastStateChanged
        });
        if (!result.extracted) setStatus(result.reason || 'No actionable candidate extracted.');
        await broadcastStateChanged();
        return buildViewModel();
      }
      case 'todo:list-accounts': {
        const accounts = await browser.accounts.list();
        return accounts.map((a) => ({ id: a.id, name: a.name || a.id }));
      }
      case 'todo:scan-all-unread': {
        try {
          await stopRunningRecognitionIfNeeded();
          await resetTodos();
          await scanAllUnread();
        } catch (error) {
          stopRecognitionScan('done');
          setError('Scan', error);
          await broadcastStateChanged();
          throw error;
        }
        return { ok: true };
      }
      case 'todo:scan-unread-by-accounts': {
        try {
          await stopRunningRecognitionIfNeeded();
          await resetTodos();
          await scanUnreadByAccounts(Array.isArray(message.accountIds) ? message.accountIds : []);
        } catch (error) {
          stopRecognitionScan('done');
          setError('Scan', error);
          await broadcastStateChanged();
          throw error;
        }
        return { ok: true };
      }
      case 'todo:extract-selected-messages': {
        await stopRunningRecognitionIfNeeded();
        await resetTodos();
        const ids = Array.isArray(message.messageIds) ? message.messageIds : [];
        const selected = ids.length > 0
          ? (await listActiveSelectedMessages()).filter((m) => ids.includes(m.id))
          : await listActiveSelectedMessages();
        const result = await extractFromMessages(selected, {
          onProgress: broadcastStateChanged
        });
        if (result.processed === 0) {
          setStatus('No selected messages to extract.');
        }
        await broadcastStateChanged();
        return result;
      }
      case 'todo:scan-pause': {
        if (state.scan.running && !state.scan.paused) {
          state.scan.paused = true;
          state.scan.phase = 'paused';
          setStatus(/^zh\b/.test(uiLangTag()) ? '识别任务已暂停' : 'Recognition paused');
          await broadcastStateChanged();
        }
        return { ok: true };
      }
      case 'todo:scan-resume': {
        if (state.scan.running && state.scan.paused) {
          state.scan.paused = false;
          state.scan.phase = 'running';
          setStatus(/^zh\b/.test(uiLangTag()) ? '识别任务继续' : 'Recognition resumed');
          await broadcastStateChanged();
        }
        return { ok: true };
      }
      case 'todo:scan-cancel': {
        if (markRecognitionCancelRequested()) {
          setStatus(/^zh\b/.test(uiLangTag()) ? '正在取消识别任务...' : 'Cancelling recognition task...');
          await broadcastStateChanged();
        }
        return { ok: true };
      }
      case 'todo:clear-screen': {
        await stopRunningRecognitionIfNeeded();
        await resetTodos();
        state.scan.line = '';
        state.scan.total = 0;
        state.scan.processed = 0;
        state.scan.extracted = 0;
        state.scan.failed = 0;
        state.scan.phase = 'idle';
        state.scan.running = false;
        state.scan.paused = false;
        state.scan.cancelRequested = false;
        setStatus(/^zh\b/.test(uiLangTag()) ? '已清屏' : 'Cleared');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:select': {
        await selectTodo(message.todoId, !!message.openMessage);
        setStatus('Selected item.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:open-message': {
        await openMessageById(message.messageId);
        setStatus('Opened message.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:update': {
        await updateTodo(message.todoId, message.patch || {});
        setStatus('Saved item.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:queue': {
        await queueTodo(message.todoId);
        setStatus('Queued item.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:reject': {
        await rejectTodo(message.todoId);
        setStatus('Rejected item.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:restore': {
        await restoreTodo(message.todoId);
        setStatus('Restored item.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:mark-important-read': {
        await markImportantRead(message.todoId);
        setStatus('Marked read.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:mark-non-todo-seen': {
        await markNonTodoSeen(message.todoId);
        setStatus('Marked viewed.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:convert-important': {
        await convertImportant(message.todoId, message.payload || {});
        setStatus('Converted to todo.');
        await broadcastStateChanged();
        return { ok: true };
      }
      case 'todo:batch-import': {
        const result = await batchImport(message.calendarId || null);
        setStatus(`Imported ${result.imported}, unverified ${result.unverified || 0}, failed ${result.failed || 0}, finalized rejected ${result.finalizedRejected || 0}, marked read ${result.markedRead}.`);
        await broadcastStateChanged();
        return result;
      }
      case 'todo:list-calendars': {
        return listWritableCalendars({ includeDebug: !!message.includeDebug });
      }
      case 'todo:get-settings': {
        return getSettings();
      }
      case 'todo:set-settings': {
        const saved = await setSettings(message.settings || {});
        setStatus('Saved settings.');
        await broadcastStateChanged();
        return saved;
      }
      case 'todo:get-local-rules': {
        const settings = await getSettings();
        return settings.localRules || cloneDefaultLocalRules();
      }
      case 'todo:set-local-rules': {
        const settings = await getSettings();
        const saved = await setSettings({
          ...settings,
          localRules: normalizeLocalRules(message.localRules || {})
        });
        setStatus('Saved local rules.');
        await broadcastStateChanged();
        return saved.localRules;
      }
      case 'todo:reset-local-rules': {
        const settings = await getSettings();
        const saved = await setSettings({
          ...settings,
          localRules: cloneDefaultLocalRules()
        });
        setStatus('Reset local rules.');
        await broadcastStateChanged();
        return saved.localRules;
      }
      case 'todo:test-llm-connection': {
        return testLLMConnection(message.settings || {});
      }
      case 'todo:set-llm-connection-status': {
        const settings = await getSettings();
        const saved = await setSettings({
          ...settings,
          llmConnectionStatus: normalizeLlmConnectionStatus(message && message.status),
          llmConnectionError: normalizeText(message && message.error),
          llmConnectionTestedAt: normalizeText(message && message.testedAt) || new Date().toISOString()
        });
        await broadcastStateChanged();
        return {
          llmConnectionStatus: saved.llmConnectionStatus,
          llmConnectionError: saved.llmConnectionError,
          llmConnectionTestedAt: saved.llmConnectionTestedAt
        };
      }
      default:
        return undefined;
    }
  };

  return handler().catch(async (error) => {
    if (!state.errorText) setError('Action', error);
    await broadcastStateChanged();
    throw error;
  });
});
