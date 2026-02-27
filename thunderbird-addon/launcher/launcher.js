'use strict';

const line = document.getElementById('line');

(async () => {
  try {
    await browser.runtime.sendMessage({ type: 'todo:open-pane', source: 'action-popup' });
    window.close();
  } catch (error) {
    const msg = error && error.message ? error.message : String(error || 'unknown');
    line.className = 'err';
    line.textContent = `打开失败:\n${msg}`;
  }
})();
