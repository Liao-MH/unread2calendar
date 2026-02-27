'use strict';

const summary = document.getElementById('summary');
const detail = document.getElementById('detail');
const contextBox = document.getElementById('context');
const refreshBtn = document.getElementById('refreshBtn');
const closeBtn = document.getElementById('closeBtn');

function text(v) {
  return String(v == null ? '' : v);
}

async function loadError() {
  try {
    const data = await browser.runtime.sendMessage({ type: 'todo:get-ui-error' });
    if (!data) {
      summary.textContent = '未找到错误记录。';
      detail.textContent = '';
      contextBox.textContent = '';
      return;
    }
    summary.textContent = `${text(data.time)} | ${text(data.context)}`;
    detail.textContent = text(data.detail);
    contextBox.textContent = JSON.stringify(data.extra || {}, null, 2);
  } catch (error) {
    summary.textContent = '读取错误详情失败';
    detail.textContent = error && error.message ? error.message : text(error);
    contextBox.textContent = '';
  }
}

refreshBtn.addEventListener('click', loadError);
closeBtn.addEventListener('click', () => window.close());

loadError();
