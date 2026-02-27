'use strict';

(function initAppearanceModule(global) {
  const DEFAULT_GROUP_STYLES = Object.freeze({
    important: Object.freeze({ accent: '#d97706', bg: '' }),
    academic: Object.freeze({ accent: '#2563eb', bg: '' }),
    course: Object.freeze({ accent: '#0891b2', bg: '' }),
    activity: Object.freeze({ accent: '#16a34a', bg: '' }),
    other: Object.freeze({ accent: '#6b7280', bg: '' }),
    unrecognized: Object.freeze({ accent: '#7c3aed', bg: '' })
  });

  const DEFAULT_APPEARANCE = Object.freeze({
    mode: 'follow_tb',
    presetId: 'system',
    basic: Object.freeze({
      textColor: '#141824',
      baseFontSize: 14,
      titleBold: true,
      eventGap: 8,
      groupGap: 10,
      moduleBg: '#ffffff',
      buttonBg: '#146ef5',
      buttonText: '#ffffff'
    }),
    advanced: Object.freeze({
      groupTitleColor: '#111827',
      groupTitleSize: 14,
      itemTitleColor: '#111827',
      itemTitleSize: 13,
      metaColor: '#4b5565',
      metaSize: 12,
      statusColor: '#4b5565',
      statusSize: 11,
      cardBg: '#ffffff',
      cardBorderColor: '#d8dee7',
      cardRadius: 10,
      cardShadow: 0,
      cardMinHeight: 0,
      cardPaddingY: 8,
      cardPaddingX: 8,
      cardGap: 8,
      actionGap: 8,
      groupStyles: DEFAULT_GROUP_STYLES
    })
  });

  const PRESETS = Object.freeze({
    system: {},
    contrast_light: {
      basic: { textColor: '#0f172a', moduleBg: '#ffffff', buttonBg: '#0b5fff', buttonText: '#ffffff' },
      advanced: { cardBg: '#ffffff', cardBorderColor: '#94a3b8', metaColor: '#334155', statusColor: '#334155' }
    },
    contrast_dark: {
      basic: { textColor: '#e5e7eb', moduleBg: '#111827', buttonBg: '#3b82f6', buttonText: '#ffffff' },
      advanced: { cardBg: '#1f2937', cardBorderColor: '#4b5563', groupTitleColor: '#f3f4f6', itemTitleColor: '#f3f4f6', metaColor: '#d1d5db', statusColor: '#d1d5db' }
    },
    soft_eye: {
      basic: { textColor: '#2f3a2f', moduleBg: '#f6f8f1', buttonBg: '#5f7f50', buttonText: '#ffffff' },
      advanced: { cardBg: '#fbfcf8', cardBorderColor: '#cbd5c0', metaColor: '#5b6b54', statusColor: '#5b6b54' }
    },
    academic_bluegray: {
      basic: { textColor: '#1d2a3b', moduleBg: '#eef3f9', buttonBg: '#315a8a', buttonText: '#ffffff' },
      advanced: { cardBg: '#f8fbff', cardBorderColor: '#b8c8dc', metaColor: '#52657a', statusColor: '#52657a' }
    },
    vibrant_orangegreen: {
      basic: { textColor: '#2f2a1f', moduleBg: '#fff7eb', buttonBg: '#ea7a1f', buttonText: '#ffffff' },
      advanced: { cardBg: '#fffdf7', cardBorderColor: '#f2b880', metaColor: '#5f6d33', statusColor: '#5f6d33' }
    }
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clampNumber(value, fallback, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function normalizeColor(value, fallback) {
    const text = String(value || '').trim();
    const hex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const fnColor = /^(?:rgb|rgba|hsl|hsla)\(([^)]+)\)$/i;
    if (hex.test(text) || fnColor.test(text)) return text;
    return fallback;
  }

  function mergeAppearance(base, patch) {
    const out = clone(base);
    const src = patch && typeof patch === 'object' ? patch : {};
    if (src.mode) out.mode = src.mode;
    if (src.presetId) out.presetId = src.presetId;
    if (src.basic && typeof src.basic === 'object') Object.assign(out.basic, src.basic);
    if (src.advanced && typeof src.advanced === 'object') Object.assign(out.advanced, src.advanced);
    return out;
  }

  function normalizeAppearance(input) {
    const warnings = [];
    const raw = input && typeof input === 'object' ? input : {};
    const merged = mergeAppearance(DEFAULT_APPEARANCE, raw);
    const mode = ['follow_tb', 'preset', 'custom'].includes(merged.mode) ? merged.mode : DEFAULT_APPEARANCE.mode;
    if (mode !== merged.mode) warnings.push('mode');
    const presetId = Object.prototype.hasOwnProperty.call(PRESETS, merged.presetId) ? merged.presetId : DEFAULT_APPEARANCE.presetId;
    if (presetId !== merged.presetId) warnings.push('presetId');

    const basic = {
      textColor: normalizeColor(merged.basic.textColor, DEFAULT_APPEARANCE.basic.textColor),
      baseFontSize: clampNumber(merged.basic.baseFontSize, DEFAULT_APPEARANCE.basic.baseFontSize, 10, 24),
      titleBold: !!merged.basic.titleBold,
      eventGap: clampNumber(merged.basic.eventGap, DEFAULT_APPEARANCE.basic.eventGap, 0, 24),
      groupGap: clampNumber(merged.basic.groupGap, DEFAULT_APPEARANCE.basic.groupGap, 0, 32),
      moduleBg: normalizeColor(merged.basic.moduleBg, DEFAULT_APPEARANCE.basic.moduleBg),
      buttonBg: normalizeColor(merged.basic.buttonBg, DEFAULT_APPEARANCE.basic.buttonBg),
      buttonText: normalizeColor(merged.basic.buttonText, DEFAULT_APPEARANCE.basic.buttonText)
    };
    const rawGroupStyles = merged.advanced && merged.advanced.groupStyles && typeof merged.advanced.groupStyles === 'object'
      ? merged.advanced.groupStyles
      : {};
    const normalizedGroupStyles = {};
    for (const [groupKey, defaults] of Object.entries(DEFAULT_GROUP_STYLES)) {
      const src = rawGroupStyles[groupKey] && typeof rawGroupStyles[groupKey] === 'object'
        ? rawGroupStyles[groupKey]
        : {};
      const accent = normalizeColor(src.accent, defaults.accent);
      if (src.accent != null && accent !== src.accent) warnings.push(`groupStyles.${groupKey}.accent`);
      let bg = '';
      const rawBg = src.bg == null ? '' : String(src.bg).trim();
      if (rawBg) {
        bg = normalizeColor(rawBg, '');
        if (!bg) warnings.push(`groupStyles.${groupKey}.bg`);
      }
      normalizedGroupStyles[groupKey] = { accent, bg };
    }

    const advanced = {
      groupTitleColor: normalizeColor(merged.advanced.groupTitleColor, DEFAULT_APPEARANCE.advanced.groupTitleColor),
      groupTitleSize: clampNumber(merged.advanced.groupTitleSize, DEFAULT_APPEARANCE.advanced.groupTitleSize, 10, 24),
      itemTitleColor: normalizeColor(merged.advanced.itemTitleColor, DEFAULT_APPEARANCE.advanced.itemTitleColor),
      itemTitleSize: clampNumber(merged.advanced.itemTitleSize, DEFAULT_APPEARANCE.advanced.itemTitleSize, 10, 22),
      metaColor: normalizeColor(merged.advanced.metaColor, DEFAULT_APPEARANCE.advanced.metaColor),
      metaSize: clampNumber(merged.advanced.metaSize, DEFAULT_APPEARANCE.advanced.metaSize, 9, 20),
      statusColor: normalizeColor(merged.advanced.statusColor, DEFAULT_APPEARANCE.advanced.statusColor),
      statusSize: clampNumber(merged.advanced.statusSize, DEFAULT_APPEARANCE.advanced.statusSize, 9, 20),
      cardBg: normalizeColor(merged.advanced.cardBg, DEFAULT_APPEARANCE.advanced.cardBg),
      cardBorderColor: normalizeColor(merged.advanced.cardBorderColor, DEFAULT_APPEARANCE.advanced.cardBorderColor),
      cardRadius: clampNumber(merged.advanced.cardRadius, DEFAULT_APPEARANCE.advanced.cardRadius, 0, 24),
      cardShadow: clampNumber(merged.advanced.cardShadow, DEFAULT_APPEARANCE.advanced.cardShadow, 0, 24),
      cardMinHeight: clampNumber(merged.advanced.cardMinHeight, DEFAULT_APPEARANCE.advanced.cardMinHeight, 0, 300),
      cardPaddingY: clampNumber(merged.advanced.cardPaddingY, DEFAULT_APPEARANCE.advanced.cardPaddingY, 0, 36),
      cardPaddingX: clampNumber(merged.advanced.cardPaddingX, DEFAULT_APPEARANCE.advanced.cardPaddingX, 0, 36),
      cardGap: clampNumber(merged.advanced.cardGap, DEFAULT_APPEARANCE.advanced.cardGap, 0, 36),
      actionGap: clampNumber(merged.advanced.actionGap, DEFAULT_APPEARANCE.advanced.actionGap, 0, 36),
      groupStyles: normalizedGroupStyles
    };
    const normalized = { mode, presetId, basic, advanced };
    return { appearance: normalized, warnings };
  }

  function effectiveAppearance(input) {
    const { appearance } = normalizeAppearance(input);
    const preset = PRESETS[appearance.presetId] || {};
    const mergedPreset = mergeAppearance(appearance, preset);
    return normalizeAppearance(mergedPreset).appearance;
  }

  function toCssVariables(input, options) {
    const appearance = effectiveAppearance(input);
    const mode = appearance.mode;
    const out = Object.create(null);

    out['--e2c-base-font-size'] = `${appearance.basic.baseFontSize}px`;
    out['--e2c-title-weight'] = appearance.basic.titleBold ? '700' : '600';
    out['--e2c-event-gap'] = `${appearance.basic.eventGap}px`;
    out['--e2c-group-gap'] = `${appearance.basic.groupGap}px`;
    out['--e2c-group-title-size'] = `${appearance.advanced.groupTitleSize}px`;
    out['--e2c-item-title-size'] = `${appearance.advanced.itemTitleSize}px`;
    out['--e2c-meta-size'] = `${appearance.advanced.metaSize}px`;
    out['--e2c-status-size'] = `${appearance.advanced.statusSize}px`;
    out['--e2c-card-radius'] = `${appearance.advanced.cardRadius}px`;
    out['--e2c-card-shadow'] = `0 0 ${appearance.advanced.cardShadow}px rgba(0, 0, 0, 0.16)`;
    out['--e2c-card-min-height'] = `${appearance.advanced.cardMinHeight}px`;
    out['--e2c-card-padding-y'] = `${appearance.advanced.cardPaddingY}px`;
    out['--e2c-card-padding-x'] = `${appearance.advanced.cardPaddingX}px`;
    out['--e2c-card-gap'] = `${appearance.advanced.cardGap}px`;
    out['--e2c-action-gap'] = `${appearance.advanced.actionGap}px`;

    if (mode !== 'follow_tb') {
      out['--e2c-text-color'] = appearance.basic.textColor;
      out['--e2c-module-bg'] = appearance.basic.moduleBg;
      out['--e2c-button-bg'] = appearance.basic.buttonBg;
      out['--e2c-button-text'] = appearance.basic.buttonText;
      out['--e2c-group-title-color'] = appearance.advanced.groupTitleColor;
      out['--e2c-item-title-color'] = appearance.advanced.itemTitleColor;
      out['--e2c-meta-color'] = appearance.advanced.metaColor;
      out['--e2c-status-color'] = appearance.advanced.statusColor;
      out['--e2c-card-bg'] = appearance.advanced.cardBg;
      out['--e2c-card-border'] = appearance.advanced.cardBorderColor;
    }

    void options;
    return out;
  }

  function applyCssVariables(node, map) {
    if (!node || !node.style || !map) return;
    const keys = [
      '--e2c-text-color',
      '--e2c-module-bg',
      '--e2c-button-bg',
      '--e2c-button-text',
      '--e2c-group-title-color',
      '--e2c-item-title-color',
      '--e2c-meta-color',
      '--e2c-status-color',
      '--e2c-card-bg',
      '--e2c-card-border',
      '--e2c-base-font-size',
      '--e2c-title-weight',
      '--e2c-event-gap',
      '--e2c-group-gap',
      '--e2c-group-title-size',
      '--e2c-item-title-size',
      '--e2c-meta-size',
      '--e2c-status-size',
      '--e2c-card-radius',
      '--e2c-card-shadow',
      '--e2c-card-min-height',
      '--e2c-card-padding-y',
      '--e2c-card-padding-x',
      '--e2c-card-gap',
      '--e2c-action-gap'
    ];
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        node.style.setProperty(key, String(map[key]));
      } else {
        node.style.removeProperty(key);
      }
    }
  }

  global.Unread2CalendarAppearance = {
    DEFAULT_APPEARANCE: clone(DEFAULT_APPEARANCE),
    PRESETS: clone(PRESETS),
    normalizeAppearance,
    effectiveAppearance,
    toCssVariables,
    applyCssVariables
  };
}(globalThis));
