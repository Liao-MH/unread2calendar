import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const panelJs = fs.readFileSync(path.resolve('thunderbird-addon/sidebar/panel.js'), 'utf8');
const backgroundJs = fs.readFileSync(path.resolve('thunderbird-addon/background.js'), 'utf8');

assert.doesNotMatch(
  panelJs,
  /const openMessageIfAny = async \(\)/,
  'decision actions should no longer force-open mail before state updates'
);

assert.doesNotMatch(
  backgroundJs,
  /browser\.messageDisplay\.open\(/,
  'opening message should avoid popup fallback API that may steal focus or close panel'
);

assert.match(
  backgroundJs,
  /manualOverride:\s*true/,
  'decision updates should set manual override locks to avoid scan-time rollback'
);
assert.match(
  backgroundJs,
  /isStickyConflict/,
  'merge flow should block incoming scan updates from overwriting locked decisions'
);

console.log('decision and mail-open policy tests passed');
