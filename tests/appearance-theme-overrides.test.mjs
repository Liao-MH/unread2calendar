import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const appearanceSource = fs.readFileSync(path.resolve('thunderbird-addon/common/appearance.js'), 'utf8');
const context = {
  globalThis: {},
  console
};
context.globalThis = context;
vm.runInNewContext(appearanceSource, context, { filename: 'appearance.js' });

const api = context.Unread2CalendarAppearance;
assert.ok(api, 'appearance module should expose its API on globalThis');

const darkFollow = api.effectiveAppearance({
  themeId: 'follow_tb',
  overrides: {
    basic: {
      buttonBg: '#ff0000'
    }
  }
}, { isThunderbirdDark: true });
assert.equal(darkFollow.themeId, 'follow_tb', 'follow_tb should keep its theme identity after overrides');
assert.equal(darkFollow.basic.buttonBg, '#ff0000', 'follow_tb should allow manual button color overrides in dark mode');
assert.equal(darkFollow.basic.moduleBg, '#111827', 'follow_tb should still inherit the dark Thunderbird base for untouched fields');

const lightFollow = api.effectiveAppearance({
  themeId: 'follow_tb',
  overrides: {
    basic: {
      buttonBg: '#ff0000'
    }
  }
}, { isThunderbirdDark: false });
assert.equal(lightFollow.themeId, 'follow_tb', 'follow_tb should keep its theme identity after overrides in light mode');
assert.equal(lightFollow.basic.buttonBg, '#ff0000', 'follow_tb should preserve the same manual override in light mode');
assert.equal(lightFollow.basic.moduleBg, '#ffffff', 'follow_tb should still inherit the light Thunderbird base for untouched fields');

const presetNormalized = api.normalizeAppearance({
  themeId: 'contrast_dark',
  basic: {
    buttonBg: '#12ab34'
  }
}, { isThunderbirdDark: true }).appearance;
assert.equal(presetNormalized.themeId, 'contrast_dark', 'preset themes should keep their theme id after manual edits');
assert.equal(presetNormalized.basic.buttonBg, '#12ab34', 'preset themes should expose the edited effective value');
assert.equal(presetNormalized.overrides.basic.buttonBg, '#12ab34', 'preset themes should store manual edits as sparse overrides');
assert.ok(!Object.prototype.hasOwnProperty.call(presetNormalized.overrides.basic, 'moduleBg'), 'untouched preset fields should not become overrides');

console.log('appearance theme override tests passed');
