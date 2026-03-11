import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /host\.style\.opacity\s*=\s*"1"/, 'mailpane host should start fully opaque');
assert.doesNotMatch(impl, /paneState\.onMouseEnter/, 'mailpane host should no longer track mouseenter dimming handlers');
assert.doesNotMatch(impl, /paneState\.onMouseLeave/, 'mailpane host should no longer track mouseleave dimming handlers');
assert.doesNotMatch(impl, /opacity\s*=\s*"0\.3"/, 'mailpane host should never dim to 30 percent opacity');
assert.doesNotMatch(impl, /addEventListener\("mouseenter"/, 'mailpane host should not install mouseenter opacity listeners');
assert.doesNotMatch(impl, /addEventListener\("mouseleave"/, 'mailpane host should not install mouseleave opacity listeners');

console.log('mailpane opaque host tests passed');
