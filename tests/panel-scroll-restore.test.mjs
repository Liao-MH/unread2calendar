import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const jsPath = path.resolve('thunderbird-addon/sidebar/panel.js');
const src = fs.readFileSync(jsPath, 'utf8');

assert.match(
  src,
  /function currentScrollTop\(\)\s*\{[\s\S]*el\.groups[\s\S]*scrollTop[\s\S]*\}/,
  'currentScrollTop should read from groups scroll only'
);
assert.doesNotMatch(
  src,
  /window\.scrollTo\(/,
  'panel should not restore window scroll to avoid topbar clipping after refresh'
);
assert.doesNotMatch(
  src,
  /window\.addEventListener\('scroll'/,
  'panel should not persist window-level scroll state'
);

console.log('panel scroll restore tests passed');
