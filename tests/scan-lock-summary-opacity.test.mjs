import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const backgroundJs = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');
const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');

assert.match(
  backgroundJs,
  /state\.scan\.roundId/,
  'scan state should track recognition round id'
);

assert.match(
  backgroundJs,
  /decisionRoundId/,
  'decision actions should store decision round id for same-round lock'
);

assert.match(
  backgroundJs,
  /buildFinalSummaryLine\s*\(\s*processed\s*,\s*extracted\s*,\s*totalMs\s*,\s*llmMs\s*\)/,
  'final status line should include total and LLM elapsed time'
);

assert.match(
  panelJs,
  /window\.addEventListener\('mouseleave',[\s\S]*applyWindowOpacity\(0\.3\)/,
  'panel should fade to 30% opacity when cursor leaves window'
);

assert.match(
  panelJs,
  /window\.addEventListener\('mouseenter',[\s\S]*applyWindowOpacity\(1\)/,
  'panel should restore to full opacity when cursor returns'
);

console.log('scan lock summary opacity tests passed');
