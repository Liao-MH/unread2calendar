'use strict';

const el = {
  scanBtn: document.getElementById('scanBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  expandAllBtn: document.getElementById('expandAllBtn'),
  llmBtn: document.getElementById('llmBtn'),
  clearBtn: document.getElementById('clearBtn'),
  pauseTaskBtn: document.getElementById('pauseTaskBtn'),
  resumeTaskBtn: document.getElementById('resumeTaskBtn'),
  cancelTaskBtn: document.getElementById('cancelTaskBtn'),
  importBtn: document.getElementById('importBtn'),
  setupHint: document.getElementById('setupHint'),
  contextBox: document.getElementById('contextBox'),
  accountPicker: document.getElementById('accountPicker'),
  accountPickerTitle: document.getElementById('accountPickerTitle'),
  accountList: document.getElementById('accountList'),
  accountPickerHint: document.getElementById('accountPickerHint'),
  cancelScanBtn: document.getElementById('cancelScanBtn'),
  confirmScanBtn: document.getElementById('confirmScanBtn'),
  calendarPicker: document.getElementById('calendarPicker'),
  calendarPickerTitle: document.getElementById('calendarPickerTitle'),
  calendarList: document.getElementById('calendarList'),
  calendarPickerHint: document.getElementById('calendarPickerHint'),
  cancelImportBtn: document.getElementById('cancelImportBtn'),
  confirmImportBtn: document.getElementById('confirmImportBtn'),
  groups: document.getElementById('groups'),
  importedHost: document.getElementById('importedHost'),
  statusBox: document.getElementById('statusBox'),
  versionLine: document.getElementById('versionLine'),
  groupTpl: document.getElementById('groupTpl'),
  itemTpl: document.getElementById('itemTpl')
};

const I18N = {
  zh: {
    scan: '扫描未读',
    refresh: '刷新',
    expandAll: '全部展开',
    collapseAll: '全部收起',
    config: '配置',
    clear: '清屏',
    pauseTask: '暂停',
    resumeTask: '继续',
    cancelTask: '取消任务',
    import: '导入日历',
    setupHint: 'LLM 未配置，正在使用本地规则。',
    setupHintFailed: 'LLM测试连接失败',
    noActiveContext: '当前没有活动邮件上下文。',
    noSubject: '(无主题)',
    noItems: '无事件',
    noTodosHint: '暂无待办，请点击“扫描未读”或“刷新”',
    collapse: '收起',
    expand: '展开',
    relatedMails: '相关邮件',
    openDuplicateMail: '打开关联邮件',
    openSourceMail: '查看原邮件',
    confirm: '确认',
    reject: '拒绝',
    restore: '恢复',
    markRead: '标记已读',
    convert: '转为待办',
    timePrefix: '时间：',
    locationPrefix: '地点：',
    summaryPrefix: '摘要：',
    sourcePrefix: '来源：',
    none: '无',
    pickAccounts: '选择扫描账号',
    pickCalendar: '选择导入日历',
    startScan: '开始扫描',
    confirmImport: '确认导入',
    cancel: '取消',
    selectAtLeastOne: '请至少选择一个账号',
    selectCalendar: '请至少选择一个日历',
    noAccounts: '未读取到可扫描账号',
    noCalendars: '未读取到可写日历',
    noCalendarsWithReason: '未读取到可写日历（{reason}）',
    scanStatus: '阶段：{phase}。{processed}/{total}，提取 {extracted}，失败 {failed}。',
    statusPrefix: '状态：',
    scanningUnread: '正在扫描未读...',
    importingCalendar: '正在导入到日历“{name}”...',
    importDone: '导入完成，成功 {imported}，待核验 {unverified}，失败 {failed}，已处理拒绝 {rejected} 条，已标记已读 {markedRead} 条。',
    processedCount: '已处理 {count} 个事项',
    cleared: '已清屏',
    idle: '待命',
    loadFailed: '加载失败',
    actionFailed: '{action} 失败: {reason}'
  },
  en: {
    scan: 'Scan Unread',
    refresh: 'Refresh',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    config: 'Settings',
    clear: 'Clear',
    pauseTask: 'Pause',
    resumeTask: 'Resume',
    cancelTask: 'Cancel Task',
    import: 'Import Calendar',
    setupHint: 'LLM not configured. Running local rules.',
    setupHintFailed: 'LLM connection test failed.',
    noActiveContext: 'No active message context.',
    noSubject: '(No subject)',
    noItems: 'No events',
    noTodosHint: 'No todos yet. Click "Scan Unread" or "Refresh".',
    collapse: 'Collapse',
    expand: 'Expand',
    relatedMails: 'Related Emails',
    openDuplicateMail: 'Open related email',
    openSourceMail: 'Open Source Email',
    confirm: 'Confirm',
    reject: 'Reject',
    restore: 'Restore',
    markRead: 'Mark Read',
    convert: 'Convert',
    timePrefix: 'Time: ',
    locationPrefix: 'Location: ',
    summaryPrefix: 'Summary: ',
    sourcePrefix: 'Source: ',
    none: 'None',
    pickAccounts: 'Choose Accounts',
    pickCalendar: 'Choose Calendar',
    startScan: 'Start Scan',
    confirmImport: 'Confirm Import',
    cancel: 'Cancel',
    selectAtLeastOne: 'Please select at least one account.',
    selectCalendar: 'Please select one calendar.',
    noAccounts: 'No accounts available.',
    noCalendars: 'No writable calendar.',
    noCalendarsWithReason: 'No writable calendar ({reason}).',
    scanStatus: 'Phase: {phase}. {processed}/{total}, extracted {extracted}, failed {failed}.',
    statusPrefix: 'Status: ',
    scanningUnread: 'Scanning unread...',
    importingCalendar: 'Importing to calendar "{name}"...',
    importDone: 'Import complete, imported {imported}, unverified {unverified}, failed {failed}, finalized {rejected} rejected, marked read {markedRead}.',
    processedCount: 'Processed {count} item(s)',
    cleared: 'Cleared',
    idle: 'Idle',
    loadFailed: 'Load failed',
    actionFailed: '{action} failed: {reason}'
  }
};

let vm = null;
const PANEL_UI_STATE_KEY = 'todo.panel-ui-state.v1';
const PANEL_WINDOW_STATE_KEY = 'todo.panel-window-state.v1';
const PANEL_MIN_WIDTH = 560;
const PANEL_MIN_HEIGHT = 620;
const uiState = {
  expandedDuplicateId: null,
  groupExpandedAllByKey: Object.create(null),
  expandedItemsByGroup: Object.create(null),
  forceCollapsedItemsByGroup: Object.create(null),
  expandedParentsByGroup: Object.create(null),
  editingByItemId: Object.create(null),
  importCalendars: [],
  scanAccounts: [],
  scrollTop: 0,
  shouldRestoreScroll: false
};
const FIXED_GROUP_ACCENTS = Object.freeze({
  important: '#d97706',
  academic: '#2563eb',
  course: '#0891b2',
  activity: '#16a34a',
  other: '#6b7280',
  unrecognized: '#7c3aed'
});
const GROUP_FALLBACK_PALETTE = Object.freeze([
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#0891b2',
  '#7c3aed',
  '#dc2626',
  '#4f46e5',
  '#0f766e'
]);

function clampByte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function parseColor(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return null;
  const shortHex = /^#([0-9a-f]{3})$/i.exec(text);
  if (shortHex) {
    const chars = shortHex[1].split('');
    return {
      r: parseInt(chars[0] + chars[0], 16),
      g: parseInt(chars[1] + chars[1], 16),
      b: parseInt(chars[2] + chars[2], 16)
    };
  }
  const fullHex = /^#([0-9a-f]{6})$/i.exec(text);
  if (fullHex) {
    const hex = fullHex[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }
  const rgbMatch = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (rgbMatch) {
    const nums = rgbMatch[1].split(',').map((part) => Number(part.trim()));
    if (nums.length >= 3 && nums.every((n) => Number.isFinite(n))) {
      return { r: clampByte(nums[0]), g: clampByte(nums[1]), b: clampByte(nums[2]) };
    }
  }
  return null;
}

function toHex(color) {
  if (!color) return '';
  const r = clampByte(color.r).toString(16).padStart(2, '0');
  const g = clampByte(color.g).toString(16).padStart(2, '0');
  const b = clampByte(color.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function mixColor(from, to, ratio) {
  const a = parseColor(from);
  const b = parseColor(to);
  if (!a) return toHex(b) || '#2563eb';
  if (!b) return toHex(a);
  const t = Math.max(0, Math.min(1, Number(ratio) || 0));
  return toHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  });
}

function relativeLuminance(color) {
  const c = parseColor(color);
  if (!c) return 0.5;
  const normalize = (v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const r = normalize(c.r);
  const g = normalize(c.g);
  const b = normalize(c.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hashIndex(text, mod) {
  const src = String(text || '');
  let hash = 0;
  for (let i = 0; i < src.length; i += 1) {
    hash = ((hash << 5) - hash) + src.charCodeAt(i);
    hash |= 0;
  }
  const size = Math.max(1, Number(mod) || 1);
  return Math.abs(hash) % size;
}

function uiIsDark() {
  const bg = getComputedStyle(document.body).backgroundColor;
  return relativeLuminance(bg) < 0.35;
}

function pickReadableText(background) {
  const dark = '#111827';
  const light = '#ffffff';
  const bgLum = relativeLuminance(background);
  const contrastDark = (Math.max(bgLum, relativeLuminance(dark)) + 0.05) / (Math.min(bgLum, relativeLuminance(dark)) + 0.05);
  const contrastLight = (Math.max(bgLum, relativeLuminance(light)) + 0.05) / (Math.min(bgLum, relativeLuminance(light)) + 0.05);
  return contrastDark >= contrastLight ? dark : light;
}

function resolveGroupVisual(groupKey, appearance) {
  const key = String(groupKey || 'other');
  if (key === 'imported') {
    const neutral = toHex(parseColor(getComputedStyle(document.documentElement).getPropertyValue('--e2c-card-border'))) || '#d8dee7';
    return { accent: neutral, bg: '', confirmText: pickReadableText(neutral) };
  }
  const appearanceStyles = appearance && appearance.advanced && appearance.advanced.groupStyles
    ? appearance.advanced.groupStyles
    : {};
  const configured = appearanceStyles[key] && typeof appearanceStyles[key] === 'object'
    ? appearanceStyles[key]
    : null;
  const fallbackAccent = FIXED_GROUP_ACCENTS[key]
    || GROUP_FALLBACK_PALETTE[hashIndex(key, GROUP_FALLBACK_PALETTE.length)];
  const accentBase = toHex(parseColor(configured && configured.accent)) || fallbackAccent;
  const accent = uiIsDark() ? mixColor(accentBase, '#ffffff', 0.18) : mixColor(accentBase, '#000000', 0.08);
  const configuredBg = configured && configured.bg ? toHex(parseColor(configured.bg)) : '';
  return {
    accent,
    bg: configuredBg || '',
    confirmText: pickReadableText(accent)
  };
}

function saveWindowState() {
  try {
    const payload = {
      width: Number(window.outerWidth) || 0,
      height: Number(window.outerHeight) || 0,
      x: Number(window.screenX) || 0,
      y: Number(window.screenY) || 0
    };
    localStorage.setItem(PANEL_WINDOW_STATE_KEY, JSON.stringify(payload));
  } catch (_) {
    // Best effort.
  }
}

function restoreWindowState() {
  try {
    const raw = localStorage.getItem(PANEL_WINDOW_STATE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const width = Number(parsed.width) || 0;
    const height = Number(parsed.height) || 0;
    const x = Number(parsed.x);
    const y = Number(parsed.y);
    if (typeof window.resizeTo === 'function') {
      const nextWidth = Math.max(PANEL_MIN_WIDTH, width || 0);
      const nextHeight = Math.max(PANEL_MIN_HEIGHT, height || 0);
      window.resizeTo(nextWidth, nextHeight);
    }
    if (Number.isFinite(x) && Number.isFinite(y) && typeof window.moveTo === 'function') {
      window.moveTo(x, y);
    }
  } catch (_) {
    // Ignore invalid cache.
  }
}

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

function t(key) {
  const lang = currentLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function format(templateKey, values) {
  let out = t(templateKey);
  for (const [k, v] of Object.entries(values || {})) {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return out;
}

function applyAppearance(appearance) {
  const api = globalThis.Email2CalendarAppearance;
  if (!api) return;
  const vars = api.toCssVariables(appearance || api.DEFAULT_APPEARANCE);
  api.applyCssVariables(document.documentElement, vars);
}

function cloneMap(map) {
  const src = map && typeof map === 'object' ? map : {};
  const out = Object.create(null);
  for (const [key, value] of Object.entries(src)) {
    if (value && typeof value === 'object') {
      out[key] = cloneMap(value);
    } else {
      out[key] = !!value;
    }
  }
  return out;
}

function saveUiState() {
  try {
    const payload = {
      groupExpandedAllByKey: cloneMap(uiState.groupExpandedAllByKey),
      expandedItemsByGroup: cloneMap(uiState.expandedItemsByGroup),
      forceCollapsedItemsByGroup: cloneMap(uiState.forceCollapsedItemsByGroup),
      expandedParentsByGroup: cloneMap(uiState.expandedParentsByGroup),
      scrollTop: currentScrollTop()
    };
    localStorage.setItem(PANEL_UI_STATE_KEY, JSON.stringify(payload));
  } catch (_) {
    // Best effort.
  }
}

function groupUsesOwnScroll() {
  if (!el.groups) return false;
  return el.groups.scrollHeight > el.groups.clientHeight + 2;
}

function currentScrollTop() {
  return Number(el.groups && el.groups.scrollTop) || 0;
}

function applyScrollTop(value) {
  const top = Number(value) || 0;
  if (!el.groups) return;
  el.groups.scrollTop = Math.max(0, top);
}

function loadUiState() {
  try {
    const raw = localStorage.getItem(PANEL_UI_STATE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    uiState.groupExpandedAllByKey = cloneMap(parsed.groupExpandedAllByKey);
    uiState.expandedItemsByGroup = cloneMap(parsed.expandedItemsByGroup);
    uiState.forceCollapsedItemsByGroup = cloneMap(parsed.forceCollapsedItemsByGroup);
    uiState.expandedParentsByGroup = cloneMap(parsed.expandedParentsByGroup);
    uiState.scrollTop = Number(parsed.scrollTop) || 0;
    uiState.shouldRestoreScroll = true;
  } catch (_) {
    // Ignore broken cache.
  }
}

function applyStaticText() {
  el.scanBtn.textContent = t('scan');
  el.refreshBtn.textContent = t('refresh');
  el.expandAllBtn.textContent = t('expandAll');
  el.llmBtn.textContent = t('config');
  el.clearBtn.textContent = t('clear');
  el.pauseTaskBtn.textContent = t('pauseTask');
  el.resumeTaskBtn.textContent = t('resumeTask');
  el.cancelTaskBtn.textContent = t('cancelTask');
  el.importBtn.textContent = t('import');
  el.accountPickerTitle.textContent = t('pickAccounts');
  el.calendarPickerTitle.textContent = t('pickCalendar');
  el.confirmScanBtn.textContent = t('startScan');
  el.confirmImportBtn.textContent = t('confirmImport');
  el.cancelScanBtn.textContent = t('cancel');
  el.cancelImportBtn.textContent = t('cancel');
}

function actionError(action, error) {
  const reason = (error && error.message) ? error.message : String(error || 'unknown');
  setStatusLine(format('actionFailed', { action, reason }));
}

function setStatusLine(line) {
  const prefix = t('statusPrefix');
  const content = String(line || '').trim();
  el.statusBox.textContent = `${prefix}${content || t('idle')}`;
}

function calendarDebugReason(debug) {
  if (!debug || typeof debug !== 'object') return '';
  const reasons = Array.isArray(debug.excludedReasons) ? debug.excludedReasons : [];
  if (reasons.length > 0) return reasons[0];
  const totalRaw = Number.isFinite(debug.totalRaw) ? debug.totalRaw : 0;
  const path = debug.path ? String(debug.path) : 'unknown';
  return currentLang() === 'zh'
    ? `读取来源: ${path}, 原始数量: ${totalRaw}`
    : `source: ${path}, raw: ${totalRaw}`;
}

async function call(type, payload) {
  return browser.runtime.sendMessage({ type, ...(payload || {}) });
}

function text(v) {
  return String(v || '');
}

function renderContext(context) {
  if (!context || !context.messageId) {
    el.contextBox.textContent = t('noActiveContext');
    return;
  }
  el.contextBox.textContent = `${context.subject || t('noSubject')}\n${context.author || ''} ${context.date || ''}`.trim();
}

function renderAccountPicker() {
  el.accountList.textContent = '';
  const accounts = Array.isArray(uiState.scanAccounts) ? uiState.scanAccounts : [];
  if (!accounts.length) {
    el.accountPickerHint.textContent = t('noAccounts');
    el.confirmScanBtn.disabled = true;
    return;
  }

  let checkedCount = 0;
  accounts.forEach((acc) => {
    const row = document.createElement('label');
    row.className = 'account-row';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = !!acc.checked;
    if (box.checked) checkedCount += 1;
    box.addEventListener('change', () => {
      acc.checked = box.checked;
      renderAccountPicker();
    });
    const textNode = document.createElement('span');
    textNode.textContent = acc.name || acc.id;
    row.appendChild(box);
    row.appendChild(textNode);
    el.accountList.appendChild(row);
  });

  const hasSelection = checkedCount > 0;
  el.confirmScanBtn.disabled = !hasSelection;
  el.accountPickerHint.textContent = hasSelection ? '' : t('selectAtLeastOne');
}

function renderCalendarPicker() {
  el.calendarList.textContent = '';
  const calendars = Array.isArray(uiState.importCalendars) ? uiState.importCalendars : [];
  if (!calendars.length) {
    el.calendarPickerHint.textContent = t('noCalendars');
    el.confirmImportBtn.disabled = true;
    return;
  }

  let checkedCount = 0;
  calendars.forEach((cal) => {
    const row = document.createElement('label');
    row.className = 'account-row';
    const box = document.createElement('input');
    box.type = 'radio';
    box.name = 'import-calendar';
    box.checked = !!cal.checked;
    if (box.checked) checkedCount += 1;
    box.addEventListener('change', () => {
      uiState.importCalendars.forEach((c) => {
        c.checked = c.id === cal.id;
      });
      renderCalendarPicker();
    });
    const textNode = document.createElement('span');
    textNode.textContent = cal.name || cal.id;
    row.appendChild(box);
    row.appendChild(textNode);
    el.calendarList.appendChild(row);
  });

  const hasSelection = checkedCount > 0;
  el.confirmImportBtn.disabled = !hasSelection;
  el.calendarPickerHint.textContent = hasSelection ? '' : t('selectCalendar');
}

function makeButton(label, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    onClick();
  });
  return b;
}

function renderDuplicateBox(itemNode, item) {
  const box = itemNode.querySelector('.duplicate-box');
  const duplicateMessages = Array.isArray(item.duplicateMessages) ? item.duplicateMessages : [];
  const shouldSupportExpand = item.duplicateCount > 1 && duplicateMessages.length > 1;
  if (!shouldSupportExpand) {
    box.hidden = true;
    box.textContent = '';
    return;
  }

  const open = uiState.expandedDuplicateId === item.id;
  box.hidden = !open;
  box.textContent = '';
  if (!open) return;

  const title = document.createElement('p');
  title.className = 'duplicate-title';
  title.textContent = `${t('relatedMails')} (${duplicateMessages.length})`;
  box.appendChild(title);

  duplicateMessages.forEach((dup) => {
    const label = `${dup.subject || t('noSubject')} | ${dup.author || ''} ${dup.startText || ''}`.trim();
    const btn = makeButton(label, async () => {
      try {
        await call('todo:select', { todoId: dup.todoId, openMessage: true });
        await refresh();
      } catch (error) {
        actionError(t('openDuplicateMail'), error);
      }
    });
    btn.classList.add('duplicate-item');
    box.appendChild(btn);
  });
}

function renderActions(itemNode, item, groupKey) {
  const actions = itemNode.querySelector('.item-actions');
  actions.textContent = '';

  const runWithOpenAndRefresh = async (label, runner, options) => {
    const opts = options || {};
    const collapseAfter = opts.collapseAfter !== false;
    const expandAfter = !!opts.expandAfter;
    try {
      await call('todo:select', { todoId: item.id, openMessage: true });
      await runner();
      if (expandAfter) {
        expandItem(groupKey, item.id);
      } else if (collapseAfter) {
        collapseItem(groupKey, item.id);
      }
      await refresh();
    } catch (error) {
      actionError(label, error);
    }
  };

  const makeActionButton = (label, onClick, primary) => {
    const btn = makeButton(label, onClick);
    if (primary) btn.classList.add('primary');
    return btn;
  };

  if (item.kind === 'todo') {
    if (item.status === 'pending') {
      actions.appendChild(makeActionButton(t('confirm'), async () => {
        await runWithOpenAndRefresh('Queue', async () => {
          await call('todo:queue', { todoId: item.id });
        });
      }, true));
      actions.appendChild(makeActionButton(t('reject'), async () => {
        await runWithOpenAndRefresh('Reject', async () => {
          await call('todo:reject', { todoId: item.id });
        });
      }, false));
    }

    if (item.status === 'queued') {
      actions.appendChild(makeActionButton(t('reject'), async () => {
        await runWithOpenAndRefresh('Reject', async () => {
          await call('todo:reject', { todoId: item.id });
        });
      }, false));
    }

    if (item.status === 'rejected') {
      actions.appendChild(makeActionButton(t('restore'), async () => {
        await runWithOpenAndRefresh('Restore', async () => {
          await call('todo:restore', { todoId: item.id });
        }, { collapseAfter: false, expandAfter: true });
      }, false));
    }
  }

  if (item.kind === 'important' && item.status === 'pending') {
    actions.appendChild(makeActionButton(t('convert'), async () => {
      await runWithOpenAndRefresh('Convert', async () => {
        await call('todo:convert-important', {
          todoId: item.id,
          payload: {}
        });
      }, { collapseAfter: false });
    }, true));

    actions.appendChild(makeActionButton(t('markRead'), async () => {
      await runWithOpenAndRefresh('Mark read', async () => {
        await call('todo:mark-important-read', { todoId: item.id });
      });
    }, false));
  }

  if (item.kind === 'import-log' && item.sourceMessageId) {
    actions.appendChild(makeActionButton(t('openSourceMail'), async () => {
      try {
        await call('todo:open-message', { messageId: item.sourceMessageId });
      } catch (error) {
        actionError(t('openSourceMail'), error);
      }
    }, false));
  }
}

function isGroupCollapsed(groupKey) {
  if (!Object.prototype.hasOwnProperty.call(uiState.groupExpandedAllByKey, groupKey)) {
    uiState.groupExpandedAllByKey[groupKey] = ['accepted'].includes(groupKey);
  }
  return !uiState.groupExpandedAllByKey[groupKey];
}

function setGroupCollapsed(groupKey, collapsed) {
  uiState.groupExpandedAllByKey[groupKey] = !collapsed;
  if (collapsed) {
    uiState.expandedItemsByGroup[groupKey] = Object.create(null);
    uiState.forceCollapsedItemsByGroup[groupKey] = Object.create(null);
    uiState.expandedParentsByGroup[groupKey] = Object.create(null);
  }
  saveUiState();
}

function setAllGroupsCollapsed(groups, collapsed) {
  (Array.isArray(groups) ? groups : []).forEach((group) => {
    setGroupCollapsed(group.key, collapsed);
  });
}

function areAllGroupsCollapsed(groups) {
  const list = Array.isArray(groups) ? groups : [];
  if (!list.length) return true;
  return list.every((group) => isGroupCollapsed(group.key));
}

function collapseItem(groupKey, itemId) {
  const expanded = groupExpandedItems(groupKey);
  delete expanded[itemId];
  groupForceCollapsedItems(groupKey)[itemId] = true;
  saveUiState();
}

function expandItem(groupKey, itemId) {
  const expanded = groupExpandedItems(groupKey);
  expanded[itemId] = true;
  delete groupForceCollapsedItems(groupKey)[itemId];
  saveUiState();
}

function groupExpandedItems(groupKey) {
  if (!uiState.expandedItemsByGroup[groupKey]) {
    uiState.expandedItemsByGroup[groupKey] = Object.create(null);
  }
  return uiState.expandedItemsByGroup[groupKey];
}

function groupExpandedParents(groupKey) {
  if (!uiState.expandedParentsByGroup[groupKey]) {
    uiState.expandedParentsByGroup[groupKey] = Object.create(null);
  }
  return uiState.expandedParentsByGroup[groupKey];
}

function groupForceCollapsedItems(groupKey) {
  if (!uiState.forceCollapsedItemsByGroup[groupKey]) {
    uiState.forceCollapsedItemsByGroup[groupKey] = Object.create(null);
  }
  return uiState.forceCollapsedItemsByGroup[groupKey];
}

function groupItemsBySourceMessage(items) {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const key = String(item.sourceMessageId || item.id || '');
    if (!key) return;
    const bucket = map.get(key) || {
      sourceMessageId: key,
      parentTitle: item.parentTitle || item.sourceSubject || item.title || t('noSubject'),
      items: []
    };
    if (!bucket.parentTitle) {
      bucket.parentTitle = item.title || t('noSubject');
    }
    bucket.items.push(item);
    map.set(key, bucket);
  });
  return [...map.values()];
}

function parentEventsLabel(count) {
  return currentLang() === 'zh'
    ? `${count}个事件`
    : `${count} events`;
}

function createItemNode(item, groupKey, collapsed) {
  const itemFrag = el.itemTpl.content.cloneNode(true);
  const node = itemFrag.querySelector('.item');
  const title = node.querySelector('.item-title');
  const time = node.querySelector('.item-time');
  const location = node.querySelector('.item-location');
  const expandedByItem = !!groupExpandedItems(groupKey)[item.id];
  const forceCollapsed = !!groupForceCollapsedItems(groupKey)[item.id];
  const expanded = !forceCollapsed && (!!uiState.groupExpandedAllByKey[groupKey] || expandedByItem);
  node.classList.toggle('compact', !expanded);
  const isEditing = !!uiState.editingByItemId[item.id];
  if (!isEditing) {
    title.textContent = item.displayTitle || item.title;
    if (item.kind === 'non_todo') {
      time.textContent = `${t('summaryPrefix')}${text(item.notes) || t('none')}`;
      location.textContent = `${t('sourcePrefix')}${text(item.sourceAuthor || item.location) || t('none')}`;
    } else {
      time.textContent = `${t('timePrefix')}${text(item.startText) || t('none')}`;
      location.textContent = `${t('locationPrefix')}${text(item.location) || t('none')}`;
    }
  } else {
    const edit = uiState.editingByItemId[item.id];
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = edit.title;
    titleInput.className = 'inline-edit-input';
    const timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.value = edit.startText;
    timeInput.className = 'inline-edit-input';
    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.value = edit.location;
    locationInput.className = 'inline-edit-input';
    title.textContent = '';
    time.textContent = '';
    location.textContent = '';
    title.appendChild(titleInput);
    time.appendChild(timeInput);
    location.appendChild(locationInput);

    const saveEdit = async () => {
      if (!uiState.editingByItemId[item.id] || uiState.editingByItemId[item.id].saving) return;
      uiState.editingByItemId[item.id].saving = true;
      try {
        await call('todo:update', {
          todoId: item.id,
          patch: {
            title: String(titleInput.value || '').trim(),
            startText: String(timeInput.value || '').trim(),
            location: String(locationInput.value || '').trim()
          }
        });
        delete uiState.editingByItemId[item.id];
        await refresh();
      } catch (error) {
        uiState.editingByItemId[item.id].saving = false;
        actionError(currentLang() === 'zh' ? '保存编辑' : 'Save edit', error);
      }
    };
    const cancelEdit = () => {
      delete uiState.editingByItemId[item.id];
      render();
    };
    const keyHandler = async (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        await saveEdit();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        cancelEdit();
      }
    };
    titleInput.addEventListener('keydown', keyHandler);
    timeInput.addEventListener('keydown', keyHandler);
    locationInput.addEventListener('keydown', keyHandler);
    titleInput.addEventListener('blur', saveEdit);
    timeInput.addEventListener('blur', saveEdit);
    locationInput.addEventListener('blur', saveEdit);
    setTimeout(() => titleInput.focus(), 0);
  }

  if (item.id === vm.selectedTodoId) node.classList.add('selected');
  if (['rejected', 'read_marked', 'converted', 'seen'].includes(item.status)) node.classList.add('dimmed');

  node.addEventListener('click', async (ev) => {
    if (uiState.editingByItemId[item.id]) return;
    ev.stopPropagation();
    try {
      if (item.kind === 'import-log') {
        const nextExpanded = !expanded;
        if (nextExpanded) {
          expandItem(groupKey, item.id);
        } else {
          collapseItem(groupKey, item.id);
        }
        render();
        return;
      }
      if (item.kind === 'non_todo') {
        const isCurrentlySelected = item.id === vm.selectedTodoId;
        if (!isCurrentlySelected) {
          expandItem(groupKey, item.id);
        } else {
          const nextExpanded = !expanded;
          if (nextExpanded) {
            expandItem(groupKey, item.id);
          } else {
            collapseItem(groupKey, item.id);
          }
        }
        await call('todo:mark-non-todo-seen', { todoId: item.id });
        await call('todo:select', { todoId: item.id, openMessage: true });
        await refresh();
        return;
      }
      const isCurrentlySelected = item.id === vm.selectedTodoId;
      if (!isCurrentlySelected) {
        // First click on an unselected item always opens and expands.
        expandItem(groupKey, item.id);
      } else {
        const nextExpanded = !expanded;
        if (nextExpanded) {
          expandItem(groupKey, item.id);
        } else {
          collapseItem(groupKey, item.id);
        }
      }
      if (item.duplicateCount > 1) {
        uiState.expandedDuplicateId = uiState.expandedDuplicateId === item.id ? null : item.id;
      } else {
        uiState.expandedDuplicateId = null;
      }
      await call('todo:select', { todoId: item.id, openMessage: true });
      await refresh();
    } catch (error) {
      actionError('Select', error);
    }
  });

  node.addEventListener('dblclick', async (ev) => {
    if (item.kind === 'non_todo') return;
    ev.stopPropagation();
    uiState.editingByItemId[item.id] = {
      title: item.title || '',
      startText: item.startText || '',
      location: item.location || '',
      saving: false
    };
    render();
  });

  renderActions(node, item, groupKey);
  renderDuplicateBox(node, item);
  return itemFrag;
}

function renderSingleGroup(host, group) {
  const frag = el.groupTpl.content.cloneNode(true);
  const container = frag.querySelector('.group');
  container.dataset.groupKey = group.key;
  const visual = resolveGroupVisual(group.key, vm && vm.appearance);
  container.style.setProperty('--group-accent', visual.accent);
  container.style.setProperty('--group-confirm-text', visual.confirmText);
  if (visual.bg) {
    container.style.setProperty('--group-item-bg', visual.bg);
  } else {
    container.style.removeProperty('--group-item-bg');
  }
  const list = container.querySelector('.group-items');
  const toggle = container.querySelector('.group-toggle');
  const titleNode = container.querySelector('.group-title');

  container.querySelector('.group-title').textContent = group.label;
  container.querySelector('.group-count').textContent = String(group.count);

  const collapsed = isGroupCollapsed(group.key);
  toggle.textContent = collapsed ? t('expand') : t('collapse');
  toggle.onclick = (ev) => {
    ev.stopPropagation();
    setGroupCollapsed(group.key, !isGroupCollapsed(group.key));
    render();
  };
  titleNode.style.cursor = 'pointer';
  titleNode.onclick = (ev) => {
    ev.stopPropagation();
    setGroupCollapsed(group.key, !isGroupCollapsed(group.key));
    render();
  };

  if (group.key === 'imported' && collapsed) {
    list.hidden = true;
    host.appendChild(frag);
    return;
  }
  list.hidden = false;

  if (!group.items.length) {
    const empty = document.createElement('p');
    empty.className = 'item-location';
    empty.textContent = t('noItems');
    list.appendChild(empty);
  }

  const messageBuckets = groupItemsBySourceMessage(group.items || []);
  messageBuckets.forEach((bucket) => {
    if (bucket.items.length <= 1) {
      list.appendChild(createItemNode(bucket.items[0], group.key, collapsed));
      return;
    }
    const parent = document.createElement('article');
    parent.className = 'item parent-item';
    const parentMain = document.createElement('div');
    parentMain.className = 'item-main';
    const parentTitle = document.createElement('h4');
    parentTitle.className = 'item-title';
    parentTitle.textContent = bucket.parentTitle || t('noSubject');
    const parentMeta = document.createElement('p');
    parentMeta.className = 'item-location';
    const open = !!groupExpandedParents(group.key)[bucket.sourceMessageId];
    parentMeta.textContent = parentEventsLabel(bucket.items.length);
    parentMain.appendChild(parentTitle);
    parentMain.appendChild(parentMeta);
    parent.appendChild(parentMain);

    const children = document.createElement('div');
    children.className = 'parent-children';
    const parentVisible = !!uiState.groupExpandedAllByKey[group.key] || open;
    children.hidden = !parentVisible;
    bucket.items.forEach((child) => {
      const childNode = createItemNode(child, group.key, collapsed);
      const first = childNode.firstElementChild;
      if (first) first.classList.add('child-item');
      children.appendChild(childNode);
    });
    parent.appendChild(children);
    parent.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const nextOpen = !open;
      groupExpandedParents(group.key)[bucket.sourceMessageId] = nextOpen;
      try {
        const sourceMessageId = String(bucket.sourceMessageId || '');
        if (sourceMessageId) {
          await call('todo:open-message', { messageId: sourceMessageId });
        } else if (bucket.items[0] && bucket.items[0].id) {
          await call('todo:select', { todoId: bucket.items[0].id, openMessage: true });
        }
      } catch (_) {
        // Keep expand/collapse responsive even if opening mail fails.
      }
      saveUiState();
      render();
    });
    list.appendChild(parent);
  });

  host.appendChild(frag);
}

function renderGroups(groups) {
  el.groups.textContent = '';
  el.importedHost.textContent = '';
  const list = Array.isArray(groups) ? groups : [];
  let renderedMainGroup = 0;
  for (const group of list) {
    if (group.key === 'imported') {
      renderSingleGroup(el.importedHost, group);
      continue;
    }
    renderedMainGroup += 1;
    renderSingleGroup(el.groups, group);
  }
  if (!renderedMainGroup) {
    const emptyLine = document.createElement('p');
    emptyLine.className = 'groups-empty';
    emptyLine.textContent = t('noTodosHint');
    el.groups.appendChild(emptyLine);
  }
}

function render() {
  if (!vm) return;

  const prevScrollTop = currentScrollTop();
  applyAppearance(vm.appearance);
  applyStaticText();
  const running = !!(vm.scan && vm.scan.running);
  const paused = !!(vm.scan && vm.scan.paused);
  el.scanBtn.disabled = running;
  el.refreshBtn.disabled = running;
  el.expandAllBtn.disabled = false;
  el.clearBtn.disabled = running;
  el.pauseTaskBtn.disabled = !running || paused;
  el.resumeTaskBtn.disabled = !running || !paused;
  el.cancelTaskBtn.disabled = !running;
  el.importBtn.disabled = !vm.nextStep.readyForImport;
  el.versionLine.textContent = `v${vm.version}`;
  let setupHint = '';
  if (vm.needsLLMSetup) {
    setupHint = t('setupHint');
  } else if (vm.llmConnectionStatus === 'failed') {
    setupHint = t('setupHintFailed');
  }
  el.setupHint.hidden = !setupHint;
  el.setupHint.textContent = setupHint;
  el.contextBox.hidden = true;
  renderContext(vm.context);
  renderGroups(vm.groups);
  const allCollapsed = areAllGroupsCollapsed(vm.groups);
  el.expandAllBtn.textContent = allCollapsed ? t('expandAll') : t('collapseAll');
  const baseStatus = vm.errorText || vm.statusText || '';
  setStatusLine(baseStatus);
  if (uiState.shouldRestoreScroll) {
    applyScrollTop(uiState.scrollTop || 0);
    uiState.shouldRestoreScroll = false;
  } else {
    applyScrollTop(prevScrollTop);
  }
}

async function refresh() {
  vm = await call('todo:get-view-model');
  render();
}

async function refreshActive() {
  vm = await call('todo:refresh-active');
  render();
}

async function pauseRecognitionTask() {
  try {
    await call('todo:scan-pause');
    await refresh();
  } catch (error) {
    actionError(currentLang() === 'zh' ? '暂停任务' : 'Pause task', error);
  }
}

async function resumeRecognitionTask() {
  try {
    await call('todo:scan-resume');
    await refresh();
  } catch (error) {
    actionError(currentLang() === 'zh' ? '继续任务' : 'Resume task', error);
  }
}

async function cancelRecognitionTask() {
  try {
    await call('todo:scan-cancel');
    await refresh();
  } catch (error) {
    actionError(currentLang() === 'zh' ? '取消任务' : 'Cancel task', error);
  }
}

async function clearScreen() {
  try {
    await call('todo:clear-screen');
    await refresh();
  } catch (error) {
    actionError(currentLang() === 'zh' ? '清屏' : 'Clear', error);
  }
}

function toggleExpandCollapseAll() {
  if (!vm || !Array.isArray(vm.groups)) return;
  const shouldExpand = areAllGroupsCollapsed(vm.groups);
  setAllGroupsCollapsed(vm.groups, !shouldExpand);
  saveUiState();
  render();
}

async function openAccountPicker() {
  try {
    const [accounts, settings] = await Promise.all([
      call('todo:list-accounts'),
      call('todo:get-settings')
    ]);
    const selected = new Set(Array.isArray(settings.lastSelectedAccountIds) ? settings.lastSelectedAccountIds : []);
    uiState.scanAccounts = (Array.isArray(accounts) ? accounts : []).map((acc) => ({
      id: String(acc.id),
      name: acc.name || acc.id,
      checked: selected.size > 0 ? selected.has(String(acc.id)) : false
    }));
    el.accountPicker.hidden = false;
    renderAccountPicker();
  } catch (error) {
    actionError('Open account picker', error);
  }
}

function closeAccountPicker() {
  el.accountPicker.hidden = true;
}

function closeCalendarPicker() {
  el.calendarPicker.hidden = true;
}

async function scanUnread() {
  await openAccountPicker();
}

async function confirmScanWithAccounts() {
  const selected = uiState.scanAccounts.filter((a) => a.checked).map((a) => a.id);
  if (!selected.length) {
    el.accountPickerHint.textContent = t('selectAtLeastOne');
    return;
  }
  try {
    setStatusLine(t('scanningUnread'));
    const settings = await call('todo:get-settings');
    await call('todo:set-settings', {
      settings: {
        ...settings,
        lastSelectedAccountIds: selected
      }
    });
    el.confirmScanBtn.disabled = true;
    el.cancelScanBtn.disabled = true;
    el.accountPickerHint.textContent = currentLang() === 'zh' ? '即将开始扫描（1秒）…' : 'Starting in 1s...';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    closeAccountPicker();
    await call('todo:scan-unread-by-accounts', { accountIds: selected });
    await refresh();
  } catch (error) {
    actionError('Scan', error);
  } finally {
    el.confirmScanBtn.disabled = false;
    el.cancelScanBtn.disabled = false;
  }
}

async function importCalendar() {
  try {
    const response = await call('todo:list-calendars', { includeDebug: true });
    const list = Array.isArray(response)
      ? response
      : (response && Array.isArray(response.calendars) ? response.calendars : []);
    const debug = (response && !Array.isArray(response) && response.debug) ? response.debug : null;
    if (!list.length) {
      const reason = calendarDebugReason(debug);
      setStatusLine(reason
        ? format('noCalendarsWithReason', { reason })
        : t('noCalendars'));
      return;
    }
    if (list.length === 1) {
      setStatusLine(format('importingCalendar', { name: list[0].name || list[0].id }));
      const result = await call('todo:batch-import', { calendarId: list[0].id });
      setStatusLine(format('importDone', {
        imported: result.imported || 0,
        unverified: result.unverified || 0,
        failed: result.failed || 0,
        rejected: result.finalizedRejected || 0,
        markedRead: result.markedRead || 0
      }));
      await refresh();
      return;
    }

    uiState.importCalendars = list.map((c, idx) => ({
      id: String(c.id),
      name: c.name || c.id,
      checked: idx === 0
    }));
    el.calendarPicker.hidden = false;
    renderCalendarPicker();
    setTimeout(() => {
      try {
        el.calendarPicker.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstInput = el.calendarList.querySelector('input[type="radio"]');
        if (firstInput) firstInput.focus();
      } catch (_) {
        // Best effort.
      }
    }, 0);
  } catch (error) {
    actionError('Open calendar picker', error);
  }
}

async function confirmImportToCalendar() {
  const target = (uiState.importCalendars || []).find((c) => c.checked);
  if (!target) {
    el.calendarPickerHint.textContent = t('selectCalendar');
    return;
  }
  try {
    setStatusLine(format('importingCalendar', { name: target.name || target.id }));
    const result = await call('todo:batch-import', { calendarId: target.id });
    closeCalendarPicker();
    setStatusLine(format('importDone', {
      imported: result.imported || 0,
      unverified: result.unverified || 0,
      failed: result.failed || 0,
      rejected: result.finalizedRejected || 0,
      markedRead: result.markedRead || 0
    }));
    await refresh();
  } catch (error) {
    actionError('Import', error);
  }
}

async function openLLM() {
  try {
    if (browser.runtime.openOptionsPage) {
      await browser.runtime.openOptionsPage();
    } else {
      await browser.tabs.create({ url: browser.runtime.getURL('options/options.html') });
    }
  } catch (error) {
    actionError('Open settings', error);
  }
}

window.onerror = function(message) {
  setStatusLine(`Panel failed: ${message}`);
};

window.onunhandledrejection = function(event) {
  const reason = event.reason && event.reason.message ? event.reason.message : String(event.reason || 'unknown');
  setStatusLine(`Panel failed: ${reason}`);
};

browser.runtime.onMessage.addListener((message) => {
  if (message && message.type === 'todo:state-changed') {
    refresh();
  }
});

el.scanBtn.addEventListener('click', scanUnread);
el.cancelScanBtn.addEventListener('click', closeAccountPicker);
el.confirmScanBtn.addEventListener('click', confirmScanWithAccounts);
el.cancelImportBtn.addEventListener('click', closeCalendarPicker);
el.confirmImportBtn.addEventListener('click', confirmImportToCalendar);
el.refreshBtn.addEventListener('click', refreshActive);
el.expandAllBtn.addEventListener('click', toggleExpandCollapseAll);
el.llmBtn.addEventListener('click', openLLM);
el.clearBtn.addEventListener('click', clearScreen);
el.pauseTaskBtn.addEventListener('click', pauseRecognitionTask);
el.resumeTaskBtn.addEventListener('click', resumeRecognitionTask);
el.cancelTaskBtn.addEventListener('click', cancelRecognitionTask);
el.importBtn.addEventListener('click', importCalendar);
el.groups.addEventListener('scroll', () => {
  uiState.scrollTop = currentScrollTop();
  saveUiState();
});
window.addEventListener('beforeunload', saveUiState);

applyStaticText();
loadUiState();
refresh().catch((error) => actionError(t('loadFailed'), error));
