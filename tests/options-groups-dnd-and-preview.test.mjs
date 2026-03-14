import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const optionsHtml = fs.readFileSync(path.resolve('thunderbird-addon/options/options.html'), 'utf8');
const optionsJs = fs.readFileSync(path.resolve('thunderbird-addon/options/options.js'), 'utf8');

assert.match(optionsHtml, /id="llmGroupsSortHint"/, 'options should show llm group sort hint');
assert.match(optionsHtml, /id="appearancePreviewRoot"/, 'options should render appearance preview root');
assert.match(optionsHtml, /appearance-layout/, 'options should split appearance into edit and preview columns');
assert.match(optionsHtml, /id="appearanceActionGap"/, 'options should expose independent action-button gap control');
assert.match(optionsHtml, /事件卡片间距/, 'options should name event gap as card-to-card spacing');

assert.match(optionsJs, /GROUP_ACCENT_PALETTE/, 'options should define non-repeating default group color palette');
assert.match(optionsJs, /function nextUniqueAccent\(/, 'options should support hybrid palette-and-hash color assignment');
assert.match(optionsJs, /usedAccents\.has\(normalizedAccent\)/, 'options should reassign duplicate configured accents to unique defaults');
assert.match(optionsJs, /function renderAppearancePreview\(/, 'options should render interactive appearance preview');
assert.doesNotMatch(optionsJs, /state\.groupDefinitions\.slice\(0,\s*3\)/, 'appearance preview should not truncate to only three groups');
assert.match(optionsJs, /const defs = Array\.isArray\(state\.groupDefinitions\) \? state\.groupDefinitions : \[\];/, 'appearance preview should render all configured groups');
assert.match(optionsJs, /group\.style\.borderColor = style\.accent \|\| '#6b7280';/, 'appearance preview should tint group containers with the group accent');
assert.match(optionsJs, /head\.style\.borderBottomColor = style\.accent \|\| '#6b7280';/, 'appearance preview should tint group headers with the group accent');
assert.match(optionsJs, /if \(style\.bg\) \{\s*group\.style\.background = style\.bg;/, 'appearance preview should apply group background color to the whole preview group');
assert.match(optionsJs, /if \(style\.bg\) \{\s*items\.style\.background = style\.bg;/, 'appearance preview should carry group background color into the preview item zone');
assert.match(optionsJs, /chip\.draggable\s*=\s*true/, 'options should enable draggable chips for llm groups');
assert.match(optionsJs, /addEventListener\('drop'/, 'options should handle drop reorder for llm groups');
assert.match(optionsJs, /state\.groupDefinitions\.splice\(from, 1\)/, 'options should reorder group definitions on drop');

console.log('options groups dnd and preview tests passed');
