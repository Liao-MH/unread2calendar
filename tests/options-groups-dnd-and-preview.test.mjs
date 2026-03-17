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
assert.match(optionsHtml, /\.preview-frame\s*\{[^}]*grid-template-rows:\s*auto\s+auto\s+auto\s+minmax\(0,\s*1fr\)\s+auto\s+auto\s+auto;/, 'appearance preview should mirror the main panel shell with a dedicated scrollable middle row');
assert.match(optionsHtml, /\.preview-frame\s*\{[^}]*overflow:\s*hidden;/, 'appearance preview shell should keep scrolling inside the middle groups area');
assert.match(optionsHtml, /\.preview-groups\s*\{[^}]*overflow:\s*auto;/, 'appearance preview should expose a dedicated scrollable groups area');
assert.match(optionsHtml, /\.preview-hint\s*\{[^}]*color:\s*#7c4a03;/, 'appearance preview hint should keep high-contrast text');
assert.match(optionsHtml, /\.preview-empty\s*\{[^}]*color:\s*#8b95a7;/, 'appearance preview should expose the empty-state line styling');

assert.match(optionsJs, /GROUP_ACCENT_PALETTE/, 'options should define non-repeating default group color palette');
assert.match(optionsJs, /function nextUniqueAccent\(/, 'options should support hybrid palette-and-hash color assignment');
assert.match(optionsJs, /usedAccents\.has\(normalizedAccent\)/, 'options should reassign duplicate configured accents to unique defaults');
assert.match(optionsJs, /function renderAppearancePreview\(/, 'options should render interactive appearance preview');
assert.doesNotMatch(optionsJs, /state\.groupDefinitions\.slice\(0,\s*3\)/, 'appearance preview should not truncate to only three groups');
assert.match(optionsJs, /const defs = Array\.isArray\(state\.groupDefinitions\) \? state\.groupDefinitions : \[\];/, 'appearance preview should render all configured groups');
assert.match(optionsJs, /const hint = document\.createElement\('section'\);[\s\S]*hint\.className = 'preview-hint';/, 'appearance preview should render the setup hint block');
assert.match(optionsJs, /const empty = document\.createElement\('div'\);[\s\S]*empty\.className = 'preview-empty';/, 'appearance preview should render the empty-state line');
assert.match(optionsJs, /const groupsHost = document\.createElement\('div'\);[\s\S]*groupsHost\.className = 'preview-groups';/, 'appearance preview should render groups inside a dedicated scrollable container');
assert.match(optionsJs, /const importedHost = document\.createElement\('section'\);[\s\S]*importedHost\.className = 'preview-imported-host';/, 'appearance preview should render a bottom imported section shell');
assert.match(optionsJs, /group\.style\.borderColor = style\.accent \|\| '#6b7280';/, 'appearance preview should tint group containers with the group accent');
assert.match(optionsJs, /head\.style\.borderBottomColor = style\.accent \|\| '#6b7280';/, 'appearance preview should tint group headers with the group accent');
assert.match(optionsJs, /if \(style\.bg\) \{\s*group\.style\.background = style\.bg;/, 'appearance preview should apply group background color to the whole preview group');
assert.match(optionsJs, /if \(style\.bg\) \{\s*items\.style\.background = style\.bg;/, 'appearance preview should carry group background color into the preview item zone');
assert.match(optionsHtml, /\.preview-group\s*\{[^}]*overflow:\s*hidden;/, 'appearance preview group containers should clip inner header and body to the card radius');
assert.match(optionsHtml, /\.preview-item\s*\{[^}]*overflow:\s*hidden;/, 'appearance preview item cards should clip inner content to the card radius');
assert.match(optionsHtml, /\.preview-group-head\s*\{[^}]*min-width:\s*0;/, 'appearance preview group headers should allow inner text to shrink instead of overflowing');
assert.match(optionsHtml, /\.preview-group-head\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto;/, 'appearance preview group headers should reserve space for title and toggle without overlap');
assert.match(optionsHtml, /\.preview-item-title\s*\{[^}]*overflow-wrap:\s*anywhere;/, 'appearance preview titles should wrap instead of being visually clipped');
assert.match(optionsHtml, /\.preview-item-meta\s*\{[^}]*overflow-wrap:\s*anywhere;/, 'appearance preview meta text should wrap instead of being visually clipped');
assert.match(optionsJs, /items\.appendChild\(makeItem\(false\)\);/, 'appearance preview items should default to expanded so time and location remain visible');
assert.match(optionsJs, /状态：Ready\./, 'appearance preview footer should mirror the real panel status line');
assert.match(optionsJs, /chip\.draggable\s*=\s*true/, 'options should enable draggable chips for llm groups');
assert.match(optionsJs, /addEventListener\('drop'/, 'options should handle drop reorder for llm groups');
assert.match(optionsJs, /state\.groupDefinitions\.splice\(from, 1\)/, 'options should reorder group definitions on drop');

console.log('options groups dnd and preview tests passed');
