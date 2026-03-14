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
    themeId: 'follow_tb',
    overrides: Object.freeze({
      basic: Object.freeze({}),
      advanced: Object.freeze({})
    }),
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
    if (src.themeId) out.themeId = src.themeId;
    if (src.overrides && typeof src.overrides === 'object') out.overrides = clone(src.overrides);
    if (src.basic && typeof src.basic === 'object') Object.assign(out.basic, src.basic);
    if (src.advanced && typeof src.advanced === 'object') Object.assign(out.advanced, src.advanced);
    return out;
  }

  function legacyThemeIdFromAppearance(raw) {
    const mode = raw && typeof raw === 'object' ? String(raw.mode || '').trim() : '';
    const presetId = raw && typeof raw === 'object' ? String(raw.presetId || '').trim() : '';
    if (mode === 'follow_tb') return 'follow_tb';
    if (mode === 'custom') return 'custom';
    if (mode === 'preset') {
      if (presetId && presetId !== 'system' && Object.prototype.hasOwnProperty.call(PRESETS, presetId)) {
        return presetId;
      }
      return 'contrast_light';
    }
    if (presetId && presetId !== 'system' && Object.prototype.hasOwnProperty.call(PRESETS, presetId)) {
      return presetId;
    }
    return '';
  }

  function resolveThemeId(raw) {
    const warnings = [];
    const rawThemeId = String(raw && raw.themeId || '').trim();
    const candidateThemeId = rawThemeId || legacyThemeIdFromAppearance(raw) || DEFAULT_APPEARANCE.themeId;
    const validThemeIds = new Set(['follow_tb', 'custom', ...Object.keys(PRESETS)]);
    const themeId = validThemeIds.has(candidateThemeId) ? candidateThemeId : DEFAULT_APPEARANCE.themeId;
    if (themeId !== candidateThemeId) warnings.push('themeId');
    return { themeId, warnings };
  }

  function normalizeResolvedAppearance(input) {
    const warnings = [];
    const raw = input && typeof input === 'object' ? input : {};
    const merged = mergeAppearance(DEFAULT_APPEARANCE, raw);
    const themeId = String(raw.themeId || merged.themeId || DEFAULT_APPEARANCE.themeId).trim() || DEFAULT_APPEARANCE.themeId;

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
    return {
      appearance: {
        themeId,
        overrides: clone((raw.overrides && typeof raw.overrides === 'object') ? raw.overrides : DEFAULT_APPEARANCE.overrides),
        basic,
        advanced
      },
      warnings
    };
  }

  function resolvePresetId(themeId, options) {
    if (themeId === 'follow_tb') {
      return options && options.isThunderbirdDark ? 'contrast_dark' : 'contrast_light';
    }
    return themeId;
  }

  function buildThemeBaseAppearance(themeId, options) {
    const presetId = resolvePresetId(themeId, options);
    const preset = themeId === 'custom' ? {} : (PRESETS[presetId] || {});
    return normalizeResolvedAppearance({
      ...mergeAppearance(DEFAULT_APPEARANCE, preset),
      themeId,
      overrides: clone(DEFAULT_APPEARANCE.overrides)
    }).appearance;
  }

  function diffGroupStyles(baseStyles, effectiveStyles) {
    const out = {};
    const keys = new Set([
      ...Object.keys(baseStyles || {}),
      ...Object.keys(effectiveStyles || {})
    ]);
    for (const key of keys) {
      const base = baseStyles && baseStyles[key] ? baseStyles[key] : { accent: '', bg: '' };
      const effective = effectiveStyles && effectiveStyles[key] ? effectiveStyles[key] : { accent: '', bg: '' };
      const next = {};
      if (String(effective.accent || '') !== String(base.accent || '')) next.accent = effective.accent;
      if (String(effective.bg || '') !== String(base.bg || '')) next.bg = effective.bg;
      if (Object.keys(next).length > 0) out[key] = next;
    }
    return out;
  }

  function buildOverrides(base, effective) {
    const basic = {};
    const basicKeys = [
      'textColor', 'baseFontSize', 'titleBold', 'eventGap', 'groupGap', 'moduleBg', 'buttonBg', 'buttonText'
    ];
    for (const key of basicKeys) {
      if (effective.basic[key] !== base.basic[key]) basic[key] = effective.basic[key];
    }

    const advanced = {};
    const advancedKeys = [
      'groupTitleColor', 'groupTitleSize', 'itemTitleColor', 'itemTitleSize', 'metaColor', 'metaSize',
      'statusColor', 'statusSize', 'cardBg', 'cardBorderColor', 'cardRadius', 'cardShadow',
      'cardMinHeight', 'cardPaddingY', 'cardPaddingX', 'cardGap', 'actionGap'
    ];
    for (const key of advancedKeys) {
      if (effective.advanced[key] !== base.advanced[key]) advanced[key] = effective.advanced[key];
    }

    const groupStyles = diffGroupStyles(
      base.advanced && base.advanced.groupStyles,
      effective.advanced && effective.advanced.groupStyles
    );
    if (Object.keys(groupStyles).length > 0) advanced.groupStyles = groupStyles;

    return { basic, advanced };
  }

  function normalizeAppearance(input, options) {
    const raw = input && typeof input === 'object' ? input : {};
    const themeResult = resolveThemeId(raw);
    const themeId = themeResult.themeId;
    const base = buildThemeBaseAppearance(themeId, options);
    const rawOverrides = raw.overrides && typeof raw.overrides === 'object'
      ? raw.overrides
      : {
        basic: raw.basic && typeof raw.basic === 'object' ? raw.basic : {},
        advanced: raw.advanced && typeof raw.advanced === 'object' ? raw.advanced : {}
      };
    const candidate = mergeAppearance(base, {
      themeId,
      basic: rawOverrides.basic,
      advanced: rawOverrides.advanced
    });
    const normalizedResult = normalizeResolvedAppearance(candidate);
    const effective = normalizedResult.appearance;
    const overrides = buildOverrides(base, effective);
    return {
      appearance: {
        themeId,
        basic: effective.basic,
        advanced: effective.advanced,
        overrides
      },
      warnings: [...themeResult.warnings, ...normalizedResult.warnings]
    };
  }

  function effectiveAppearance(input, options) {
    return normalizeAppearance(input, options).appearance;
  }

  function toCssVariables(input, options) {
    const appearance = effectiveAppearance(input, options);
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
