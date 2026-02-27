'use strict';

const baseUrl = document.getElementById('baseUrl');
const model = document.getElementById('model');
const apiKey = document.getElementById('apiKey');
const llmProvider = document.getElementById('llmProvider');
const llmModelPreset = document.getElementById('llmModelPreset');
const refreshPresetsBtn = document.getElementById('refreshPresetsBtn');
const useTemperature = document.getElementById('useTemperature');
const temperature = document.getElementById('temperature');
const useMaxTokens = document.getElementById('useMaxTokens');
const maxTokens = document.getElementById('maxTokens');
const useTopP = document.getElementById('useTopP');
const topP = document.getElementById('topP');
const debugMode = document.getElementById('debugMode');
const llmPromptTemplate = document.getElementById('llmPromptTemplate');

const llmGroupsChips = document.getElementById('llmGroupsChips');
const llmGroupsInput = document.getElementById('llmGroupsInput');
const llmBodyMaxChars = document.getElementById('llmBodyMaxChars');
const llmBatchSize = document.getElementById('llmBatchSize');
const llmRetryCount = document.getElementById('llmRetryCount');
const llmBatchDelayMs = document.getElementById('llmBatchDelayMs');

const timeKeywordsChips = document.getElementById('timeKeywordsChips');
const locationKeywordsChips = document.getElementById('locationKeywordsChips');
const groupAcademicChips = document.getElementById('groupAcademicChips');
const groupCourseChips = document.getElementById('groupCourseChips');
const groupActivityChips = document.getElementById('groupActivityChips');
const groupImportantChips = document.getElementById('groupImportantChips');
const groupOtherChips = document.getElementById('groupOtherChips');

const timeKeywordsInput = document.getElementById('timeKeywordsInput');
const locationKeywordsInput = document.getElementById('locationKeywordsInput');
const groupAcademicInput = document.getElementById('groupAcademicInput');
const groupCourseInput = document.getElementById('groupCourseInput');
const groupActivityInput = document.getElementById('groupActivityInput');
const groupImportantInput = document.getElementById('groupImportantInput');
const groupOtherInput = document.getElementById('groupOtherInput');
const dynamicGroupKeywordRows = document.getElementById('dynamicGroupKeywordRows');
const dynamicAppearanceGroupRows = document.getElementById('dynamicAppearanceGroupRows');
const appearancePreviewRoot = document.getElementById('appearancePreviewRoot');
const llmGroupsSortHint = document.getElementById('llmGroupsSortHint');

const testBtn = document.getElementById('testBtn');
const saveGeneralBtn = document.getElementById('saveGeneralBtn');
const saveLlmPageBtn = document.getElementById('saveLlmPageBtn');
const saveRulesPageBtn = document.getElementById('saveRulesPageBtn');
const resetRulesBtn = document.getElementById('resetRulesBtn');
const resetPromptBtn = document.getElementById('resetPromptBtn');
const statusBox = document.getElementById('status');
const generalStatus = document.getElementById('generalStatus');
const ioStatus = document.getElementById('ioStatus');
const exportSettingsBtn = document.getElementById('exportSettingsBtn');
const importSettingsBtn = document.getElementById('importSettingsBtn');
const importSettingsFile = document.getElementById('importSettingsFile');
const settingsNav = document.getElementById('settingsNav');
const settingsPagesRoot = document.getElementById('settingsPages');

const appearanceMode = document.getElementById('appearanceMode');
const appearancePreset = document.getElementById('appearancePreset');
const appearanceTextColor = document.getElementById('appearanceTextColor');
const appearanceBaseFontSize = document.getElementById('appearanceBaseFontSize');
const appearanceTitleBold = document.getElementById('appearanceTitleBold');
const appearanceEventGap = document.getElementById('appearanceEventGap');
const appearanceGroupGap = document.getElementById('appearanceGroupGap');
const appearanceModuleBg = document.getElementById('appearanceModuleBg');
const appearanceButtonBg = document.getElementById('appearanceButtonBg');
const appearanceButtonText = document.getElementById('appearanceButtonText');
const appearanceGroupTitleColor = document.getElementById('appearanceGroupTitleColor');
const appearanceGroupTitleSize = document.getElementById('appearanceGroupTitleSize');
const appearanceItemTitleColor = document.getElementById('appearanceItemTitleColor');
const appearanceItemTitleSize = document.getElementById('appearanceItemTitleSize');
const appearanceMetaColor = document.getElementById('appearanceMetaColor');
const appearanceMetaSize = document.getElementById('appearanceMetaSize');
const appearanceStatusColor = document.getElementById('appearanceStatusColor');
const appearanceStatusSize = document.getElementById('appearanceStatusSize');
const appearanceCardBg = document.getElementById('appearanceCardBg');
const appearanceCardBorderColor = document.getElementById('appearanceCardBorderColor');
const appearanceCardRadius = document.getElementById('appearanceCardRadius');
const appearanceCardShadow = document.getElementById('appearanceCardShadow');
const appearanceCardMinHeight = document.getElementById('appearanceCardMinHeight');
const appearanceCardPaddingY = document.getElementById('appearanceCardPaddingY');
const appearanceCardPaddingX = document.getElementById('appearanceCardPaddingX');
const appearanceCardGap = document.getElementById('appearanceCardGap');
const appearanceActionGap = document.getElementById('appearanceActionGap');
const appearanceGroupAccentImportant = document.getElementById('appearanceGroupAccentImportant');
const appearanceGroupBgImportant = document.getElementById('appearanceGroupBgImportant');
const appearanceGroupAccentAcademic = document.getElementById('appearanceGroupAccentAcademic');
const appearanceGroupBgAcademic = document.getElementById('appearanceGroupBgAcademic');
const appearanceGroupAccentCourse = document.getElementById('appearanceGroupAccentCourse');
const appearanceGroupBgCourse = document.getElementById('appearanceGroupBgCourse');
const appearanceGroupAccentActivity = document.getElementById('appearanceGroupAccentActivity');
const appearanceGroupBgActivity = document.getElementById('appearanceGroupBgActivity');
const appearanceGroupAccentOther = document.getElementById('appearanceGroupAccentOther');
const appearanceGroupBgOther = document.getElementById('appearanceGroupBgOther');
const appearanceGroupAccentUnrecognized = document.getElementById('appearanceGroupAccentUnrecognized');
const appearanceGroupBgUnrecognized = document.getElementById('appearanceGroupBgUnrecognized');
const appearanceResetAllTopBtn = document.getElementById('appearanceResetAllTopBtn');
const appearanceResetAllBottomBtn = document.getElementById('appearanceResetAllBottomBtn');
const appearanceResetTopModuleBtn = document.getElementById('appearanceResetTopModuleBtn');
const appearanceResetMiddleModuleBtn = document.getElementById('appearanceResetMiddleModuleBtn');
const appearanceResetBottomModuleBtn = document.getElementById('appearanceResetBottomModuleBtn');
const saveAppearanceBtn = document.getElementById('saveAppearanceBtn');
const appearanceStatus = document.getElementById('appearanceStatus');

const appearanceColorInputs = [
  appearanceTextColor,
  appearanceModuleBg,
  appearanceButtonBg,
  appearanceButtonText,
  appearanceGroupTitleColor,
  appearanceItemTitleColor,
  appearanceMetaColor,
  appearanceStatusColor,
  appearanceCardBg,
  appearanceCardBorderColor,
  appearanceGroupAccentImportant,
  appearanceGroupAccentAcademic,
  appearanceGroupAccentCourse,
  appearanceGroupAccentActivity,
  appearanceGroupAccentOther,
  appearanceGroupAccentUnrecognized
];
const appearanceGroupBgInputs = [
  appearanceGroupBgImportant,
  appearanceGroupBgAcademic,
  appearanceGroupBgCourse,
  appearanceGroupBgActivity,
  appearanceGroupBgOther,
  appearanceGroupBgUnrecognized
];

const DEFAULT_PROMPT = `你是邮件待办识别器。请基于单封邮件内容尽可能完整识别所有待办事件。
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

const DEFAULT_RUNTIME = {
  llmBodyMaxChars: 12000,
  llmBatchSize: 20,
  llmRetryCount: 1,
  llmBatchDelayMs: 100
};

function buildBuiltinProviderCatalog() {
  return [
    { id: 'local', label: '本地模型（OpenAI兼容）', baseUrl: 'http://127.0.0.1:1234/v1', models: ['local-model', 'qwen2.5:latest', 'llama3.1:8b'] },
    { id: 'ollama', label: '本地模型（Ollama）', baseUrl: 'http://127.0.0.1:11434', models: ['qwen2.5:latest', 'llama3.1:8b', 'mistral:latest'] },
    { id: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-5-mini', 'gpt-5', 'gpt-4.1-mini'] },
    { id: 'anthropic', label: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-3-5-sonnet-latest'] },
    { id: 'google', label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'] },
    { id: 'xai', label: 'xAI', baseUrl: 'https://api.x.ai/v1', models: ['grok-3-mini-beta', 'grok-3-beta', 'grok-2-1212'] },
    { id: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'groq', label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'] },
    { id: 'openrouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4.1-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001'] },
    { id: 'moonshot', label: 'Moonshot', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] }
  ];
}

function getProviderById(id) {
  return (state.providerCatalog || []).find((p) => p.id === id) || null;
}

function ensureModelPresetValue(provider, preferred) {
  const models = Array.isArray(provider && provider.models) ? provider.models : [];
  const normalizedPreferred = String(preferred || '').trim();
  if (normalizedPreferred && models.includes(normalizedPreferred)) {
    return normalizedPreferred;
  }
  return models[0] || '';
}

function applyProviderToInputs(provider, preferredModel) {
  if (!provider) return;
  baseUrl.value = provider.baseUrl || baseUrl.value;
  const nextModel = ensureModelPresetValue(provider, preferredModel);
  if (nextModel) model.value = nextModel;
}

function renderProviderCatalog(selectedProviderId, preferredModel) {
  const providers = Array.isArray(state.providerCatalog) ? state.providerCatalog : [];
  llmProvider.textContent = '';
  const customOption = document.createElement('option');
  customOption.value = '';
  customOption.textContent = t('providerCustom');
  llmProvider.appendChild(customOption);
  for (const provider of providers) {
    const opt = document.createElement('option');
    opt.value = provider.id;
    opt.textContent = provider.label;
    llmProvider.appendChild(opt);
  }

  llmProvider.value = selectedProviderId || '';
  renderModelPresetOptions(selectedProviderId, preferredModel);
}

function renderModelPresetOptions(providerId, preferredModel) {
  const provider = getProviderById(providerId);
  llmModelPreset.textContent = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = t('selectModel');
  llmModelPreset.appendChild(placeholder);

  if (!provider) {
    llmModelPreset.value = '';
    llmModelPreset.disabled = true;
    return;
  }
  llmModelPreset.disabled = false;
  for (const m of provider.models || []) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    llmModelPreset.appendChild(opt);
  }
  llmModelPreset.value = ensureModelPresetValue(provider, preferredModel);
}

function detectProviderFromInputs() {
  const currentBase = String(baseUrl.value || '').replace(/\/+$/, '').toLowerCase();
  const currentModel = String(model.value || '').trim();
  const providers = Array.isArray(state.providerCatalog) ? state.providerCatalog : [];
  const matched = providers.find((provider) => {
    const pBase = String(provider.baseUrl || '').replace(/\/+$/, '').toLowerCase();
    return pBase && currentBase === pBase;
  });
  return {
    providerId: matched ? matched.id : '',
    model: currentModel
  };
}

async function fetchRemoteModelsForProvider(provider, key) {
  if (!provider) return [];
  const apiKeyText = String(key || '').trim();
  const base = String(provider.baseUrl || '').replace(/\/+$/, '');
  const attempts = [];
  const collectIds = (json) => {
    const openaiRows = Array.isArray(json && json.data) ? json.data : [];
    const nativeRows = Array.isArray(json && json.models) ? json.models : [];
    const rows = openaiRows.length ? openaiRows : nativeRows;
    return rows
      .map((row) => String((row && (row.id || row.name)) || '').trim())
      .map((id) => id.replace(/^models\//, ''))
      .filter(Boolean)
      .slice(0, 50);
  };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const isRetryable = (error) => {
    const status = Number(error && error.status);
    if (!Number.isFinite(status)) return true;
    return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
  };
  const requestJson = async (url, headers) => {
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
      try {
        const resp = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller ? controller.signal : undefined
        });
        if (timeoutId) clearTimeout(timeoutId);
        if (!resp.ok) {
          const body = await resp.text().catch(() => '');
          const err = new Error(`HTTP ${resp.status}${body ? ` ${body.slice(0, 300)}` : ''}`);
          err.status = resp.status;
          throw err;
        }
        const json = await resp.json();
        return collectIds(json);
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        const timedOut = String(error && error.name || '').toLowerCase() === 'aborterror';
        if (timedOut) {
          const timeoutErr = new Error('Request timeout');
          timeoutErr.status = 408;
          lastError = timeoutErr;
        } else {
          lastError = error;
        }
        if (attempt >= 3 || !isRetryable(lastError)) break;
        await sleep(300 * attempt);
      }
    }
    throw lastError || new Error('Request failed');
  };
  const authHeaders = () => (apiKeyText ? { Authorization: `Bearer ${apiKeyText}` } : {});

  if (provider.id === 'ollama') {
    const endpoints = [`${base}/api/tags`];
    for (const url of endpoints) {
      try {
        const models = await requestJson(url, { Accept: 'application/json' });
        if (models.length > 0) return models;
      } catch (error) {
        attempts.push(`ollama:${error && error.message ? error.message : String(error || 'unknown')}`);
      }
    }
    throw new Error(`Ollama models API failed (${attempts.join(' | ')})`);
  }

  if (provider.id === 'anthropic') {
    if (!apiKeyText) throw new Error('Missing API key for Anthropic');
    const endpoints = [`${base}/models`, `${base}/models?limit=100`];
    for (const url of endpoints) {
      try {
        const models = await requestJson(url, {
          'x-api-key': apiKeyText,
          'anthropic-version': '2023-06-01'
        });
        if (models.length > 0) return models;
      } catch (error) {
        attempts.push(`anthropic:${error && error.message ? error.message : String(error || 'unknown')}`);
      }
    }
    throw new Error(`Anthropic models API failed (${attempts.join(' | ')})`);
  }

  if (provider.id === 'google') {
    if (!apiKeyText) throw new Error('Missing API key for Gemini');
    const openaiUrl = `${base}/models`;
    try {
      return await requestJson(openaiUrl, { Authorization: `Bearer ${apiKeyText}` });
    } catch (error) {
      attempts.push(`openai:${error && error.message ? error.message : String(error || 'unknown')}`);
    }
    const nativeBase = base.replace(/\/openai$/i, '');
    const nativeUrl = `${nativeBase}/models?key=${encodeURIComponent(apiKeyText)}`;
    try {
      return await requestJson(nativeUrl, { Accept: 'application/json' });
    } catch (error) {
      attempts.push(`native:${error && error.message ? error.message : String(error || 'unknown')}`);
    }
    throw new Error(`Gemini models API failed (${attempts.join(' | ')})`);
  }

  const endpoints = [`${base}/models`, `${base}/models?limit=200`];
  for (const url of endpoints) {
    try {
      const models = await requestJson(url, authHeaders());
      if (models.length > 0) return models;
    } catch (error) {
      attempts.push(`${provider.id}:${error && error.message ? error.message : String(error || 'unknown')}`);
    }
  }
  throw new Error(`${provider.label || provider.id} models API failed (${attempts.join(' | ')})`);
}

const state = {
  settings: {},
  groupDefinitions: [],
  dirtyPages: new Set(),
  activePage: 'general',
  localRules: {
    timeKeywords: [],
    locationKeywords: [],
    groupKeywords: {}
  },
  appearanceGroupStyles: {},
  appearance: null,
  providerCatalog: [],
  llmGroupsDragIndex: -1
};

const GROUP_ACCENT_PALETTE = Object.freeze([
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#dc2626',
  '#0d9488',
  '#9333ea',
  '#ea580c',
  '#4f46e5'
]);

function currentLang() {
  try {
    if (browser.i18n && typeof browser.i18n.getUILanguage === 'function') {
      const lang = String(browser.i18n.getUILanguage() || '').toLowerCase();
      if (lang.startsWith('zh')) return 'zh';
    }
  } catch (_) {
    // Ignore.
  }
  const fallback = String((navigator && navigator.language) || '').toLowerCase();
  return fallback.startsWith('zh') ? 'zh' : 'en';
}

const TEXT = {
  zh: {
    presetsUpdated: '供应商预设已更新',
    presetsUpdatedWithRemote: '供应商预设已更新（含在线模型）',
    presetUpdateFallback: '供应商预设更新失败，已回退内置预设',
    presetUpdateFallbackWithReason: '供应商预设更新失败，已回退内置预设',
    providerCustom: '自定义（不覆盖）',
    selectModel: '选择模型预设',
    savedLlm: '已保存当前页（LLM）。',
    savedRules: '已保存本地规则配置。',
    loaded: '已加载。',
    testing: '正在测试连接...',
    connectionOk: '连接成功',
    loadFailed: '加载失败',
    saveFailed: '保存失败',
    testFailed: '测试失败',
    savePopupOk: '保存成功',
    savePopupFail: '保存失败',
    exportOk: '导出成功。',
    exportFail: '导出失败',
    importOk: '导入成功。',
    importFail: '导入失败'
  },
  en: {
    presetsUpdated: 'Provider presets updated.',
    presetsUpdatedWithRemote: 'Provider presets updated (with online models).',
    presetUpdateFallback: 'Preset refresh failed. Fallback to built-in presets.',
    presetUpdateFallbackWithReason: 'Preset refresh failed. Fallback to built-in presets.',
    providerCustom: 'Custom (keep manual inputs)',
    selectModel: 'Select model preset',
    savedLlm: 'Saved this page (LLM).',
    savedRules: 'Saved local-rule settings.',
    loaded: 'Loaded.',
    testing: 'Testing connection...',
    connectionOk: 'Connection OK',
    loadFailed: 'Load failed',
    saveFailed: 'Save failed',
    testFailed: 'Test failed',
    savePopupOk: 'Saved',
    savePopupFail: 'Save failed',
    exportOk: 'Export succeeded.',
    exportFail: 'Export failed',
    importOk: 'Import succeeded.',
    importFail: 'Import failed'
  }
};

function t(key) {
  const lang = currentLang();
  return (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key;
}

const FIELD_HELP_TEXT_ZH = Object.freeze({
  llmProvider: '选择常见模型供应商后，会自动填充匹配的 Base URL 与模型。',
  llmModelPreset: '模型预设会随供应商变化，选择后将自动填充模型名。',
  baseUrl: 'LLM 服务入口地址，通常以 /v1 结尾。',
  model: '用于识别邮件待办的模型名称。',
  apiKey: '用于调用云端 LLM 的密钥；本地模型（如 Ollama）可留空。',
  useTemperature: '勾选后才会向 LLM 发送温度参数。',
  temperature: '越低越稳定，越高越发散。',
  useMaxTokens: '勾选后才会向 LLM 发送最大令牌参数。',
  maxTokens: '限制单次输出长度，过小可能截断结果。',
  useTopP: '勾选后才会向 LLM 发送 Top P 参数。',
  topP: '采样范围，通常与温度二选一调节即可。',
  llmPromptTemplate: '自定义识别提示词，建议保留 JSON 输出约束。',
  llmGroupsInput: '回车新增分组；LLM 会尽量把结果归到这些分组。',
  llmBodyMaxChars: '单封邮件正文最大上传字符数，超出会截断。',
  llmBatchSize: '一次识别处理的邮件数量上限。',
  llmRetryCount: '请求失败时的自动重试次数。',
  llmBatchDelayMs: '批次之间等待时间，避免请求过快。',
  timeKeywordsInput: '用于从文本中提取时间信息的关键词（匹配时忽略大小写）。',
  locationKeywordsInput: '用于提取地点信息的关键词，如 Venue/Location。',
  groupAcademicInput: '命中后更倾向归入学术类分组。',
  groupCourseInput: '命中后更倾向归入课程相关分组。',
  groupActivityInput: '命中后更倾向归入活动类分组。',
  groupImportantInput: '命中后更倾向判定为“可能重要的事”。',
  groupOtherInput: '兜底关键词，未匹配到其他分组时参考。',
  debugMode: '开启后在侧栏显示当前邮件上下文，便于排查。',
  appearanceMode: '跟随 Thunderbird 或切换到预设/自定义主题。',
  appearancePreset: '选择预设配色后可再按需微调。',
  appearanceTextColor: '整体正文文字颜色。',
  appearanceBaseFontSize: '全局基础字号。',
  appearanceTitleBold: '控制标题是否加粗。',
  appearanceEventGap: '不同事件卡片之间的间距。',
  appearanceGroupGap: '分组与分组之间的间距。',
  appearanceModuleBg: '页面与模块整体背景色。',
  appearanceButtonBg: '主要按钮背景色。',
  appearanceButtonText: '主要按钮文字色。',
  appearanceGroupTitleColor: '分组标题颜色。',
  appearanceGroupTitleSize: '分组标题字号。',
  appearanceItemTitleColor: '事件标题颜色。',
  appearanceItemTitleSize: '事件标题字号。',
  appearanceMetaColor: '时间、地点等辅助信息颜色。',
  appearanceMetaSize: '时间、地点等辅助信息字号。',
  appearanceStatusColor: '状态栏文字颜色。',
  appearanceStatusSize: '状态栏文字字号。',
  appearanceCardBg: '事件卡片背景色。',
  appearanceCardBorderColor: '事件卡片边框颜色。',
  appearanceCardRadius: '事件卡片圆角大小。',
  appearanceCardShadow: '事件卡片阴影强度。',
  appearanceCardMinHeight: '事件卡片最小高度。',
  appearanceCardPaddingY: '事件卡片上下内边距。',
  appearanceCardPaddingX: '事件卡片左右内边距。',
  appearanceCardGap: '同一事件卡片内部各行/元素的间距。',
  appearanceActionGap: '事件操作按钮之间的间距。',
  appearanceGroupAccentImportant: '“可能重要的事”主色，用于卡片边框和确认按钮。',
  appearanceGroupBgImportant: '“可能重要的事”卡片背景色。留空则继承统一卡片背景。',
  appearanceGroupAccentAcademic: '“学术类”主色，用于卡片边框和确认按钮。',
  appearanceGroupBgAcademic: '“学术类”卡片背景色。留空则继承统一卡片背景。',
  appearanceGroupAccentCourse: '“课程类”主色，用于卡片边框和确认按钮。',
  appearanceGroupBgCourse: '“课程类”卡片背景色。留空则继承统一卡片背景。',
  appearanceGroupAccentActivity: '“活动类”主色，用于卡片边框和确认按钮。',
  appearanceGroupBgActivity: '“活动类”卡片背景色。留空则继承统一卡片背景。',
  appearanceGroupAccentOther: '“其他类”主色，用于卡片边框和确认按钮。',
  appearanceGroupBgOther: '“其他类”卡片背景色。留空则继承统一卡片背景。',
  appearanceGroupAccentUnrecognized: '“未识别到待办”主色，用于卡片边框和确认按钮。',
  appearanceGroupBgUnrecognized: '“未识别到待办”卡片背景色。留空则继承统一卡片背景。'
});

function appearanceApi() {
  return globalThis.Email2CalendarAppearance;
}

function attachFieldHelpText() {
  for (const [id, text] of Object.entries(FIELD_HELP_TEXT_ZH)) {
    const input = document.getElementById(id);
    if (!input) continue;
    const row = input.closest('.row');
    if (!row) continue;
    if (row.querySelector(`.help-text[data-help-for="${id}"]`)) continue;
    const note = document.createElement('small');
    note.className = 'help-text';
    note.dataset.helpFor = id;
    note.textContent = text;
    row.appendChild(note);
  }
}

function setStatus(text) {
  statusBox.textContent = text;
}

function setAppearanceStatus(text) {
  appearanceStatus.textContent = text;
}

function showSavePopup(success, detail) {
  const title = success ? t('savePopupOk') : t('savePopupFail');
  const lines = [title];
  const extra = String(detail || '').trim();
  if (extra) lines.push(extra);
  window.alert(lines.join('\n'));
}

function showIoPopup(success, detail) {
  const title = success ? t('savePopupOk') : t('savePopupFail');
  const lines = [title];
  const extra = String(detail || '').trim();
  if (extra) lines.push(extra);
  window.alert(lines.join('\n'));
}

function normalizeKeyword(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function addKeyword(targetArray, keyword) {
  const normalized = normalizeKeyword(keyword);
  if (!normalized) return;
  const exists = targetArray.some((k) => String(k).toLowerCase() === normalized.toLowerCase());
  if (exists) return;
  targetArray.push(normalized);
}

function removeKeyword(targetArray, index) {
  targetArray.splice(index, 1);
}

function renderChipList(container, values, onRemove) {
  container.textContent = '';
  values.forEach((value, index) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.appendChild(document.createTextNode(value));
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'x';
    del.onclick = () => {
      onRemove(index);
    };
    chip.appendChild(del);
    container.appendChild(chip);
  });
}

function renderLocalRules() {
  renderChipList(timeKeywordsChips, state.localRules.timeKeywords, (idx) => {
    removeKeyword(state.localRules.timeKeywords, idx);
    markPageDirty('rules');
    renderLocalRules();
  });
  renderChipList(locationKeywordsChips, state.localRules.locationKeywords, (idx) => {
    removeKeyword(state.localRules.locationKeywords, idx);
    markPageDirty('rules');
    renderLocalRules();
  });
  renderDynamicGroupKeywordRows();
}

function createGroupId(label) {
  const slug = String(label || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'group';
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`;
}

function ensureGroupDefinitions(source) {
  const src = Array.isArray(source) ? source : [];
  const dedup = new Set();
  const list = [];
  for (const raw of src) {
    const label = normalizeKeyword(raw && typeof raw === 'object' ? raw.label : raw);
    if (!label) continue;
    const key = label.toLowerCase();
    if (dedup.has(key)) continue;
    dedup.add(key);
    list.push({
      id: raw && typeof raw === 'object' && raw.id ? String(raw.id) : createGroupId(label),
      label
    });
  }
  return list;
}

function markPageDirty(page) {
  if (page) state.dirtyPages.add(page);
}

function markPageClean(page) {
  if (page) state.dirtyPages.delete(page);
}

function labelToKnownAccent(label) {
  const v = String(label || '').toLowerCase();
  if (/(可能重要|important)/.test(v)) return '#d97706';
  if (/(学术|academic)/.test(v)) return '#2563eb';
  if (/(课程|course)/.test(v)) return '#0891b2';
  if (/(课外|活动|activity|extracurricular)/.test(v)) return '#16a34a';
  if (/(未识别|no todo|unrecognized)/.test(v)) return '#7c3aed';
  if (/(其他|other)/.test(v)) return '#6b7280';
  return '';
}

function hashString(value) {
  const text = String(value || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function nextUniqueAccent(label, used) {
  const known = labelToKnownAccent(label);
  if (known && !used.has(known)) return known;
  for (const color of GROUP_ACCENT_PALETTE) {
    if (!used.has(color)) return color;
  }
  const seed = hashString(label);
  for (let step = 0; step < 24; step += 1) {
    const h = (seed + step * 17) % 360;
    const s = 0.62 + ((seed >> (step % 5)) % 12) / 100;
    const l = 0.42 + ((seed >> (step % 7)) % 10) / 100;
    const color = hslToHex(h, Math.min(0.76, s), Math.min(0.58, l));
    if (!used.has(color)) return color;
  }
  return '#6b7280';
}

function defaultGroupStyle(def, usedAccents) {
  const accent = nextUniqueAccent(def && def.label, usedAccents);
  return { accent, bg: '' };
}

function syncGroupDerivedViews() {
  const nextKeywords = {};
  const nextStyles = {};
  const usedAccents = new Set();
  for (const def of state.groupDefinitions) {
    const oldById = state.localRules.groupKeywords[def.id];
    const oldByLabel = state.localRules.groupKeywords[def.label];
    nextKeywords[def.id] = Array.isArray(oldById) ? [...oldById] : (Array.isArray(oldByLabel) ? [...oldByLabel] : []);

    const oldStyleById = state.appearanceGroupStyles[def.id];
    const oldStyleByLabel = state.appearanceGroupStyles[def.label];
    const oldStyle = oldStyleById || oldStyleByLabel || null;
    const style = oldStyle
      ? { accent: String(oldStyle.accent || ''), bg: String(oldStyle.bg || '').trim() }
      : defaultGroupStyle(def, usedAccents);
    const normalizedAccent = String(style.accent || '').trim().toLowerCase();
    const accent = (!normalizedAccent || usedAccents.has(normalizedAccent))
      ? nextUniqueAccent(def.label, usedAccents)
      : normalizedAccent;
    usedAccents.add(accent);
    nextStyles[def.id] = { accent, bg: style.bg };
  }
  state.localRules.groupKeywords = nextKeywords;
  state.appearanceGroupStyles = nextStyles;
  renderDynamicGroupKeywordRows();
  renderDynamicAppearanceGroupRows();
  renderAppearancePreview();
}

function renderAppearancePreview() {
  if (!appearancePreviewRoot) return;
  appearancePreviewRoot.textContent = '';
  const defs = Array.isArray(state.groupDefinitions) ? state.groupDefinitions.slice(0, 3) : [];
  const groups = defs.length > 0 ? defs : [{ id: 'preview-default', label: currentLang() === 'zh' ? '示例分组' : 'Sample Group' }];

  const toolbar = document.createElement('div');
  toolbar.className = 'preview-toolbar';
  const primary = document.createElement('button');
  primary.type = 'button';
  primary.textContent = currentLang() === 'zh' ? '扫描未读' : 'Scan Unread';
  const secondary = document.createElement('button');
  secondary.type = 'button';
  secondary.className = 'minor-btn';
  secondary.textContent = currentLang() === 'zh' ? '导入日历' : 'Import Calendar';
  toolbar.appendChild(primary);
  toolbar.appendChild(secondary);
  appearancePreviewRoot.appendChild(toolbar);

  groups.forEach((def) => {
    const style = state.appearanceGroupStyles[def.id] || { accent: '#6b7280', bg: '' };
    const group = document.createElement('div');
    group.className = 'preview-group';
    const head = document.createElement('div');
    head.className = 'preview-group-head';
    const title = document.createElement('span');
    title.textContent = `${def.label} 2`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'minor-btn';
    toggle.textContent = currentLang() === 'zh' ? '展开' : 'Expand';
    head.appendChild(title);
    head.appendChild(toggle);
    group.appendChild(head);

    const items = document.createElement('div');
    items.className = 'preview-items';
    const makeItem = (isCollapsed) => {
      const item = document.createElement('div');
      item.className = `preview-item${isCollapsed ? ' is-collapsed' : ''}`;
      item.style.borderColor = style.accent || '#6b7280';
      if (style.bg) item.style.background = style.bg;
      const itemTitle = document.createElement('div');
      itemTitle.className = 'preview-item-title';
      itemTitle.textContent = currentLang() === 'zh' ? '示例事件标题' : 'Sample Event';
      const time = document.createElement('div');
      time.className = 'preview-item-meta';
      time.textContent = currentLang() === 'zh' ? '时间：2026-03-20 18:30-20:00 (Asia/Hong_Kong)' : 'Time: 2026-03-20 18:30-20:00 (Asia/Hong_Kong)';
      const location = document.createElement('div');
      location.className = 'preview-item-meta';
      location.textContent = currentLang() === 'zh' ? '地点：Main Building MB237' : 'Location: Main Building MB237';
      const actions = document.createElement('div');
      actions.className = 'preview-item-actions';
      const accept = document.createElement('button');
      accept.type = 'button';
      accept.textContent = currentLang() === 'zh' ? '确认' : 'Accept';
      accept.style.background = style.accent || '#6b7280';
      accept.style.borderColor = style.accent || '#6b7280';
      accept.style.color = '#fff';
      const reject = document.createElement('button');
      reject.type = 'button';
      reject.className = 'minor-btn';
      reject.textContent = currentLang() === 'zh' ? '拒绝' : 'Reject';
      actions.appendChild(accept);
      actions.appendChild(reject);
      item.appendChild(itemTitle);
      item.appendChild(time);
      item.appendChild(location);
      item.appendChild(actions);
      item.addEventListener('click', () => {
        item.classList.toggle('is-collapsed');
      });
      return item;
    };
    items.appendChild(makeItem(true));
    items.appendChild(makeItem(true));
    group.appendChild(items);

    toggle.addEventListener('click', () => {
      const collapsed = toggle.dataset.collapsed !== 'false';
      toggle.dataset.collapsed = collapsed ? 'false' : 'true';
      toggle.textContent = (currentLang() === 'zh')
        ? (collapsed ? '收起' : '展开')
        : (collapsed ? 'Collapse' : 'Expand');
      items.querySelectorAll('.preview-item').forEach((item) => {
        item.classList.toggle('is-collapsed', !collapsed);
      });
    });
    appearancePreviewRoot.appendChild(group);
  });

  const footer = document.createElement('div');
  footer.className = 'preview-footer';
  footer.textContent = currentLang() === 'zh' ? '状态：示例预览，单击事件可展开/收起。' : 'Status: Preview mode, click item to expand/collapse.';
  appearancePreviewRoot.appendChild(footer);
}

function renderDynamicGroupKeywordRows() {
  if (!dynamicGroupKeywordRows) return;
  dynamicGroupKeywordRows.textContent = '';
  for (const def of state.groupDefinitions) {
    const row = document.createElement('div');
    row.className = 'row';
    const label = document.createElement('label');
    label.textContent = `${def.label} 关键词`;
    row.appendChild(label);
    const chips = document.createElement('div');
    chips.className = 'chips';
    const values = state.localRules.groupKeywords[def.id] || [];
    renderChipList(chips, values, (idx) => {
      values.splice(idx, 1);
      markPageDirty('rules');
      renderDynamicGroupKeywordRows();
    });
    row.appendChild(chips);
    const inputWrap = document.createElement('div');
    inputWrap.className = 'chip-input-row';
    const input = document.createElement('input');
    input.placeholder = '输入关键词后回车';
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const next = state.localRules.groupKeywords[def.id] || [];
      addKeyword(next, input.value);
      state.localRules.groupKeywords[def.id] = next;
      input.value = '';
      markPageDirty('rules');
      renderDynamicGroupKeywordRows();
    });
    inputWrap.appendChild(input);
    row.appendChild(inputWrap);
    const help = document.createElement('small');
    help.className = 'help-text';
    help.textContent = '匹配时忽略大小写；由 LLM 自动回写的分类关键词也会进入这里并自动去重。';
    row.appendChild(help);
    dynamicGroupKeywordRows.appendChild(row);
  }
}

function renderDynamicAppearanceGroupRows() {
  if (!dynamicAppearanceGroupRows) return;
  dynamicAppearanceGroupRows.textContent = '';
  for (const def of state.groupDefinitions) {
    const style = state.appearanceGroupStyles[def.id] || { accent: '#6b7280', bg: '' };

    const accentRow = document.createElement('div');
    accentRow.className = 'row';
    const accentLabel = document.createElement('label');
    accentLabel.textContent = `${def.label} - 主色`;
    const accentInput = document.createElement('input');
    accentInput.type = 'color';
    accentInput.value = style.accent || '#6b7280';
    accentInput.addEventListener('input', () => {
      state.appearanceGroupStyles[def.id] = {
        accent: accentInput.value,
        bg: String((state.appearanceGroupStyles[def.id] && state.appearanceGroupStyles[def.id].bg) || '').trim()
      };
      markPageDirty('appearance');
      onAppearanceChanged();
    });
    accentRow.appendChild(accentLabel);
    accentRow.appendChild(accentInput);
    dynamicAppearanceGroupRows.appendChild(accentRow);

    const bgRow = document.createElement('div');
    bgRow.className = 'row';
    const bgLabel = document.createElement('label');
    bgLabel.textContent = `${def.label} - 背景色`;
    const bgWrap = document.createElement('div');
    bgWrap.className = 'toggle-row';
    const bgEnabled = document.createElement('input');
    bgEnabled.type = 'checkbox';
    bgEnabled.checked = !!String(style.bg || '').trim();
    const bgInput = document.createElement('input');
    bgInput.type = 'color';
    bgInput.value = String(style.bg || appearanceCardBg.value || '#ffffff');
    bgInput.disabled = !bgEnabled.checked;
    const saveBg = () => {
      state.appearanceGroupStyles[def.id] = {
        accent: String((state.appearanceGroupStyles[def.id] && state.appearanceGroupStyles[def.id].accent) || '#6b7280'),
        bg: bgEnabled.checked ? String(bgInput.value || '').trim() : ''
      };
      markPageDirty('appearance');
      onAppearanceChanged();
    };
    bgEnabled.addEventListener('change', () => {
      bgInput.disabled = !bgEnabled.checked;
      saveBg();
    });
    bgInput.addEventListener('input', saveBg);
    bgRow.appendChild(bgLabel);
    bgWrap.appendChild(bgEnabled);
    bgWrap.appendChild(bgInput);
    bgRow.appendChild(bgWrap);
    const bgHelp = document.createElement('small');
    bgHelp.className = 'help-text';
    bgHelp.textContent = '勾选后启用本分组独立背景色；不勾选时继承统一卡片背景色。';
    bgRow.appendChild(bgHelp);
    dynamicAppearanceGroupRows.appendChild(bgRow);
  }
}

function renderLlmGroups() {
  llmGroupsChips.textContent = '';
  state.groupDefinitions.forEach((def, idx) => {
    const chip = document.createElement('span');
    chip.className = 'chip chip-draggable';
    chip.draggable = true;
    chip.dataset.index = String(idx);

    const handle = document.createElement('span');
    handle.className = 'chip-handle';
    handle.textContent = '↕';
    chip.appendChild(handle);

    const label = document.createElement('span');
    label.textContent = def.label;
    chip.appendChild(label);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = currentLang() === 'zh' ? '编辑' : 'Edit';
    editBtn.onclick = (event) => {
      event.stopPropagation();
      const current = state.groupDefinitions[idx];
      if (!current) return;
      const promptText = currentLang() === 'zh' ? '修改分组名称' : 'Rename group';
      const next = normalizeKeyword(window.prompt(promptText, current.label));
      if (!next) return;
      current.label = next;
      state.groupDefinitions = ensureGroupDefinitions(state.groupDefinitions);
      syncGroupDerivedViews();
      markPageDirty('llm');
      renderLlmGroups();
    };
    chip.appendChild(editBtn);

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'x';
    del.onclick = (event) => {
      event.stopPropagation();
      state.groupDefinitions.splice(idx, 1);
      syncGroupDerivedViews();
      markPageDirty('llm');
      renderLlmGroups();
    };
    chip.appendChild(del);

    chip.addEventListener('dragstart', () => {
      state.llmGroupsDragIndex = idx;
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => {
      state.llmGroupsDragIndex = -1;
      chip.classList.remove('dragging');
    });
    chip.addEventListener('dragover', (event) => {
      event.preventDefault();
    });
    chip.addEventListener('drop', (event) => {
      event.preventDefault();
      const from = state.llmGroupsDragIndex;
      const to = Number(chip.dataset.index);
      if (!Number.isInteger(from) || from < 0 || !Number.isInteger(to) || to < 0 || from === to) return;
      const [moved] = state.groupDefinitions.splice(from, 1);
      state.groupDefinitions.splice(to, 0, moved);
      syncGroupDerivedViews();
      markPageDirty('llm');
      renderLlmGroups();
    });

    llmGroupsChips.appendChild(chip);
  });
}

function addLlmGroupByInput(raw) {
  const label = normalizeKeyword(raw);
  if (!label) return;
  if (state.groupDefinitions.some((it) => it.label.toLowerCase() === label.toLowerCase())) return;
  state.groupDefinitions.push({ id: createGroupId(label), label });
  syncGroupDerivedViews();
  markPageDirty('llm');
  renderLlmGroups();
}

function switchSettingsPage(page) {
  const next = String(page || '').trim();
  if (!next || next === state.activePage) return;
  if (state.dirtyPages.has(state.activePage)) {
    window.alert('当前页有未保存修改，请先保存');
    return;
  }
  state.activePage = next;
  const pages = settingsPagesRoot ? settingsPagesRoot.querySelectorAll('.settings-page[data-page]') : [];
  pages.forEach((node) => {
    node.hidden = node.getAttribute('data-page') !== next;
  });
  const navButtons = settingsNav ? settingsNav.querySelectorAll('button[data-page]') : [];
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === next);
  });
}

function bindChipInput(input, getTargetArray, rerender) {
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addKeyword(getTargetArray(), input.value);
    input.value = '';
    rerender();
  });
}

function numberValue(input, fallback) {
  const n = Number(input.value);
  return Number.isFinite(n) ? n : fallback;
}

function updateAdvancedInputState() {
  temperature.disabled = !useTemperature.checked;
  maxTokens.disabled = !useMaxTokens.checked;
  topP.disabled = !useTopP.checked;
}

function updateAppearanceInputState() {
  const mode = appearanceMode.value;
  appearancePreset.disabled = mode !== 'preset';
  // Keep color pickers interactive in all modes so users can preconfigure colors.
  // In follow_tb mode these values are saved, and applied after switching mode.
  appearanceColorInputs.forEach((node) => {
    node.disabled = false;
  });
  appearanceGroupBgInputs.forEach((node) => {
    node.disabled = false;
  });
}

function applyNumberInputRangeHints() {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    const min = input.getAttribute('min');
    const max = input.getAttribute('max');
    const step = input.getAttribute('step');
    const hasMin = min !== null && min !== '';
    const hasMax = max !== null && max !== '';
    if (!hasMin && !hasMax) return;

    let text = '';
    if (hasMin && hasMax) {
      text = `范围：${min} ~ ${max}`;
    } else if (hasMin) {
      text = `范围：>= ${min}`;
    } else {
      text = `范围：<= ${max}`;
    }
    if (step && step !== 'any') text += `，步长：${step}`;
    input.title = text;

    const row = input.closest('.row');
    if (!row || row.querySelector('.range-hint')) return;
    const hint = document.createElement('small');
    hint.className = 'help-text range-hint';
    hint.textContent = text;
    row.appendChild(hint);
  });
}

function toPrettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (_) {
    return String(value || '');
  }
}

function formatConnectionFailure(result) {
  const error = result && result.error ? result.error : {};
  const attempts = Array.isArray(result && result.attempts) ? result.attempts : [];
  const lines = [
    'Connection failed.',
    `message: ${error.message || 'unknown'}`,
    `code: ${error.code || 'unknown'}`,
    `status: ${error.status != null ? error.status : 'n/a'} ${error.statusText || ''}`.trim(),
    `endpoint: ${error.endpoint || 'n/a'}`,
    `time: ${error.timestamp || new Date().toISOString()}`
  ];

  if (error.responseBody) lines.push('', 'response body:', error.responseBody);
  if (attempts.length > 0) lines.push('', 'attempt logs:', toPrettyJson(attempts));
  if (error.stack) lines.push('', 'stack:', error.stack);
  return lines.join('\n');
}

function collectAppearancePayload() {
  const api = appearanceApi();
  if (!api) throw new Error('Appearance module missing');
  const candidate = {
    mode: appearanceMode.value,
    presetId: appearancePreset.value,
    basic: {
      textColor: appearanceTextColor.value,
      baseFontSize: numberValue(appearanceBaseFontSize, 14),
      titleBold: !!appearanceTitleBold.checked,
      eventGap: numberValue(appearanceEventGap, 8),
      groupGap: numberValue(appearanceGroupGap, 10),
      moduleBg: appearanceModuleBg.value,
      buttonBg: appearanceButtonBg.value,
      buttonText: appearanceButtonText.value
    },
    advanced: {
      groupTitleColor: appearanceGroupTitleColor.value,
      groupTitleSize: numberValue(appearanceGroupTitleSize, 14),
      itemTitleColor: appearanceItemTitleColor.value,
      itemTitleSize: numberValue(appearanceItemTitleSize, 13),
      metaColor: appearanceMetaColor.value,
      metaSize: numberValue(appearanceMetaSize, 12),
      statusColor: appearanceStatusColor.value,
      statusSize: numberValue(appearanceStatusSize, 11),
      cardBg: appearanceCardBg.value,
      cardBorderColor: appearanceCardBorderColor.value,
      cardRadius: numberValue(appearanceCardRadius, 10),
      cardShadow: numberValue(appearanceCardShadow, 0),
      cardMinHeight: numberValue(appearanceCardMinHeight, 0),
      cardPaddingY: numberValue(appearanceCardPaddingY, 8),
      cardPaddingX: numberValue(appearanceCardPaddingX, 8),
      cardGap: numberValue(appearanceCardGap, 8),
      actionGap: numberValue(appearanceActionGap, 8),
      groupStyles: buildAppearanceGroupStylesPayload()
    }
  };
  return api.normalizeAppearance(candidate);
}

function slugGroupLabel(value) {
  const slug = String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  return slug || 'other';
}

function groupStyleKeyForLabel(label) {
  const v = String(label || '').toLowerCase();
  if (/(可能重要|important)/.test(v)) return 'important';
  if (/(学术|academic)/.test(v)) return 'academic';
  if (/(课程|course)/.test(v)) return 'course';
  if (/(课外|活动|activity|extracurricular)/.test(v)) return 'activity';
  if (/(未识别|no todo|unrecognized)/.test(v)) return 'unrecognized';
  if (/(其他|other)/.test(v)) return 'other';
  return `llm-${slugGroupLabel(label)}`;
}

function buildAppearanceGroupStylesPayload() {
  // Legacy shape hint kept for compatibility checks: groupStyles: { important: { ... } }
  const out = {};
  const defs = Array.isArray(state.groupDefinitions) ? state.groupDefinitions : [];
  for (const def of defs) {
    const style = state.appearanceGroupStyles[def.id] || {};
    out[groupStyleKeyForLabel(def.label)] = {
      accent: String(style.accent || '#6b7280'),
      bg: String(style.bg || '').trim()
    };
  }
  return out;
}

function applyAppearanceToDocument(appearance) {
  const api = appearanceApi();
  if (!api) return;
  const vars = api.toCssVariables(appearance);
  api.applyCssVariables(document.documentElement, vars);
}

function applyAppearanceForm(appearance) {
  const api = appearanceApi();
  if (!api) return;
  const normalized = api.normalizeAppearance(appearance).appearance;
  state.appearance = normalized;
  appearanceMode.value = normalized.mode;
  appearancePreset.value = normalized.presetId;

  appearanceTextColor.value = normalized.basic.textColor;
  appearanceBaseFontSize.value = String(normalized.basic.baseFontSize);
  appearanceTitleBold.checked = !!normalized.basic.titleBold;
  appearanceEventGap.value = String(normalized.basic.eventGap);
  appearanceGroupGap.value = String(normalized.basic.groupGap);
  appearanceModuleBg.value = normalized.basic.moduleBg;
  appearanceButtonBg.value = normalized.basic.buttonBg;
  appearanceButtonText.value = normalized.basic.buttonText;

  appearanceGroupTitleColor.value = normalized.advanced.groupTitleColor;
  appearanceGroupTitleSize.value = String(normalized.advanced.groupTitleSize);
  appearanceItemTitleColor.value = normalized.advanced.itemTitleColor;
  appearanceItemTitleSize.value = String(normalized.advanced.itemTitleSize);
  appearanceMetaColor.value = normalized.advanced.metaColor;
  appearanceMetaSize.value = String(normalized.advanced.metaSize);
  appearanceStatusColor.value = normalized.advanced.statusColor;
  appearanceStatusSize.value = String(normalized.advanced.statusSize);
  appearanceCardBg.value = normalized.advanced.cardBg;
  appearanceCardBorderColor.value = normalized.advanced.cardBorderColor;
  appearanceCardRadius.value = String(normalized.advanced.cardRadius);
  appearanceCardShadow.value = String(normalized.advanced.cardShadow);
  appearanceCardMinHeight.value = String(normalized.advanced.cardMinHeight);
  appearanceCardPaddingY.value = String(normalized.advanced.cardPaddingY);
  appearanceCardPaddingX.value = String(normalized.advanced.cardPaddingX);
  appearanceCardGap.value = String(normalized.advanced.cardGap);
  appearanceActionGap.value = String(normalized.advanced.actionGap || 8);
  const groupStyles = (normalized.advanced && normalized.advanced.groupStyles) || {};
  appearanceGroupAccentImportant.value = (groupStyles.important && groupStyles.important.accent) || '#d97706';
  appearanceGroupBgImportant.value = (groupStyles.important && groupStyles.important.bg) || '';
  appearanceGroupAccentAcademic.value = (groupStyles.academic && groupStyles.academic.accent) || '#2563eb';
  appearanceGroupBgAcademic.value = (groupStyles.academic && groupStyles.academic.bg) || '';
  appearanceGroupAccentCourse.value = (groupStyles.course && groupStyles.course.accent) || '#0891b2';
  appearanceGroupBgCourse.value = (groupStyles.course && groupStyles.course.bg) || '';
  appearanceGroupAccentActivity.value = (groupStyles.activity && groupStyles.activity.accent) || '#16a34a';
  appearanceGroupBgActivity.value = (groupStyles.activity && groupStyles.activity.bg) || '';
  appearanceGroupAccentOther.value = (groupStyles.other && groupStyles.other.accent) || '#6b7280';
  appearanceGroupBgOther.value = (groupStyles.other && groupStyles.other.bg) || '';
  appearanceGroupAccentUnrecognized.value = (groupStyles.unrecognized && groupStyles.unrecognized.accent) || '#7c3aed';
  appearanceGroupBgUnrecognized.value = (groupStyles.unrecognized && groupStyles.unrecognized.bg) || '';

  state.appearanceGroupStyles = state.appearanceGroupStyles || {};
  for (const def of state.groupDefinitions) {
    const key = groupStyleKeyForLabel(def.label);
    const src = groupStyles[key] || {};
    state.appearanceGroupStyles[def.id] = {
      accent: String(src.accent || '#6b7280'),
      bg: String(src.bg || '').trim()
    };
  }
  renderDynamicAppearanceGroupRows();

  updateAppearanceInputState();
  applyAppearanceToDocument(normalized);
  renderAppearancePreview();
}

function collectAllSettingsPayload() {
  return {
    ...state.settings,
    llmBaseUrl: baseUrl.value,
    llmModel: model.value,
    llmApiKey: apiKey.value,
    useTemperature: useTemperature.checked,
    llmTemperature: numberValue(temperature, 0.1),
    useMaxTokens: useMaxTokens.checked,
    llmMaxTokens: numberValue(maxTokens, 1024),
    useTopP: useTopP.checked,
    llmTopP: numberValue(topP, 1),
    llmPromptTemplate: String(llmPromptTemplate.value || '').trim(),
    groupDefinitions: [...state.groupDefinitions],
    llmGroupConstraints: state.groupDefinitions.map((g) => g.label),
    llmBodyMaxChars: numberValue(llmBodyMaxChars, DEFAULT_RUNTIME.llmBodyMaxChars),
    llmBatchSize: numberValue(llmBatchSize, DEFAULT_RUNTIME.llmBatchSize),
    llmRetryCount: numberValue(llmRetryCount, DEFAULT_RUNTIME.llmRetryCount),
    llmBatchDelayMs: numberValue(llmBatchDelayMs, DEFAULT_RUNTIME.llmBatchDelayMs),
    debugMode: !!debugMode.checked,
    localRules: state.localRules,
    appearance: collectAppearancePayload().appearance
  };
}

function collectLLMSettingsPayload() {
  return {
    ...state.settings,
    llmBaseUrl: baseUrl.value,
    llmModel: model.value,
    llmApiKey: apiKey.value,
    useTemperature: useTemperature.checked,
    llmTemperature: numberValue(temperature, 0.1),
    useMaxTokens: useMaxTokens.checked,
    llmMaxTokens: numberValue(maxTokens, 1024),
    useTopP: useTopP.checked,
    llmTopP: numberValue(topP, 1)
  };
}

function collectPromptSettingsPayload() {
  return {
    ...state.settings,
    llmPromptTemplate: String(llmPromptTemplate.value || '').trim()
  };
}

function collectGroupsPayload() {
  return {
    ...state.settings,
    groupDefinitions: [...state.groupDefinitions],
    llmGroupConstraints: state.groupDefinitions.map((g) => g.label)
  };
}

function collectProcessingPayload() {
  return {
    ...state.settings,
    llmBodyMaxChars: numberValue(llmBodyMaxChars, DEFAULT_RUNTIME.llmBodyMaxChars),
    llmBatchSize: numberValue(llmBatchSize, DEFAULT_RUNTIME.llmBatchSize),
    llmRetryCount: numberValue(llmRetryCount, DEFAULT_RUNTIME.llmRetryCount),
    llmBatchDelayMs: numberValue(llmBatchDelayMs, DEFAULT_RUNTIME.llmBatchDelayMs)
  };
}

function collectRulesSettingsPayload() {
  return {
    ...state.settings,
    debugMode: !!debugMode.checked,
    localRules: state.localRules
  };
}

function applyLocalRules(localRules) {
  const groupKeywords = (localRules && localRules.groupKeywords && typeof localRules.groupKeywords === 'object')
    ? localRules.groupKeywords
    : {};
  state.localRules = {
    timeKeywords: Array.isArray(localRules && localRules.timeKeywords) ? [...localRules.timeKeywords] : [],
    locationKeywords: Array.isArray(localRules && localRules.locationKeywords) ? [...localRules.locationKeywords] : [],
    groupKeywords: Object.fromEntries(
      Object.entries(groupKeywords).map(([k, arr]) => [k, Array.isArray(arr) ? [...arr] : []])
    )
  };
  renderLocalRules();
}

function applyLoadedSettings(settings) {
  state.settings = { ...settings };
  baseUrl.value = settings.llmBaseUrl || '';
  model.value = settings.llmModel || '';
  apiKey.value = settings.llmApiKey || '';
  useTemperature.checked = !!settings.useTemperature;
  temperature.value = settings.llmTemperature != null ? String(settings.llmTemperature) : '0.1';
  useMaxTokens.checked = !!settings.useMaxTokens;
  maxTokens.value = settings.llmMaxTokens != null ? String(settings.llmMaxTokens) : '1024';
  useTopP.checked = !!settings.useTopP;
  topP.value = settings.llmTopP != null ? String(settings.llmTopP) : '1';
  llmPromptTemplate.value = settings.llmPromptTemplate || DEFAULT_PROMPT;
  state.groupDefinitions = ensureGroupDefinitions(
    Array.isArray(settings.groupDefinitions) && settings.groupDefinitions.length > 0
      ? settings.groupDefinitions
      : (Array.isArray(settings.llmGroupConstraints) ? settings.llmGroupConstraints : [])
  );
  renderLlmGroups();
  llmBodyMaxChars.value = String(settings.llmBodyMaxChars != null ? settings.llmBodyMaxChars : DEFAULT_RUNTIME.llmBodyMaxChars);
  llmBatchSize.value = String(settings.llmBatchSize != null ? settings.llmBatchSize : DEFAULT_RUNTIME.llmBatchSize);
  llmRetryCount.value = String(settings.llmRetryCount != null ? settings.llmRetryCount : DEFAULT_RUNTIME.llmRetryCount);
  llmBatchDelayMs.value = String(settings.llmBatchDelayMs != null ? settings.llmBatchDelayMs : DEFAULT_RUNTIME.llmBatchDelayMs);
  debugMode.checked = !!settings.debugMode;
  updateAdvancedInputState();
  applyLocalRules(settings.localRules || {});
  syncGroupDerivedViews();
  applyAppearanceForm(settings.appearance || (appearanceApi() && appearanceApi().DEFAULT_APPEARANCE));
  const detected = detectProviderFromInputs();
  renderProviderCatalog(detected.providerId, detected.model);
}

async function load() {
  try {
    state.providerCatalog = buildBuiltinProviderCatalog();
    const settings = await browser.runtime.sendMessage({ type: 'todo:get-settings' });
    applyLoadedSettings(settings || {});
    setStatus(t('loaded'));
    setAppearanceStatus('外观配置已加载。');
  } catch (error) {
    setStatus(`${t('loadFailed')}: ${error.message || error}`);
    setAppearanceStatus(`外观配置加载失败：${error.message || error}`);
  }
}

async function saveLLMSection() {
  try {
    const saved = await browser.runtime.sendMessage({
      type: 'todo:set-settings',
      settings: {
        ...collectLLMSettingsPayload(),
        ...collectPromptSettingsPayload(),
        ...collectGroupsPayload(),
        ...collectProcessingPayload()
      }
    });
    state.settings = { ...saved };
    setStatus(t('testing'));
    const result = await browser.runtime.sendMessage({
      type: 'todo:test-llm-connection',
      settings: collectLLMSettingsPayload()
    });
    if (result && result.ok) {
      await browser.runtime.sendMessage({
        type: 'todo:set-llm-connection-status',
        status: 'ok',
        error: '',
        testedAt: new Date().toISOString()
      });
      state.settings.llmConnectionStatus = 'ok';
      state.settings.llmConnectionError = '';
      setStatus(`${t('savedLlm')} ${t('connectionOk')} (${result.endpoint || 'endpoint'})`);
      showSavePopup(true, `${t('savedLlm')} ${t('connectionOk')}`);
    } else {
      const errorText = formatConnectionFailure(result || {});
      await browser.runtime.sendMessage({
        type: 'todo:set-llm-connection-status',
        status: 'failed',
        error: errorText,
        testedAt: new Date().toISOString()
      });
      state.settings.llmConnectionStatus = 'failed';
      state.settings.llmConnectionError = errorText;
      setStatus(errorText);
      showSavePopup(false, errorText);
    }
    markPageClean('llm');
  } catch (error) {
    const message = `${t('saveFailed')}: ${error.message || error}`;
    setStatus(message);
    showSavePopup(false, message);
  }
}

async function saveRulesSection() {
  try {
    const saved = await browser.runtime.sendMessage({
      type: 'todo:set-settings',
      settings: collectRulesSettingsPayload()
    });
    state.settings = { ...saved };
    setStatus(t('savedRules'));
    showSavePopup(true, t('savedRules'));
    markPageClean('rules');
  } catch (error) {
    const message = `${t('saveFailed')}: ${error.message || error}`;
    setStatus(message);
    showSavePopup(false, message);
  }
}

async function saveAppearanceSection() {
  try {
    const normalized = collectAppearancePayload();
    const saved = await browser.runtime.sendMessage({
      type: 'todo:set-settings',
      settings: {
        ...state.settings,
        appearance: normalized.appearance
      }
    });
    state.settings = { ...saved };
    applyAppearanceForm(saved.appearance || normalized.appearance);
    if (Array.isArray(normalized.warnings) && normalized.warnings.length > 0) {
      const message = `外观配置部分保存成功，以下字段已自动回退默认：${normalized.warnings.join(', ')}`;
      setAppearanceStatus(message);
      showSavePopup(true, message);
    } else {
      const message = `外观配置保存成功（${new Date().toLocaleString()}）`;
      setAppearanceStatus(message);
      showSavePopup(true, message);
    }
    markPageClean('appearance');
  } catch (error) {
    const message = `外观配置保存失败：${error.message || error}`;
    setAppearanceStatus(message);
    showSavePopup(false, message);
  }
}

async function saveGeneralSection() {
  try {
    const saved = await browser.runtime.sendMessage({
      type: 'todo:set-settings',
      settings: {
        ...state.settings,
        debugMode: !!debugMode.checked
      }
    });
    state.settings = { ...saved };
    if (generalStatus) generalStatus.textContent = '已保存。';
    showSavePopup(true, '已保存。');
    markPageClean('general');
  } catch (error) {
    const message = `保存失败：${error.message || error}`;
    if (generalStatus) generalStatus.textContent = message;
    showSavePopup(false, message);
  }
}

async function testConnection() {
  try {
    setStatus(t('testing'));
    const result = await browser.runtime.sendMessage({
      type: 'todo:test-llm-connection',
      settings: collectLLMSettingsPayload()
    });
    if (result && result.ok) {
      await browser.runtime.sendMessage({
        type: 'todo:set-llm-connection-status',
        status: 'ok',
        error: '',
        testedAt: new Date().toISOString()
      });
      state.settings.llmConnectionStatus = 'ok';
      state.settings.llmConnectionError = '';
      setStatus(`${t('connectionOk')} (${result.endpoint || 'endpoint'})`);
      return;
    }
    const errorText = formatConnectionFailure(result || {});
    await browser.runtime.sendMessage({
      type: 'todo:set-llm-connection-status',
      status: 'failed',
      error: errorText,
      testedAt: new Date().toISOString()
    });
    state.settings.llmConnectionStatus = 'failed';
    state.settings.llmConnectionError = errorText;
    setStatus(errorText);
  } catch (error) {
    const stack = error && error.stack ? `\n${error.stack}` : '';
    const message = `${t('testFailed')}: ${error && error.message ? error.message : error}${stack}`;
    setStatus(message);
    await browser.runtime.sendMessage({
      type: 'todo:set-llm-connection-status',
      status: 'failed',
      error: message,
      testedAt: new Date().toISOString()
    });
    state.settings.llmConnectionStatus = 'failed';
    state.settings.llmConnectionError = message;
  }
}

async function resetLocalRules() {
  try {
    const rules = await browser.runtime.sendMessage({ type: 'todo:reset-local-rules' });
    applyLocalRules(rules || {});
    syncGroupDerivedViews();
    markPageDirty('rules');
    setStatus('Local rules reset to defaults.');
  } catch (error) {
    setStatus(`Reset failed: ${error.message || error}`);
  }
}

function resetPromptToDefault() {
  llmPromptTemplate.value = DEFAULT_PROMPT;
  setStatus('Prompt reset to default.');
}

async function refreshProviderPresets() {
  const builtin = buildBuiltinProviderCatalog();
  const current = detectProviderFromInputs();
  let hydrated = false;
  try {
    const selected = builtin.find((p) => p.id === current.providerId);
    const key = String(apiKey.value || '').trim();
    const canHydrateWithoutKey = selected && (selected.id === 'local' || selected.id === 'ollama');
    if (selected && (key || canHydrateWithoutKey)) {
      const remoteModels = await fetchRemoteModelsForProvider(selected, key);
      if (remoteModels.length > 0) {
        selected.models = remoteModels;
        hydrated = true;
      }
    }
    state.providerCatalog = builtin;
    renderProviderCatalog(current.providerId, current.model);
    setStatus(hydrated ? t('presetsUpdatedWithRemote') : t('presetsUpdated'));
  } catch (_) {
    const reason = _ && _.message ? _.message : String(_ || 'unknown');
    state.providerCatalog = builtin;
    renderProviderCatalog(current.providerId, current.model);
    setStatus(`${t('presetUpdateFallbackWithReason')}: ${reason}`);
  }
}

function onProviderChanged() {
  const provider = getProviderById(llmProvider.value);
  if (!provider) return;
  renderModelPresetOptions(provider.id, provider.models && provider.models[0]);
  applyProviderToInputs(provider, llmModelPreset.value);
}

function onModelPresetChanged() {
  const provider = getProviderById(llmProvider.value);
  if (!provider) return;
  applyProviderToInputs(provider, llmModelPreset.value);
}

function onAppearanceChanged(event) {
  try {
    // If user edits concrete appearance fields while following Thunderbird theme,
    // switch to custom so edits are immediately visible in preview and panel.
    const target = event && event.target ? event.target : null;
    if (target && appearanceMode.value === 'follow_tb') {
      const noAutoSwitch = new Set(['appearanceMode', 'appearancePreset']);
      const targetId = String(target.id || '');
      if (targetId && !noAutoSwitch.has(targetId)) {
        appearanceMode.value = 'custom';
      }
    }
    const normalized = collectAppearancePayload();
    state.appearance = normalized.appearance;
    applyAppearanceToDocument(normalized.appearance);
    updateAppearanceInputState();
    renderAppearancePreview();
  } catch (error) {
    setAppearanceStatus(`外观预览失败：${error.message || error}`);
  }
}

function setAppearanceResetPendingStatus() {
  setAppearanceStatus('外观已恢复默认，待保存');
}

function getDefaultAppearance() {
  const api = appearanceApi();
  if (!api || !api.DEFAULT_APPEARANCE) {
    throw new Error('Appearance defaults missing');
  }
  return api.normalizeAppearance(api.DEFAULT_APPEARANCE).appearance;
}

function resetAppearanceModule(moduleKey) {
  const current = collectAppearancePayload().appearance;
  const defaults = getDefaultAppearance();
  const next = {
    ...current,
    basic: { ...current.basic },
    advanced: {
      ...current.advanced,
      groupStyles: {
        ...(current.advanced && current.advanced.groupStyles ? current.advanced.groupStyles : {})
      }
    }
  };

  if (moduleKey === 'top') {
    next.mode = defaults.mode;
    next.presetId = defaults.presetId;
    next.basic.textColor = defaults.basic.textColor;
    next.basic.baseFontSize = defaults.basic.baseFontSize;
    next.basic.titleBold = defaults.basic.titleBold;
    next.basic.moduleBg = defaults.basic.moduleBg;
    next.basic.buttonBg = defaults.basic.buttonBg;
    next.basic.buttonText = defaults.basic.buttonText;
  } else if (moduleKey === 'middle') {
    next.basic.eventGap = defaults.basic.eventGap;
    next.basic.groupGap = defaults.basic.groupGap;
    next.advanced.groupTitleColor = defaults.advanced.groupTitleColor;
    next.advanced.groupTitleSize = defaults.advanced.groupTitleSize;
    next.advanced.itemTitleColor = defaults.advanced.itemTitleColor;
    next.advanced.itemTitleSize = defaults.advanced.itemTitleSize;
    next.advanced.metaColor = defaults.advanced.metaColor;
    next.advanced.metaSize = defaults.advanced.metaSize;
    next.advanced.cardBg = defaults.advanced.cardBg;
    next.advanced.cardBorderColor = defaults.advanced.cardBorderColor;
    next.advanced.cardRadius = defaults.advanced.cardRadius;
    next.advanced.cardShadow = defaults.advanced.cardShadow;
    next.advanced.cardMinHeight = defaults.advanced.cardMinHeight;
    next.advanced.cardPaddingY = defaults.advanced.cardPaddingY;
    next.advanced.cardPaddingX = defaults.advanced.cardPaddingX;
    next.advanced.cardGap = defaults.advanced.cardGap;
    next.advanced.actionGap = defaults.advanced.actionGap;
    next.advanced.groupStyles = defaults.advanced.groupStyles;
  } else if (moduleKey === 'bottom') {
    next.advanced.statusColor = defaults.advanced.statusColor;
    next.advanced.statusSize = defaults.advanced.statusSize;
  } else {
    return;
  }

  applyAppearanceForm(next);
  setAppearanceResetPendingStatus();
}

function resetAppearanceAll() {
  const ok = window.confirm('确定要将外观配置全部恢复默认吗？此操作不会自动保存。');
  if (!ok) return;
  applyAppearanceForm(getDefaultAppearance());
  setAppearanceResetPendingStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyLocalizedUi() {
  const zh = currentLang() === 'zh';
  const pageTitle = document.getElementById('pageTitle');
  const providerLabel = document.getElementById('providerLabel');
  const modelPresetLabel = document.getElementById('modelPresetLabel');
  const llmSectionTitle = document.getElementById('llmSectionTitle');
  if (pageTitle) pageTitle.textContent = zh ? '配置（Settings）' : 'Settings';
  if (llmSectionTitle) llmSectionTitle.textContent = zh ? 'LLM 配置（LLM Settings）' : 'LLM Settings';
  if (providerLabel) providerLabel.textContent = zh ? '供应商预设（Provider）' : 'Provider Preset';
  if (modelPresetLabel) modelPresetLabel.textContent = zh ? '模型预设（Model Preset）' : 'Model Preset';
  if (refreshPresetsBtn) refreshPresetsBtn.textContent = zh ? '更新供应商预设' : 'Refresh Provider Presets';
  if (testBtn) testBtn.textContent = zh ? '测试连接' : 'Test Connection';
  if (saveLlmPageBtn) saveLlmPageBtn.textContent = zh ? '保存本页' : 'Save This Page';
  if (saveAppearanceBtn) saveAppearanceBtn.textContent = zh ? '保存本页' : 'Save This Page';
  if (saveGeneralBtn) saveGeneralBtn.textContent = zh ? '保存本页' : 'Save This Page';
  if (saveRulesPageBtn) saveRulesPageBtn.textContent = zh ? '保存本页' : 'Save This Page';
  if (exportSettingsBtn) exportSettingsBtn.textContent = zh ? '导出配置(JSON)' : 'Export Settings (JSON)';
  if (importSettingsBtn) importSettingsBtn.textContent = zh ? '导入配置(JSON)' : 'Import Settings (JSON)';
  if (settingsNav) {
    const labels = zh
      ? { general: '常规', llm: 'LLM', rules: '本地规则', appearance: '外观', io: '导入导出' }
      : { general: 'General', llm: 'LLM', rules: 'Local Rules', appearance: 'Appearance', io: 'Import / Export' };
    settingsNav.querySelectorAll('button[data-page]').forEach((btn) => {
      const key = btn.getAttribute('data-page');
      if (key && labels[key]) btn.textContent = labels[key];
    });
  }
  if (appearanceResetAllTopBtn) appearanceResetAllTopBtn.textContent = zh ? '全部恢复默认' : 'Reset All to Defaults';
  if (appearanceResetAllBottomBtn) appearanceResetAllBottomBtn.textContent = zh ? '全部恢复默认' : 'Reset All to Defaults';
  if (appearanceResetTopModuleBtn) appearanceResetTopModuleBtn.textContent = zh ? '恢复本模块默认' : 'Reset This Module';
  if (appearanceResetMiddleModuleBtn) appearanceResetMiddleModuleBtn.textContent = zh ? '恢复本模块默认' : 'Reset This Module';
  if (appearanceResetBottomModuleBtn) appearanceResetBottomModuleBtn.textContent = zh ? '恢复本模块默认' : 'Reset This Module';
  if (llmGroupsSortHint) {
    llmGroupsSortHint.textContent = zh
      ? '可拖动排序，排序将同步用于 LLM 分组约束、本地规则分组和外观固定分组配色顺序。'
      : 'Drag to reorder. The order is shared by LLM constraints, local-rule groups, and fixed group colors.';
  }
  const appearancePreviewTitle = document.getElementById('appearancePreviewTitle');
  if (appearancePreviewTitle) appearancePreviewTitle.textContent = zh ? '主窗口预览（可交互）' : 'Main Panel Preview (Interactive)';
  renderAppearancePreview();
}

bindChipInput(timeKeywordsInput, () => state.localRules.timeKeywords, renderLocalRules);
bindChipInput(locationKeywordsInput, () => state.localRules.locationKeywords, renderLocalRules);
bindChipInput(groupAcademicInput, () => (state.localRules.groupKeywords.academic ||= []), renderLocalRules);
bindChipInput(groupCourseInput, () => (state.localRules.groupKeywords.course ||= []), renderLocalRules);
bindChipInput(groupActivityInput, () => (state.localRules.groupKeywords.activity ||= []), renderLocalRules);
bindChipInput(groupImportantInput, () => (state.localRules.groupKeywords.important ||= []), renderLocalRules);
bindChipInput(groupOtherInput, () => (state.localRules.groupKeywords.other ||= []), renderLocalRules);
llmGroupsInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addLlmGroupByInput(llmGroupsInput.value);
  llmGroupsInput.value = '';
});

useTemperature.addEventListener('change', updateAdvancedInputState);
useMaxTokens.addEventListener('change', updateAdvancedInputState);
useTopP.addEventListener('change', updateAdvancedInputState);
llmProvider.addEventListener('change', onProviderChanged);
llmModelPreset.addEventListener('change', onModelPresetChanged);
refreshPresetsBtn.addEventListener('click', refreshProviderPresets);
testBtn.addEventListener('click', testConnection);
if (saveGeneralBtn) saveGeneralBtn.addEventListener('click', saveGeneralSection);
if (saveRulesPageBtn) saveRulesPageBtn.addEventListener('click', saveRulesSection);
if (saveLlmPageBtn) saveLlmPageBtn.addEventListener('click', saveLLMSection);
saveAppearanceBtn.addEventListener('click', saveAppearanceSection);
resetRulesBtn.addEventListener('click', resetLocalRules);
resetPromptBtn.addEventListener('click', resetPromptToDefault);
appearanceResetAllTopBtn.addEventListener('click', resetAppearanceAll);
appearanceResetAllBottomBtn.addEventListener('click', resetAppearanceAll);
appearanceResetTopModuleBtn.addEventListener('click', () => resetAppearanceModule('top'));
appearanceResetMiddleModuleBtn.addEventListener('click', () => resetAppearanceModule('middle'));
appearanceResetBottomModuleBtn.addEventListener('click', () => resetAppearanceModule('bottom'));
if (settingsNav) {
  settingsNav.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => switchSettingsPage(btn.getAttribute('data-page')));
  });
}

function pageFromNode(node) {
  const page = node && node.closest ? node.closest('.settings-page[data-page]') : null;
  return page ? page.getAttribute('data-page') : '';
}

Array.from(document.querySelectorAll('input,select,textarea')).forEach((node) => {
  const eventName = node.type === 'checkbox' ? 'change' : 'input';
  node.addEventListener(eventName, () => {
    const page = pageFromNode(node);
    markPageDirty(page);
  });
});

async function exportSettings() {
  try {
    const settings = collectAllSettingsPayload();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `email2calendar-settings-${Date.now()}.json`;
    await browser.downloads.download({ url, filename, saveAs: true });
    if (ioStatus) ioStatus.textContent = t('exportOk');
    showIoPopup(true, t('exportOk'));
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    const message = `${t('exportFail')}: ${error.message || error}`;
    if (ioStatus) ioStatus.textContent = message;
    showIoPopup(false, message);
  }
}

async function importSettingsFromFile(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const saved = await browser.runtime.sendMessage({ type: 'todo:set-settings', settings: parsed });
    applyLoadedSettings(saved || {});
    if (ioStatus) ioStatus.textContent = t('importOk');
    showIoPopup(true, t('importOk'));
    state.dirtyPages.clear();
  } catch (error) {
    const message = `${t('importFail')}: ${error.message || error}`;
    if (ioStatus) ioStatus.textContent = message;
    showIoPopup(false, message);
  }
}

if (exportSettingsBtn) exportSettingsBtn.addEventListener('click', exportSettings);
if (importSettingsBtn) {
  importSettingsBtn.addEventListener('click', () => {
    if (importSettingsFile) importSettingsFile.click();
  });
}
if (importSettingsFile) {
  importSettingsFile.addEventListener('change', async () => {
    const file = importSettingsFile.files && importSettingsFile.files[0];
    if (!file) return;
    await importSettingsFromFile(file);
    importSettingsFile.value = '';
  });
}

[
  appearanceMode,
  appearancePreset,
  appearanceTextColor,
  appearanceBaseFontSize,
  appearanceTitleBold,
  appearanceEventGap,
  appearanceGroupGap,
  appearanceModuleBg,
  appearanceButtonBg,
  appearanceButtonText,
  appearanceGroupTitleColor,
  appearanceGroupTitleSize,
  appearanceItemTitleColor,
  appearanceItemTitleSize,
  appearanceMetaColor,
  appearanceMetaSize,
  appearanceStatusColor,
  appearanceStatusSize,
  appearanceCardBg,
  appearanceCardBorderColor,
  appearanceCardRadius,
  appearanceCardShadow,
  appearanceCardMinHeight,
  appearanceCardPaddingY,
  appearanceCardPaddingX,
  appearanceCardGap,
  appearanceActionGap,
  appearanceGroupAccentImportant,
  appearanceGroupBgImportant,
  appearanceGroupAccentAcademic,
  appearanceGroupBgAcademic,
  appearanceGroupAccentCourse,
  appearanceGroupBgCourse,
  appearanceGroupAccentActivity,
  appearanceGroupBgActivity,
  appearanceGroupAccentOther,
  appearanceGroupBgOther,
  appearanceGroupAccentUnrecognized,
  appearanceGroupBgUnrecognized
].forEach((node) => {
  // Use "change" for color pickers to avoid sticky picker dialogs and
  // apply update after user confirms selection.
  const eventName = node.type === 'checkbox'
    ? 'change'
    : (node.type === 'color' ? 'change' : 'input');
  node.addEventListener(eventName, onAppearanceChanged);
});

attachFieldHelpText();
applyNumberInputRangeHints();
applyLocalizedUi();
switchSettingsPage('general');
load();
