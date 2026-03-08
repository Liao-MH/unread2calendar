import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const impl = fs.readFileSync(path.resolve('thunderbird-addon/api/tbMailPane/implementation.js'), 'utf8');

assert.match(impl, /overlayId:\s*["']e2c-todo-pane-overlay["']/, 'mailpane host should define an inline overlay container');
assert.match(impl, /retryButtonId:\s*["']e2c-todo-pane-retry["']/, 'mailpane host should define a retry button for inline fallback');
assert.doesNotMatch(impl, /new URL\(/, 'mailpane parent implementation should not depend on the global URL constructor');
assert.match(impl, /setPaneLoadState\([^)]*["']loading["']/, 'mailpane host should enter loading state while embedded content initializes');
assert.match(impl, /setPaneLoadState\([^)]*["']ready["']/, 'mailpane host should enter ready state once embedded content reports success');
assert.match(impl, /setPaneLoadState\([^)]*["']error["']/, 'mailpane host should enter error state when embedded content does not become ready');
assert.match(impl, /retryButton\.addEventListener\(["']command["']/, 'mailpane fallback should support inline retry');
assert.match(impl, /mailpaneToken=\$\{encodeURIComponent\(String\(token \|\| ""\)\)\}/, 'embedded panel loads should include a mailpane token for readiness tracking');

console.log('mailpane fallback tests passed');
