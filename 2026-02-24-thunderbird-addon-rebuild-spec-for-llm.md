# Email2Calendar Thunderbird 插件从零重建规格书（LLM/开发专用）

日期：2026-02-24  
目标：让任意大模型或新开发者在无上下文情况下，从零重建“同款能力插件”  
目标产物：可安装 XPI，具备扫描未读、候选分组、人工确认、导入日历、LLM 配置能力

---

## 1. 产品与技术边界

### 1.1 产品边界

1. 这是 Thunderbird MailExtension 插件，不是独立邮件客户端。  
2. 插件负责“识别与工作流”，不替代 Thunderbird 账户管理。  
3. UI 采用弹窗面板（popup）形态，不做强依赖四栏注入。  
4. 邮件入口和工具栏入口需打开同一能力窗口。

### 1.2 非目标

1. 不实现复杂企业后台。  
2. 不实现跨设备同步服务端。  
3. 不实现完整邮件渲染引擎替代 Thunderbird 正文区。

---

## 2. 目标功能（必须实现）

1. `Scan Unread`：扫描未读邮件并提取候选。  
2. 分组展示：学术讲座、课程相关提示、课外活动、可能重要的事、其他。  
3. 卡片交互：
   - 单击：选中并跳转源邮件
   - 双击（todo）：编辑
   - important：标记已读 / 转为待办
   - todo：确认、拒绝、恢复
4. LLM 配置页：Base URL / Model / API Key 可保存并持久化。  
5. 导入日历：
   - 优先 Thunderbird Calendar API
   - 失败兜底 ICS 下载
6. 导入后闭环：
   - 事项处理完成
   - 对应邮件标记已读
7. 可观测性：
   - 所有关键按钮有状态反馈
   - 错误不可静默

---

## 3. 工程结构（标准目录）

```text
thunderbird-addon/
  manifest.json
  background.js
  icons/
    icon-64.png
  sidebar/
    panel.html
    panel.css
    panel.js
  options/
    options.html
    options.js
scripts/
  build_thunderbird_xpi.sh
dist/
  email2calendar-thunderbird-<version>.xpi
```

---

## 4. manifest 规范（最低要求）

`manifest_version: 2`，并包含：

1. `browser_action.default_popup = sidebar/panel.html`  
2. `message_display_action.default_popup = sidebar/panel.html`  
3. 权限（最小可用集）：
   - `storage`
   - `accountsRead`
   - `messagesRead`
   - `messagesModify`
   - `downloads`
   - `tabs`
4. `options_ui.page = options/options.html`  
5. `background.scripts = ["background.js"]`

---

## 5. 数据模型（强约束）

## 5.1 存储键

1. `STORAGE_KEY = "todoItems.v1"`  
2. `SETTINGS_KEY = "todoSettings.v1"`

## 5.2 TodoItem 结构

```json
{
  "id": "todo-<...>",
  "sourceMessageId": 12345,
  "sourceAuthor": "sender@example.com",
  "kind": "todo | important",
  "status": "pending | queued | rejected | done | read_marked | converted",
  "title": "string",
  "startText": "string",
  "endText": "string",
  "location": "string",
  "notes": "string",
  "confidence": 0.0,
  "group": "academic | course | activity | important | other",
  "groupLabel": "string",
  "duplicateCount": 1,
  "displayTitle": "string",
  "reminderPolicy": "standard_two | fallback_plus_1h",
  "edited": false,
  "manualOverride": false,
  "createdAt": 0,
  "updatedAt": 0
}
```

## 5.3 Settings 结构

```json
{
  "llmBaseUrl": "",
  "llmModel": "",
  "llmApiKey": ""
}
```

## 5.4 扫描状态结构

```json
{
  "running": false,
  "phase": "idle | counting | scanning | done",
  "total": 0,
  "processed": 0,
  "extracted": 0,
  "failed": 0
}
```

---

## 6. 消息协议（panel/options 与 background）

必须实现以下 message type：

1. `todo:get-view-model`  
2. `todo:refresh-active`  
3. `todo:list-accounts`  
4. `todo:scan-all-unread`  
5. `todo:select`  
6. `todo:update`  
7. `todo:queue`  
8. `todo:reject`  
9. `todo:restore`  
10. `todo:mark-important-read`  
11. `todo:convert-important`  
12. `todo:batch-import`  
13. `todo:get-settings`  
14. `todo:set-settings`  
15. `todo:state-changed`（background 主动广播）

### 6.1 ViewModel 推荐结构

```json
{
  "context": {
    "messageId": 1,
    "subject": "",
    "author": "",
    "date": "",
    "snippet": ""
  },
  "selectedTodoId": "todo-...",
  "needsLLMSetup": true,
  "groups": [
    {
      "key": "academic",
      "label": "学术讲座",
      "count": 3,
      "items": []
    }
  ],
  "nextStep": {
    "pendingTodo": 0,
    "pendingImportant": 0,
    "queuedTodo": 2,
    "rejectedTodo": 1,
    "readyForImport": true
  },
  "scan": {
    "running": false,
    "phase": "done",
    "total": 30,
    "processed": 30,
    "extracted": 9,
    "failed": 0
  }
}
```

---

## 7. 业务状态机（必须一致）

## 7.1 todo 状态机

1. `pending -> queued -> done`  
2. `pending -> rejected -> pending`  
3. `pending/queued/rejected -> done`（批量导入后收敛）

## 7.2 important 状态机

1. `pending -> read_marked`  
2. `pending -> converted`，并新增一个 `todo(pending)`

## 7.3 可视规则

1. `rejected/read_marked/converted` 默认灰化。  
2. `done` 默认不在主列表展示。

---

## 8. 候选抽取策略（LLM + 本地规则）

### 8.1 模式选择

1. 若 `llmBaseUrl + llmModel + llmApiKey` 均非空，则走 LLM 抽取。  
2. 否则走本地规则抽取。  
3. 结果必须归一化为统一 TodoItem 结构。

### 8.2 本地规则最低实现

1. 从 `subject + snippet` 抽关键词。  
2. 识别时间（正则）、地点（zoom/room/building 等）。  
3. 打分并过滤低分噪声。  
4. 按关键词映射分组：
   - seminar/lecture/talk -> academic
   - course/class/homework -> course
   - activity/club/event -> activity
   - 非 noreply 且看似个人邮件 -> important
   - 其他 -> other

### 8.3 LLM 输出约束

LLM 必须输出纯 JSON，字段：

```json
{
  "kind": "todo|important|ignore",
  "group": "academic|course|activity|important|other",
  "title": "",
  "startText": "",
  "endText": "",
  "location": "",
  "notes": "",
  "confidence": 0.7
}
```

若 `kind=ignore` 则丢弃。  
`group` 必须做白名单校验，不合法回退 `other`。

---

## 9. 重复项策略

1. 归一化键：`normalize(title) + normalize(hour(startTime))`。  
2. 同键数量 > 1 时：  
   - `duplicateCount = N`  
   - `displayTitle = "[重复xN] " + title`
3. 编辑或转换后必须重算重复标记。

---

## 10. 关键交互实现要求（逐按钮）

### 10.1 Scan Unread

1. 点击后立刻状态反馈。  
2. 扫描开始：`phase=counting/scanning`。  
3. 逐条处理时更新 `processed`。  
4. 结束：`running=false, phase=done`。

### 10.2 LLM 按钮

1. 打开 options 页。  
2. 如 `openOptionsPage` 不可用，fallback `tabs.create(runtime.getURL(...))`。  
3. 失败必须状态提示。

### 10.3 卡片单/双击

1. 单击：`todo:select + openMessage=true`。  
2. 双击：仅 `todo` 开编辑区，`important` 不进入通用编辑。

### 10.4 important 两键

1. `mark-important-read`：邮件 `read=true`。  
2. `convert-important`：创建 `todo`；缺字段允许 fallback。

### 10.5 Import Calendar

1. 收集 `todo + queued` 导入。  
2. `rejected` 与导入项都执行邮件标已读。  
3. 状态统一收敛为 `done`。

---

## 11. 日历写入与提醒实现

## 11.1 Calendar API 路径

1. 取第一个可用 calendar。  
2. 写入 title/start/end/location/description。  
3. 添加 alarms（若 API 支持）。

## 11.2 ICS 兜底

1. 生成 `VCALENDAR/VEVENT`。  
2. 包含 `UID/DTSTAMP/DTSTART/DTEND/SUMMARY/...`。  
3. 添加 `VALARM`：
   - 标准：`-PT1H` + `-P1DT4H`
   - 兜底：`PT1H`
4. `downloads.download(saveAs=true)` 触发用户保存。

---

## 12. 设置页实现（必须稳定）

推荐直接 `browser.storage.local` 读写（避免消息链路耦合）：

1. `load()`：读取 `SETTINGS_KEY` 回填输入框。  
2. `save()`：写入 `SETTINGS_KEY`。  
3. 保存成功显示 `Saved/已保存`。  
4. 失败显示 `Save failed: reason`。  
5. 关闭重开应可读到上次值。

---

## 13. 可观测性与防静默失败

1. 所有主操作必须更新状态栏文本。  
2. 面板注册：
   - `window.onerror`
   - `window.onunhandledrejection`
3. 错误显示格式：`<Action> failed: <reason>`。  
4. 错误信息不应瞬间清空。

---

## 14. 打包与发布流程

1. 修改后语法检查：
```bash
node --check thunderbird-addon/background.js
node --check thunderbird-addon/sidebar/panel.js
node --check thunderbird-addon/options/options.js
```
2. 升版本：`manifest.json`。  
3. 打包：
```bash
./scripts/build_thunderbird_xpi.sh
```
4. 验证产物存在：`dist/email2calendar-thunderbird-<version>.xpi`。  
5. 安装新包前建议先卸载旧版本，避免缓存。

---

## 15. 最小回归测试（必须通过）

1. 安装后显示正确版本号。  
2. 顶部入口可打开 Todo 面板。  
3. 邮件入口可打开 Todo 面板。  
4. LLM 设置可保存并持久化。  
5. Scan Unread 可执行且有进度。  
6. 分组与计数显示正常。  
7. 单击跳转邮件、双击编辑生效。  
8. important 两键生效。  
9. 导入成功并邮件标已读。  
10. 全流程无白屏、无静默失败。

---

## 16. 已知高风险点（重建时重点规避）

1. 使用复杂弹层控件可能在不同 Thunderbird 版本不稳定。  
2. 入口注入复杂布局（四栏）易出现白屏与叠层。  
3. 若版本号不更新，用户会误认为“修复未生效”。  
4. OAuth 配置本身复杂，需独立文档化，不应混入核心待办链路。

---

## 17. 2026-02-24 交互共识补充（冻结）

以下条目优先级高于前文中任何冲突描述。

### 17.1 卡片信息展示

1. 所有事件卡片只显示三行信息：标题、时间、地点。  
2. 不默认显示摘要/notes。  
3. 时间或地点缺失时，直接隐藏对应行（不显示占位文案）。

### 17.2 分组来源与排序

1. 常规分组由 LLM 归纳结果决定，组名可动态变化。  
2. 若存在“可能重要的事”分组，必须固定展示在第一位。  
3. 新增“已接受事件”分组，固定展示在最后一位。  
4. “已接受事件”分组默认折叠，其他分组默认展开。

### 17.3 状态迁移与位置规则

1. `todo:pending -> queued`（确认接受）后，事项从原分组移除并进入“已接受事件”。  
2. `todo -> rejected` 后，事项保留在原分组原位置并灰显，不移动顺序。  
3. `rejected -> pending`（恢复）后回到正常样式，位置保持不变。

### 17.4 编辑与单击行为

1. 编辑输入框只允许在双击 `todo` 卡片后出现。  
2. 单击卡片仅执行选中与跳转源邮件，不显示编辑输入框。

### 17.5 重复事件交互

1. 重复事件标题需包含重复提示（如 `[重复xN]`）。  
2. 单击重复事件后，在卡片内联展开关联邮件列表。  
3. 单击邮件列表项必须跳转到对应邮件并显示全文。

### 17.6 版本号展示

1. 版本号不单独占一块信息区。  
2. 版本号在窗口底部以一行小字显示。

