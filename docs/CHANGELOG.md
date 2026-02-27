# Changelog

本文件记录 Thunderbird 插件每个版本的开发日志，并在每次改动后持续追加。

记录规则：
- 按版本倒序（最新在最上）。
- 每个版本包含：用户问题、讨论与决策摘要、已做改动、影响文件、Commit 列表、XPI 路径、验证结果。
- 同一版本内多次迭代时，持续追加到同一版本区块。

## v2.0.2 - 2026-02-27

### 用户问题
- README 需要提供最新版本的一键直链下载地址。

### 讨论与决策摘要
- 在中英文 README 的安装章节直接放置 Release 附件下载链接，便于用户无需翻页即可安装。

### 已做改动
- 版本号升级到 `2.0.2`。
- `README.md` / `README.en.md` 新增最新 Release 直链下载：
  - `https://github.com/Liao-MH/unread2calendar/releases/download/v2.0.2/unread2calendar-thunderbird-2.0.2.xpi`
- README 文档中的对应版本号更新为 `v2.0.2`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `README.md`
- `README.en.md`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）docs(release): add direct download links and bump to 2.0.2

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/unread2calendar-thunderbird-2.0.2.xpi`

### 验证结果
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v2.0.1 - 2026-02-27

### 用户问题
- 统一将开发与发布中涉及 `email2calendar` 的命名改为 `unread2calendar`。
- 历史条目按实际情况保留，同时记录本次更名改动。

### 讨论与决策摘要
- 扩展 ID 采用新命名：`unread2calendar@addon.local`（按你之前决策，不做兼容旧 ID 的升级迁移）。
- 历史日志不回写旧版本条目，仅新增本版本记录。

### 已做改动
- 版本号升级到 `2.0.1`。
- 用户可见与发布相关命名统一为 `Unread2Calendar` / `unread2calendar`：
  - 插件显示名、配置导出文件名、XPI 产物文件名、ICS 生成标识与默认文件名。
  - 构建脚本输出名由 `email2calendar-thunderbird-*` 改为 `unread2calendar-thunderbird-*`。
  - README（中英）与三份 Thunderbird 设计文档中的产品名和产物名示例同步更新。
- 内部标识同步更名：
  - manifest `browser_specific_settings.gecko.id` 改为 `unread2calendar@addon.local`。
  - 窗格偏好键由 `extensions.email2calendar.*` 改为 `extensions.unread2calendar.*`。
  - 外观全局对象由 `Email2CalendarAppearance` 改为 `Unread2CalendarAppearance`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`
- `thunderbird-addon/common/appearance.js`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/api/tbMailPane/implementation.js`
- `scripts/build_thunderbird_xpi.sh`
- `README.md`
- `README.en.md`
- `2026-02-24-thunderbird-addon-dev-checklist.md`
- `2026-02-24-thunderbird-addon-prd-and-design-detailed.md`
- `2026-02-24-thunderbird-addon-rebuild-spec-for-llm.md`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）chore(rename): unify branding and ids to unread2calendar

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/unread2calendar-thunderbird-2.0.1.xpi`

### 验证结果
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v2.0.0 - 2026-02-27

### 用户问题
- 将当前稳定版本升级为 `2.0.0`。
- 推送到仓库：`https://github.com/Liao-MH/unread2calendar.git`，并使用新分支发布。

### 讨论与决策摘要
- 采用方案 `3`：推送到远端新分支，避免影响远端主分支。

### 已做改动
- 版本号升级到 `2.0.0`。
- README 中当前版本与 xpi 文件名示例同步更新到 `2.0.0`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `README.md`
- `README.en.md`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）chore(release): bump version to 2.0.0

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-2.0.0.xpi`

### 验证结果
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v1.0.35 - 2026-02-27

### 用户问题
- LLM 配置需要支持调用本地大模型。
- 供应商预设里“本地模型”要放在第一位，并按本地场景调整配置行为。

### 讨论与决策摘要
- 采用你确认的方案 `3`：同时支持
  - OpenAI 兼容本地端点
  - Ollama 原生接口
- 并将“本地模型”预设置顶。

### 已做改动
- 版本号升级到 `1.0.35`。
- `options/options.js`
  - 供应商预设新增并置顶：
    - `本地模型（OpenAI兼容）`（默认 `http://127.0.0.1:1234/v1`）
    - `本地模型（Ollama）`（默认 `http://127.0.0.1:11434`）
  - 预设刷新逻辑支持无 API Key 的本地提供方（local/ollama）。
  - API Key 帮助文案更新为“云端必需，本地可留空”。
- `options/options.html`
  - 预设刷新按钮文案改为“更新供应商与模型预设”。
  - API Key 占位文案改为“云端模型填写，本地模型可留空”。
- `background.js`
  - 新增本地地址识别 `isLocalLikeLLMBaseUrl(...)`。
  - LLM 启用判定更新为：`Base URL + Model` 必填；`API Key` 仅云端强制，本地地址可留空。
  - 新增 Ollama 端点支持：`/api/chat`（含 `stream:false` 与参数映射）。
  - 请求头鉴权改为“有 key 才发送 Authorization”。
  - LLM 输出解析兼容 Ollama 响应字段（`message.content` / `response`）。
  - 连接测试缺参提示按场景区分：
    - 本地：`Base URL / Model is required`
    - 云端：`Base URL / Model / API Key is required`
- 测试
  - 新增 `tests/local-llm-support.test.mjs`
  - 更新 `tests/options-provider-presets.test.mjs` 断言本地与 Ollama 预设存在。
- 文档
  - 新增用户向 README（中文主文 + 英文切换页），覆盖安装、功能、配置、FAQ、隐私说明。
  - 新增 README 设计文档，记录本次信息架构与维护策略。

### 影响文件
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/background.js`
- `tests/local-llm-support.test.mjs`
- `tests/options-provider-presets.test.mjs`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`
- `README.md`
- `README.en.md`
- `docs/plans/2026-02-27-readme-user-doc-design.md`

### Commit 列表
- `d227494` feat(llm): support local providers and ollama in 1.0.35
- （本次提交）docs(readme): add user-facing zh/en README with one-click language switch

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.35.xpi`

### 验证结果
- 测试通过：
  - `node tests/options-provider-presets.test.mjs`
  - `node tests/local-llm-support.test.mjs`
  - `node --test tests/popup-mode.test.mjs`
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v1.0.34 - 2026-02-26

### 用户问题
- “可能重要的事”分组按钮希望与待办决策逻辑一致：左侧是“认可并添加”，右侧是“已阅拒绝”。
- 点击任意决策按钮时，也要自动打开对应邮件正文。

### 讨论与决策摘要
- 采用你确认的方案 `2`：所有事件类型的所有决策按钮都触发打开对应邮件。
- “可能重要的事”按钮顺序调整为：左 `转为待办`，右 `标记已读`。

### 已做改动
- 版本号升级到 `1.0.34`。
- `sidebar/panel.js`
  - 决策动作统一流程改为：先 `todo:select(openMessage=true)` 打开对应邮件，再执行决策 API，再刷新。
  - “可能重要的事”按钮顺序调整为：
    - 左侧主按钮：`转为待办`
    - 右侧次按钮：`标记已读`

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- `44653dd` feat(panel): align important-actions order and open mail on all decisions in 1.0.34

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.34.xpi`

### 验证结果
- 测试通过：
  - `node --test tests/popup-mode.test.mjs`
  - `node --test tests/options-nav-and-group-unification.test.mjs`
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v1.0.33 - 2026-02-26

### 用户问题
- 配置导入/导出操作也需要明确成功或失败提示。

### 讨论与决策摘要
- 采用方案 `2`：导入/导出均使用“弹窗 + 导入导出页状态栏”双提示。

### 已做改动
- 版本号升级到 `1.0.33`。
- `options/options.js`
  - 导出成功：状态栏显示“导出成功”，并弹窗提示成功。
  - 导出失败：状态栏显示失败原因，并弹窗提示失败原因。
  - 导入成功：状态栏显示“导入成功”，并弹窗提示成功。
  - 导入失败：状态栏显示失败原因，并弹窗提示失败原因。
  - 新增中英文提示文案键：`exportOk/exportFail/importOk/importFail`。

### 影响文件
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- `6abf7b9` feat(options): show popup + status feedback for import/export in 1.0.33

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.33.xpi`

### 验证结果
- 测试通过：
  - `node --test tests/options-appearance-modules.test.mjs`
  - `node --test tests/options-nav-and-group-unification.test.mjs`
  - `node --test tests/options-groups-dnd-and-preview.test.mjs`
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v1.0.32 - 2026-02-26

### 用户问题
- 配置页点击“保存”后缺少明确弹窗反馈，无法快速判断成功与否。
- 已保存 LLM 配置后，主窗口仍显示“LLM未配置，正在使用本地规则”。

### 讨论与决策摘要
- 采用你确认的判定标准 `2`：
  - LLM 是否可用以“测试连接结果”为准；
  - 保存 LLM 配置时自动执行连接测试；
  - 测试成功：主窗口不再提示未配置；
  - 测试失败：主窗口显示“LLM测试连接失败”。

### 已做改动
- 版本号升级到 `1.0.32`。
- `options/options.js`
  - 所有“保存本页”动作增加成功/失败弹窗提示。
  - LLM 页面保存后自动测试连接，并将测试结果写回配置页原状态区。
  - 手动“测试连接”也同步更新持久化连接状态。
- `background.js`
  - 新增 LLM 连接状态持久化字段：`llmConnectionStatus / llmConnectionError / llmConnectionTestedAt`。
  - 新增消息通道 `todo:set-llm-connection-status` 用于保存测试结果并广播状态。
  - 当 `Base URL / Model / API Key` 变化时自动重置连接状态为 `unknown`，避免旧测试结果污染新配置。
  - 视图模型新增 `llmConnectionStatus`，供主窗口提示逻辑使用。
- `sidebar/panel.js`
  - 主窗口提示改为三态中的两种可见提示：
    - 未配置：`LLM 未配置，正在使用本地规则。`
    - 已配置但测试失败：`LLM测试连接失败`
  - 测试成功或未知状态下不显示该提示。

### 影响文件
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/background.js`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- `5a32ddb` fix(llm): auto-validate on save and show save-result popups in 1.0.32

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.32.xpi`

### 验证结果
- 测试通过：
  - `node --test tests/options-appearance-modules.test.mjs`
  - `node --test tests/options-groups-dnd-and-preview.test.mjs`
  - `node --test tests/options-nav-and-group-unification.test.mjs`
  - `node --test tests/popup-mode.test.mjs`
- 打包通过：
  - `./scripts/build_thunderbird_xpi.sh`

## v1.0.31 - 2026-02-26

### 用户问题
- 所有“文字颜色”相关修改不生效。
- 颜色选择后调色盘窗口不会自动消失。

### 讨论与决策摘要
- 用户选择“配置预览 + 主窗口都要立即同步生效”。
- 采用两点修复：
  1) 在 `follow_tb` 下修改外观参数时自动切到 `custom`，确保颜色修改真正生效；
  2) 颜色输入监听由 `input` 改为 `change`，避免调色盘停留。

### 已做改动
- 版本号升级到 `1.0.31`。
- `options/options.js`
  - `onAppearanceChanged(event)` 增加自动模式切换：
    - 当前为 `follow_tb` 且修改了外观字段（除 `appearanceMode/appearancePreset`）时，自动切换为 `custom`。
  - 外观输入事件绑定调整：
    - `type=color` 使用 `change` 监听（替代 `input`）；
    - 保留数字等输入的实时预览。

### 影响文件
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(options): make text colors take effect and use change event for color pickers in 1.0.31

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.31.xpi`

### 验证结果
- 配置页相关测试通过：
  - `tests/options-appearance-modules.test.mjs`
  - `tests/options-groups-dnd-and-preview.test.mjs`
  - `tests/options-nav-and-group-unification.test.mjs`

## v1.0.30 - 2026-02-26

### 用户问题
- 外观配置中多项颜色（分组标题、事件标题、时间地点、状态栏等）点击后不弹调色盘。
- 需要检查是否还有类似“配置参数不正常”的项并修复。
- 所有可输入数值参数需要显示可接受范围提示。

### 讨论与决策摘要
- 按“仅修配置页控件本身”执行，不调整预览一致性与主窗口渲染链路。
- 优先修复结构性问题（重复 ID、控件禁用策略），并补齐所有数值输入的范围提示。

### 已做改动
- 版本号升级到 `1.0.30`。
- `options/options.html`
  - 删除外观中部与底部重复的 `appearanceStatusColor/appearanceStatusSize`（保留底部固定区唯一入口），消除重复 `id` 冲突。
- `options/options.js`
  - 调整 `updateAppearanceInputState()`：颜色控件不再因 `follow_tb` 被禁用，始终可点选调色盘；`follow_tb` 模式下仅“不即时应用”，不阻止预配置。
  - 新增 `applyNumberInputRangeHints()`：
    - 自动扫描所有 `input[type=number]`；
    - 依据 `min/max/step` 生成灰字提示（如 `范围：0 ~ 36，步长：1`）；
    - 同时写入输入框 `title`，便于悬浮查看。

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(options): restore color pickers, remove duplicate appearance ids, and add numeric range hints in 1.0.30

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.30.xpi`

### 验证结果
- 配置页相关测试通过：
  - `tests/options-appearance-modules.test.mjs`
  - `tests/options-groups-dnd-and-preview.test.mjs`
  - `tests/options-nav-and-group-unification.test.mjs`

## v1.0.29 - 2026-02-26

### 用户问题
- 外观配置里 `事件间距/卡片阴影强度/卡片高度` 看起来不起作用。
- 质疑 `事件间距` 与 `卡片间距` 语义重复。
- 固定分组默认配色存在重复颜色。
- 主窗口预览比例不接近真实窗口，边界不清晰。

### 讨论与决策摘要
- 采用“1+3”方案：重定义间距语义并新增第三个独立间距参数。
  - `事件卡片间距`：卡片与卡片之间。
  - `卡片内元素间距`：同一卡片内标题/时间/地点/按钮之间。
  - `事件按钮间距`：按钮与按钮之间。
- 默认分组配色在“已存在重复色”情况下也强制去重重分配。
- 预览区改为接近主窗口的纵向比例与更清晰边界。

### 已做改动
- 版本号升级到 `1.0.29`。
- `common/appearance.js`
  - 新增 `advanced.actionGap`，并输出 CSS 变量 `--e2c-action-gap`。
- `sidebar/panel.css`
  - `事件卡片间距` 映射到 `.group-items/.parent-children`；
  - `卡片内元素间距` 映射到 `.item` 内部网格间距；
  - `事件按钮间距` 映射到 `.item-actions`；
  - `卡片阴影强度` 同时作用到事件卡片（`.item`）；
  - `卡片高度`继续作用于 `.item` 的 `min-height`。
- `options/options.html`
  - 外观区重命名间距字段；
  - 新增 `事件按钮间距` 控件；
  - 预览面板改为更接近真实弹窗比例（`aspect-ratio: 2/3`）并增强边界与阴影。
- `options/options.js`
  - 外观数据收集/回填/重置新增 `actionGap`；
  - 帮助文案更新为新语义；
  - 分组样式同步时对已存在重复主色执行去重重分配。
- 测试更新：`tests/options-groups-dnd-and-preview.test.mjs`（新增字段与去重逻辑断言）。

### 影响文件
- `thunderbird-addon/common/appearance.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `tests/options-groups-dnd-and-preview.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(appearance): make spacing/shadow/height controls effective and improve preview frame in 1.0.29

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.29.xpi`

### 验证结果
- 全量测试通过：`tests/*.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.29`。

## v1.0.28 - 2026-02-26

### 用户问题
- 允许在 LLM 可用分组中拖动排序。
- 固定分组配色默认应不重复。
- 外观配置页右侧新增主窗口预览，且应为可交互样例。

### 讨论与决策摘要
- 分组排序采用“拖拽手柄”方案。
- 默认配色采用“混合策略”：优先使用预置调色板，不足时按分组名 hash 生成补充色。
- 预览采用“实时可交互样例”：点击事件可展开/收起，分组可展开/收起，颜色与当前配置联动。

### 已做改动
- 版本号升级到 `1.0.28`。
- `options/options.html`
  - 在 LLM 分组区新增排序说明；
  - 为分组 chip 增加拖拽视觉样式；
  - 外观页改为左右布局，右侧新增“主窗口预览（可交互）”面板。
- `options/options.js`
  - LLM 分组 chip 支持拖拽排序（`dragstart/dragover/drop`），排序后同步更新统一分组源；
  - 新增默认分组配色混合分配逻辑：`GROUP_ACCENT_PALETTE + hash` 补色，保证新分组默认色尽量不重复；
  - 新增 `renderAppearancePreview()`，实时渲染可交互样例，并与外观配置和分组配色联动更新。
- 新增测试：`tests/options-groups-dnd-and-preview.test.mjs`。

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `tests/options-groups-dnd-and-preview.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(options): add llm-group drag sort, mixed default group colors, and interactive appearance preview in 1.0.28

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.28.xpi`

### 验证结果
- 全量测试通过：`tests/*.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.28`。

## v1.0.27 - 2026-02-26

### 用户问题
- 取消“保存全部配置”，只保留“保存本页”。
- “保存本页”要放到卡片外下方。
- 固定分组配色的背景色应使用色块而非文本输入。
- 每个配置参数都要有小字说明。
- LLM 识别需给出分组关键词依据，并自动写入本地规则且去重。

### 讨论与决策摘要
- 采用“每页一个保存按钮”方案：移除全局保存，按导航页保存。
- LLM 关键词依据自动写入本地规则，按大小写无关去重，失败不影响识别流程。

### 已做改动
- 版本号升级到 `1.0.27`。
- `options/options.html`
  - 移除“保存全部配置”与各子卡片内部保存按钮；
  - 为 `general/llm/rules/appearance` 四页新增卡片外底部“保存本页”按钮；
  - 固定分组配色的背景输入统一为颜色控件（色块）。
- `options/options.js`
  - LLM 页改为一次保存整页（LLM+Prompt+分组+运行参数）；
  - 动态分组背景色改为“启用开关 + 色块选择器”；
  - 补充参数说明小字（含温度/Max Tokens/Top P 勾选项）；
  - 分组关键词区补充“LLM 自动回写、去重”提示。
- `background.js`
  - 默认 Prompt 新增 `categoryKeywords` 输出要求（每个事件 1-5 个分类关键词）；
  - 解析 LLM 返回时接收 `categoryKeywords/classificationKeywords/reasonKeywords`；
  - 识别流程中将分类关键词自动写回本地规则对应分组关键词并去重（大小写无关）。

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/background.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(options+llm): page-level save only, color swatch group-bg, and llm keyword writeback in 1.0.27

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.27.xpi`

### 验证结果
- 全量测试通过：`tests/*.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.27`。

## v1.0.26 - 2026-02-26

### 用户问题
- 配置页未落地左侧导航分类显示。
- 分组统一能力未落地：LLM 分组、本地规则分组、外观分组颜色未做到同源联动。

### 讨论与决策摘要
- 导航固定 5 分类：`常规`、`LLM`、`本地规则`、`外观`、`导入导出`。
- 采用“完整统一”：分组以 LLM 分组为唯一数据源；本地规则与外观分组颜色自动联动。
- 切页守卫保持强约束：当前页有未保存修改时，禁止切页并提示先保存。
- 分组改名需继承已有关键词与颜色，不重置。

### 已做改动
- 版本号升级到 `1.0.26`。
- `options/options.html`：
  - 新增左侧导航 `#settingsNav` 与分页容器；
  - 将配置区按 5 个页面分类显示；
  - 新增“导入导出”页面；
  - 本地规则分组关键词改为动态容器 `#dynamicGroupKeywordRows`；
  - 外观固定分组颜色改为动态容器 `#dynamicAppearanceGroupRows`。
- `options/options.js`：
  - 新增分页切换与未保存阻断（`dirtyPages` + `switchSettingsPage`）；
  - 新增统一分组模型 `groupDefinitions`，并实现 `syncGroupDerivedViews()`；
  - 新增动态渲染：`renderDynamicGroupKeywordRows()` / `renderDynamicAppearanceGroupRows()`；
  - 分组编辑支持新增/删除/改名，改名保留原关键词与颜色；
  - 保存分组时同步写入 `llmGroupConstraints`（由 `groupDefinitions` 派生）；
  - 增加配置 JSON 导入/导出按钮与处理流程。
- `background.js`：
  - 配置归一化支持 `groupDefinitions`；
  - `localRules.groupKeywords` 支持动态键并保留；
  - 本地规则抽取支持遍历自定义分组关键词。
- 新增测试：`tests/options-nav-and-group-unification.test.mjs`。

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/background.js`
- `thunderbird-addon/manifest.json`
- `tests/options-nav-and-group-unification.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(options): add left-nav paging and unified group source linkage in 1.0.26

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.26.xpi`

### 验证结果
- 新增测试通过：`node tests/options-nav-and-group-unification.test.mjs`。
- 全量测试通过：`tests/*.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.26`。

## v1.0.25 - 2026-02-26

### 用户问题
- 外观配置内容过多，理解成本高；希望按类型拆分模块和卡片。
- 每个模块需要单独“恢复默认”按钮。
- 外观页最上方和最下方都需要“全部恢复默认”按钮。

### 讨论与决策摘要
- 外观页按三模块拆分：`顶部区域`、`中部事件区`、`底部固定区`，默认全部展开。
- 模块内“恢复默认”按钮放在模块底部。
- “全部恢复默认”点击后需二次确认；确认后只修改表单，不自动保存，并自动滚动到顶部。
- 恢复后统一显示提示：`外观已恢复默认，待保存`。

### 已做改动
- 版本号升级到 `1.0.25`。
- `options/options.html`：
  - 外观区重构为三模块卡片（顶部/中部/底部）；
  - 新增模块底部恢复按钮；
  - 新增顶部与底部“全部恢复默认”按钮。
- `options/options.js`：
  - 新增 `resetAppearanceModule(moduleKey)`，支持模块级恢复默认；
  - 新增 `resetAppearanceAll()`，支持确认后全量恢复并滚动到顶部；
  - 新增统一恢复提示 `外观已恢复默认，待保存`；
  - 移除旧“更多外观”折叠逻辑，外观项默认展开。
- 新增测试：`tests/options-appearance-modules.test.mjs`，覆盖新结构与恢复逻辑关键节点。

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `tests/options-appearance-modules.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(options): split appearance settings into modules with module/global reset in 1.0.25

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.25.xpi`

### 验证结果
- 新增测试通过：`node tests/options-appearance-modules.test.mjs`。
- 全量测试通过：`tests/*.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.25`。

## v1.0.24 - 2026-02-26

### 用户问题
- 希望“可能重要的事”和常规待办的决策按钮颜色有区分。
- 希望卡片边框和“确认”按钮同色，且不同分组颜色不同。
- 希望在配置页外观模块可自定义这部分颜色，并支持按组配置背景色（默认统一背景）。

### 讨论与决策摘要
- 采用固定分组色映射（important/academic/course/activity/other/unrecognized）。
- 配置页开放“固定分组：主色 + 可选背景色”编辑；背景留空时继承统一卡片背景。
- 在不同颜色主题下对分组主色做轻量明暗修正，保证可读性。

### 已做改动
- 版本号升级到 `1.0.24`。
- `common/appearance.js`：
  - 新增 `DEFAULT_GROUP_STYLES`；
  - `normalizeAppearance()` 新增 `advanced.groupStyles` 归一化与容错（含可选空背景）。
- `options/options.html`：
  - 外观高级区新增固定分组配色输入（每组 `主色 + 背景色(可留空)`）。
- `options/options.js`：
  - 新增分组配色字段读写、预览和保存；
  - 新增对应字段说明小灰字；
  - `follow_tb` 模式下分组配色输入与其他色彩输入一致禁用。
- `sidebar/panel.js`：
  - 新增分组视觉令牌计算（分组主色、可选背景、按钮字色）；
  - 新增主题明暗自适应的分组主色修正；
  - 渲染分组时注入 CSS 变量到分组容器。
- `sidebar/panel.css`：
  - 事件卡片边框改为按分组主色；
  - 分组内 `.primary`（确认类按钮）改为按分组主色；
  - 组背景色支持按分组覆盖，默认继承统一背景。
- 新增测试：`tests/group-decision-colors.test.mjs`。

### 影响文件
- `thunderbird-addon/common/appearance.js`
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/manifest.json`
- `tests/group-decision-colors.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(ui): add per-group decision colors and configurable group appearance in 1.0.24

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.24.xpi`

### 验证结果
- 测试通过：`tests/*.test.mjs`。
- 新增回归测试通过：`node tests/group-decision-colors.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.24`。

## v1.0.23 - 2026-02-26

### 用户问题
- 希望在网络正常时，“更新供应商预设”尽量不失败。
- “扫描未读”需要改为识别 `Inbox + 其子文件夹`（如有）。

### 讨论与决策摘要
- 对预设刷新采用“超时 + 重试 + 多端点回退”策略，优先保障可用性。
- 扫描范围从“账号下所有文件夹”收敛为“Inbox 根 + Inbox 子树”。

### 已做改动
- 版本号升级到 `1.0.23`。
- `options.js`：
  - 远端模型拉取加入 8 秒超时（`AbortController`）与最多 3 次重试（含短退避）；
  - 针对通用 OpenAI 兼容供应商增加 `/models` 与 `/models?limit=200` 双端点尝试；
  - Anthropic 增加 `/models` 与 `/models?limit=100` 尝试；
  - 保留 Gemini 的 OpenAI 兼容 + 原生接口双路径回退。
- `background.js`：
  - 新增 `isInboxFolder()` 与 `collectInboxRoots()`；
  - 新增 `listInboxFoldersByAccountIds()`，仅遍历 Inbox 及其子文件夹；
  - `scanUnreadByAccounts()` 改为使用 Inbox 范围。
- 新增/更新测试：
  - `tests/inbox-scan-scope.test.mjs`
  - `tests/options-provider-presets.test.mjs`（补充重试/超时断言）

### 影响文件
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/background.js`
- `thunderbird-addon/manifest.json`
- `tests/options-provider-presets.test.mjs`
- `tests/inbox-scan-scope.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(scan+options): stabilize provider preset refresh and limit unread scan to inbox tree in 1.0.23

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.23.xpi`

### 验证结果
- 测试通过：`node tests/options-provider-presets.test.mjs`、`node tests/inbox-scan-scope.test.mjs`、`node tests/scan-interaction.test.mjs`。
- 全量测试通过：`tests/*.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.23`。

## v1.0.22 - 2026-02-26

### 用户问题
- 更新 Gemini 供应商预设时显示失败，希望核对“更新供应商预设”接口调用是否正确并排查原因。

### 讨论与决策摘要
- 先按官方文档核对 Gemini OpenAI 兼容接口，再做代码级兼容增强。
- 保持内置预设可用，不因在线模型刷新失败阻断配置使用。
- 将失败原因透传到状态栏，便于定位网络/鉴权/接口差异问题。

### 已做改动
- 版本号升级到 `1.0.22`。
- `options.js`：
  - 核心接口保持 `GET {baseUrl}/models`（Gemini OpenAI 兼容接口，Bearer 鉴权）；
  - 为 Gemini 增加原生接口回退：当 `/openai/models` 失败时，自动尝试 `{nativeBase}/models?key=...`；
  - 模型列表解析兼容 `data[].id`（OpenAI 兼容）与 `models[].name`（原生 Gemini）两种格式；
  - 失败状态从泛化提示改为附带具体原因（HTTP 状态/响应片段）。

### 影响文件
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/manifest.json`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(options): harden gemini preset refresh with fallback model APIs in 1.0.22

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.22.xpi`

### 验证结果
- 测试通过：`node tests/options-provider-presets.test.mjs`、`node tests/decision-and-mail-open-policy.test.mjs`、`node tests/scan-interaction.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.22`。

## v1.0.21 - 2026-02-26

### 用户问题
- 配置页希望增加按主流厂商匹配的 `Base URL + Model` 预设，并提供清晰语义的刷新按钮。
- 点击决策按钮不应触发邮件打开；只在点击事件卡片（非决策）时打开邮件。
- 扫描未完成时对事件做决策会被后续刷新“刷回未处理”。
- 点击事件打开邮件有概率导致窗口退出。
- 配置页在中英文切换后需确保功能与显示可用。

### 讨论与决策摘要
- 采用“内置预设 + 刷新更新（失败回退）”模式。
- 决策动作与“打开邮件”彻底解耦。
- 决策后写入本地锁定状态，扫描增量不得覆盖锁定条目。
- 打开邮件仅使用当前 mail tab 选中，不再走可能抢焦点的后备打开方式。
- 配置页补充关键控件本地化与文案统一。

### 已做改动
- 版本号升级到 `1.0.21`。
- `options.html / options.js`：
  - 新增供应商预设与模型预设控件；
  - 新增“更新供应商预设”按钮；
  - 内置常见厂商预设（OpenAI/Anthropic/Gemini/xAI/DeepSeek/Groq/OpenRouter/Moonshot）；
  - 刷新时支持尝试在线拉取所选供应商模型列表（失败自动回退内置预设）；
  - 关键按钮与标题补充中英本地化；
  - 配置页默认 Prompt 同步到 `nonTodo.summary` 最新契约。
- `panel.js`：
  - 决策动作移除“自动打开邮件”步骤。
- `background.js`：
  - 邮件打开仅保留 `mailTabs.setSelectedMessages` 路径；
  - 决策动作写入 `manualOverride` 锁定；
  - 扫描合并新增 `isStickyConflict`，避免锁定条目被回滚。
- 新增测试：
  - `tests/options-provider-presets.test.mjs`
  - `tests/decision-and-mail-open-policy.test.mjs`

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/background.js`
- `thunderbird-addon/manifest.json`
- `tests/options-provider-presets.test.mjs`
- `tests/decision-and-mail-open-policy.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(ui): add provider presets, decouple decision-open, and lock scan-time decisions in 1.0.21

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.21.xpi`

### 验证结果
- 新增回归测试通过：`node tests/options-provider-presets.test.mjs`、`node tests/decision-and-mail-open-policy.test.mjs`。
- 既有测试通过：`node tests/non-todo-group.test.mjs`、`node tests/panel-scroll-restore.test.mjs`、`node tests/popup-layout.test.mjs`、`node tests/empty-state-line.test.mjs`、`node tests/item-click-selection-behavior.test.mjs`、`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.21`。

## v1.0.20 - 2026-02-26

### 用户问题
- 扫描后未识别为待办的邮件需要单独分组展示，并可点击打开邮件后置灰。
- 该能力应以 LLM 为主（已配置时仅用 LLM），重点修改 Prompt 与返回结果处理。

### 讨论与决策摘要
- 新增固定分组：`未识别到待办`，位于事件区最后一个普通分组（`可能重要的事` 仍第一）。
- LLM 返回结构采用顶层 `nonTodo.summary`，当 `events` 为空时写入该分组。
- 点击条目后：打开邮件、选中条目、展开轻量详情并持久置灰。

### 已做改动
- 版本号升级到 `1.0.20`。
- `background.js`：
  - 默认 LLM Prompt 新增强约束输出字段 `nonTodo.summary`；
  - 新增 `UNRECOGNIZED_GROUP_KEY='unrecognized'` 与中英文标签；
  - 新增 `normalizeLLMResponse()`、`fallbackNonTodoSummary()`、`createNonTodoItem()`；
  - LLM 与本地规则两条识别链路在“无待办”时都写入 `non_todo` 条目；
  - 新增 `todo:mark-non-todo-seen` 消息处理；
  - 分组排序调整为：`important` 固定首位，`unrecognized` 固定常规分组末位。
- `panel.js`：
  - 新增 `non_todo` 展示文案（摘要/来源）；
  - 单击 `non_todo` 条目执行“打开邮件 + 标记已查看 + 选中刷新”，并置灰；
  - 禁用 `non_todo` 双击编辑。
- 新增回归测试 `tests/non-todo-group.test.mjs`。

### 影响文件
- `thunderbird-addon/background.js`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `tests/non-todo-group.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）feat(todo): add unrecognized non-todo group with llm nonTodo summary in 1.0.20

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.20.xpi`

### 验证结果
- 新增回归测试通过：`node tests/non-todo-group.test.mjs`。
- 既有测试通过：`node tests/panel-scroll-restore.test.mjs`、`node tests/popup-layout.test.mjs`、`node tests/empty-state-line.test.mjs`、`node tests/item-click-selection-behavior.test.mjs`、`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.20`。

## v1.0.19 - 2026-02-25

### 用户问题
- 初始界面正常，但点击按钮触发刷新后顶部按钮位置会变化并出现裁切。

### 讨论与决策摘要
- 按既定方案继续修复，定位到“刷新后恢复了 window 级滚动位置”，导致页面整体上移。
- 采用稳定修复：只保存/恢复事件列表区 `groups` 的滚动，不再读写 `window` 滚动。

### 已做改动
- 版本号升级到 `1.0.19`。
- `panel.js`：
  - `currentScrollTop()` 改为仅读取 `el.groups.scrollTop`；
  - `applyScrollTop()` 改为仅设置 `el.groups.scrollTop`；
  - 移除 `window` 的 `scroll` 监听，避免保存错误的窗口滚动位置。
- 新增回归测试 `tests/panel-scroll-restore.test.mjs`，防止再次引入 `window.scrollTo` 或 `window` 级滚动持久化。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `tests/panel-scroll-restore.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(ui): prevent topbar shift by restoring groups scroll only in 1.0.19

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.19.xpi`

### 验证结果
- 回归测试通过：`node tests/panel-scroll-restore.test.mjs`。
- 既有测试通过：`node tests/popup-layout.test.mjs`、`node tests/empty-state-line.test.mjs`、`node tests/item-click-selection-behavior.test.mjs`、`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.19`。

## v1.0.18 - 2026-02-25

### 用户问题
- 顶部第一排按钮仍出现形状/位置显示异常，希望回到 `v1.0.8` 的正常显示标准。

### 讨论与决策摘要
- 采用方案 1：顶部样式按 `v1.0.8` 回退（显示层回退，功能逻辑不变）。

### 已做改动
- 版本号升级到 `1.0.18`。
- `panel.css`：
  - 顶部容器 `.top-fixed` 回退 `v1.0.8` 样式（移除 `overflow: visible`）；
  - `button` 回退到 `v1.0.8` 样式（`padding: 6px 10px`，移除后续新增的 `min-height/line-height/box-sizing`）。
- `tests/popup-layout.test.mjs`：
  - 去除与本次回退冲突的按钮最小高度断言；
  - 保留弹窗最小宽高稳定性断言（`560x620`）。

### 影响文件
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/manifest.json`
- `tests/popup-layout.test.mjs`
- `docs/CHANGELOG.md`

### Commit 列表
- （本次提交）fix(ui): rollback top button styles to v1.0.8 baseline in 1.0.18

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.18.xpi`

### 验证结果
- 回归测试通过：`node tests/popup-layout.test.mjs`。
- 既有测试通过：`node tests/empty-state-line.test.mjs`、`node tests/item-click-selection-behavior.test.mjs`、`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.18`。

## v1.0.17 - 2026-02-25

### 用户问题
- 当前顶部按钮形状显示不全，希望恢复到此前正常显示标准。

### 讨论与决策摘要
- 采用“稳定布局”修复：
  - 窗口恢复尺寸最小值与 CSS 最小尺寸统一，避免恢复到过小窗口造成顶部按钮区被挤压；
  - 顶部按钮设定统一最小高度和行高，避免字体/主题差异下按钮被裁切。

### 已做改动
- 版本号升级到 `1.0.17`。
- `panel.js`：
  - 新增 `PANEL_MIN_WIDTH=560`、`PANEL_MIN_HEIGHT=620`；
  - `restoreWindowState()` 改为恢复时强制不小于最小尺寸。
- `panel.css`：
  - `.top-fixed` 增加 `overflow: visible`；
  - `button` 调整为更稳的 `padding/min-height/line-height/box-sizing`，避免形状裁切。
- `tests/popup-layout.test.mjs`：
  - 提升最小宽高校验到 `560x620`；
  - 新增按钮最小高度校验，防止回归。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/manifest.json`
- `tests/popup-layout.test.mjs`

### Commit 列表
- （本次提交）fix(ui): stabilize top button rendering and window min size in 1.0.17

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.17.xpi`

### 验证结果
- 回归测试通过：`node tests/popup-layout.test.mjs`。
- 既有测试通过：`node tests/empty-state-line.test.mjs`、`node tests/item-click-selection-behavior.test.mjs`、`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.17`。

## v1.0.16 - 2026-02-25

### 用户问题
- 点击“清屏”后，中间区域显示异常（大面积空白感强），希望改为更清晰的空状态。
- 期望：不出现卡片，仅显示一行灰字提示。

### 讨论与决策摘要
- 采用“空白态 + 一行灰字提示”：
  - 不渲染默认分组卡片；
  - 仅在事件区域显示简短提示文本，引导使用“扫描未读/刷新”。

### 已做改动
- 版本号升级到 `1.0.16`。
- `panel.js`：
  - 新增多语言文案 `noTodosHint`；
  - 在 `renderGroups()` 中，当主分组数量为 0 时，插入 `.groups-empty` 灰字提示。
- `panel.css`：
  - 新增 `.groups-empty` 样式，使用较小字号与灰色文字。
- 新增回归测试 `tests/empty-state-line.test.mjs`。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/manifest.json`
- `tests/empty-state-line.test.mjs`

### Commit 列表
- （本次提交）fix(ui): show one-line empty-state hint after clear in 1.0.16

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.16.xpi`

### 验证结果
- 回归测试通过：`node tests/empty-state-line.test.mjs`。
- 既有测试通过：`node tests/item-click-selection-behavior.test.mjs`、`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/popup-layout.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.16`。

## v1.0.15 - 2026-02-25

### 用户问题
- 一个邮件包含多个事件时，点击父标题没有打开对应邮件。
- 对“未选中但已展开”的事件单击会直接折叠；期望是先“选中+打开邮件+保持展开”，再次单击才折叠。

### 讨论与决策摘要
- 采用“方案1”：
  - 父标题单击：打开对应邮件，并保持父级展开/收起切换。
  - 子事件单击：若当前未选中，先选中并打开邮件，同时确保展开；仅当已选中时，才执行展开/折叠切换。

### 已做改动
- 版本号升级到 `1.0.15`。
- `panel.js` 子事件点击逻辑改为“选中优先”：
  - 未选中：强制展开并打开对应邮件；
  - 已选中：按当前状态展开/折叠。
- `panel.js` 父事件点击逻辑增强：
  - 打开 `sourceMessageId` 对应邮件；
  - 若无 `sourceMessageId`，回退打开首个子事件对应邮件；
  - 同时保留父级展开/收起功能。
- 新增回归测试 `tests/item-click-selection-behavior.test.mjs`。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `tests/item-click-selection-behavior.test.mjs`

### Commit 列表
- （本次提交）fix(ui): open parent mail and apply select-first click behavior in 1.0.15

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.15.xpi`

### 验证结果
- 回归测试通过：`node tests/item-click-selection-behavior.test.mjs`。
- 既有测试通过：`node tests/decision-collapse-behavior.test.mjs`、`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/popup-layout.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.15`。

## v1.0.14 - 2026-02-25

### 用户问题
- 点击分组“展开”后，对事件执行决策，事件不会折叠，导致列表过长、阅读负担高。

### 讨论与决策摘要
- 采用明确规则：
  - `确认/拒绝/标记已读` 后，该事件折叠为仅标题。
  - `恢复` 后，该事件自动展开详情，并重新显示决策按钮。
  - `转为待办` 本轮不强制改为折叠，保持当前交互连续性。
- 根因是“分组全展开”优先级覆盖了“单事件折叠”，单纯清空 `expandedItemsByGroup` 不足以让单条在全展开组内收起。

### 已做改动
- 版本号升级到 `1.0.14`。
- `panel.js` 新增“单事件强制折叠”状态：
  - `uiState.forceCollapsedItemsByGroup`；
  - `collapseItem()` 写入强制折叠标记；
  - `expandItem()` 清除强制折叠标记并展开详情。
- 事件渲染改为使用优先级：`强制折叠 > 分组展开/单项展开`，确保分组展开时也能把单条折叠。
- 动作执行流程调整：
  - `确认/拒绝/标记已读`：执行后折叠；
  - `恢复`：执行后强制展开详情；
  - `转为待办`：不额外强制折叠。
- 新增回归测试 `tests/decision-collapse-behavior.test.mjs`，覆盖以上关键锚点。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `tests/decision-collapse-behavior.test.mjs`

### Commit 列表
- （本次提交）fix(ui): enforce per-item collapse after decisions and reopen on restore in 1.0.14

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.14.xpi`

### 验证结果
- 回归测试通过：`node tests/decision-collapse-behavior.test.mjs`。
- 既有测试通过：`node tests/scan-interaction.test.mjs`、`node tests/popup-mode.test.mjs`、`node tests/popup-layout.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.14`。

## v1.0.13 - 2026-02-25

### 用户问题
- 选择扫描邮箱后，账号选择层没有自动关闭回到主窗口。
- 任务暂停时，点击事件不能展开详情；分组展开/收起按钮失效，只有取消任务后才恢复。

### 讨论与决策摘要
- 扫描入口确认：采用“点击开始扫描后，提示约 1 秒再自动关闭账号选择层”。
- 运行/暂停阶段交互确认：采用“完全可交互”，事件与分组在识别任务进行中也应可展开/收起。
- 根因定位：`render()` 中每次刷新都会调用运行态全折叠逻辑，导致用户点击后立即被下一帧重置为折叠。

### 已做改动
- 版本号升级到 `1.0.13`。
- `confirmScanWithAccounts()`：
  - 增加“即将开始扫描（1秒）”提示；
  - 延迟 1 秒后自动关闭账号选择层；
  - 扫描请求前后对确认/取消按钮做禁用保护，避免重复点击。
- 移除运行态强制全折叠逻辑，不再在每次 `render()` 时重置分组展开状态。
- 运行/暂停期间保留 `全部展开/收起` 按钮可用，避免被识别任务锁死交互。
- 新增回归测试 `tests/scan-interaction.test.mjs`，覆盖上述 4 个关键行为。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/manifest.json`
- `tests/scan-interaction.test.mjs`

### Commit 列表
- （本次提交）fix(ui): keep scan/pause interactions usable and auto-close account picker in 1.0.13

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.13.xpi`

### 验证结果
- 回归测试通过：`node tests/scan-interaction.test.mjs`。
- 既有测试通过：`node tests/popup-mode.test.mjs`、`node tests/popup-layout.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.13`。

## v1.0.12 - 2026-02-25

### 用户问题
- 全浮窗模式下，点击插件后弹窗高度被压扁成细条，无法正常浏览和操作。

### 讨论与决策摘要
- 根因是 `panel.css` 中使用了侧栏布局时期的 `100vh + calc(100vh - 20px)`，在 action popup 环境中会出现高度塌缩。
- 采用最小修复：给浮窗显式最小尺寸，并让主壳高度跟随 `body`，避免 `vh` 互相递归计算。

### 已做改动
- 版本号升级到 `1.0.12`。
- 调整浮窗尺寸与壳层布局：
  - `body` 增加稳定宽高约束（`min-width: 560px`、`min-height: 620px`）。
  - `body` 高度改为 `min(86vh, 760px)`，提升跨屏幕兼容。
  - `.app-shell` 高度改为 `height: 100%`，移除 `calc(100vh - 20px)`。
- 新增样式回归测试：`tests/popup-layout.test.mjs`，防止未来再次回归到 `min-height: 0`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/sidebar/panel.css`
- `tests/popup-layout.test.mjs`

### Commit 列表
- （本次提交）fix(ui): stabilize popup size in full-popup mode for 1.0.12

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.12.xpi`

### 验证结果
- 回归测试通过：`node tests/popup-layout.test.mjs`。
- 既有测试通过：`node tests/popup-mode.test.mjs`、`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.12`。

## v1.0.11 - 2026-02-25

### 用户问题
- 边栏和错误详情浮窗都未正常出现，要求回退到旧版“全浮窗”显示逻辑。
- 主浮窗不应因功能失败而弹错误详情窗；执行失败仅在状态栏显示 `状态：错误...`。
- 回退窗口形态时，保留后续迭代的识别流程和功能能力。

### 讨论与决策摘要
- 选择回退到 `v1.0.4` 风格的 action 浮窗入口（`sidebar/panel.html`）。
- 去除右侧边栏实验 API 与错误详情浮窗路径，避免多入口并存导致行为不确定。
- 保留识别/分组/导入等既有能力，仅统一错误呈现方式为状态栏文本。

### 已做改动
- 版本号升级到 `1.0.11`。
- `manifest` 移除 `TbMailPane` 实验 API 声明，保持 action 全浮窗模式。
- 后台移除错误详情浮窗调用，所有入口失败改为 `setError(...) + 状态同步`。
- 新增回归测试 `tests/popup-mode.test.mjs`：
  - 校验 action 使用 `sidebar/panel.html`。
  - 校验 `TbMailPane` 已移除。
  - 校验不再存在 `showErrorPopup(...)` 调用。
- 删除与当前模式冲突的旧测试 `tests/action-mode.test.mjs`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`
- `tests/popup-mode.test.mjs`
- `tests/action-mode.test.mjs`（删除）

### Commit 列表
- （本次提交）fix(ui): rollback to full popup mode and status-only errors in 1.0.11

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.11.xpi`

### 验证结果
- 回归测试通过：`node tests/popup-mode.test.mjs`。
- 既有测试通过：`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.11`。

## v1.0.9 - 2026-02-25

### 用户问题
- 选择“方案 2”后，需要再测试一次边栏打开：点击 `Todo Sidebar` 应直接打开侧栏。

### 讨论与决策摘要
- 根因收敛为 `manifest` 仍配置了 `default_popup`，会拦截 `onClicked` 路径，导致边栏链路不触发或行为不一致。
- 改为“单击优先模式”：移除 action popup，仅保留点击事件去打开/切换右侧边栏。

### 已做改动
- 版本号升级到 `1.0.9`。
- 移除 `browser_action.default_popup` 与 `message_display_action.default_popup`，确保点击直接命中后台 `onClicked` 打开链路。
- 新增清单回归测试：动作按钮不得再声明 `default_popup`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `tests/action-mode.test.mjs`

### Commit 列表
- （本次提交）fix(ui): enforce click-to-open sidebar action mode in 1.0.9

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.9.xpi`

### 验证结果
- 回归测试通过：`node tests/action-mode.test.mjs`。
- 既有测试通过：`node tests/calendar-utils.test.mjs`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.9`。

## v1.0.8 - 2026-02-25

### 用户问题
- 点击 `Todo Sidebar` 按钮依然无响应，且没有出现错误悬浮窗。

### 讨论与决策摘要
- 采用“稳定入口优先”：按钮点击先走 `default_popup` 启动页，由启动页主动发消息给后台打开右侧栏。
- 这样可绕开部分环境下 `onClicked` 不触发的问题；若打开失败，继续走自动错误悬浮窗。

### 已做改动
- 版本号升级到 `1.0.8`。
- `browser_action`/`message_display_action` 新增 `default_popup = launcher/launcher.html`。
- 新增 `launcher` 启动页：
  - 自动发送 `todo:open-pane`；
  - 成功后自动关闭；
  - 失败时在启动页显示错误。
- 后台新增 `todo:open-pane` 消息处理：打开右侧栏失败时自动弹详细错误悬浮窗。
- 加固上下文菜单注册：菜单创建异常不再影响后台脚本后续执行。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`
- `thunderbird-addon/launcher/launcher.html`
- `thunderbird-addon/launcher/launcher.js`

### Commit 列表
- `a29b14c` fix(ui): add launcher popup path to reliably open todo pane

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.8.xpi`

### 验证结果
- JavaScript 语法检查通过：`background.js` / `launcher.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.8`。

## v1.0.7 - 2026-02-25

### 用户问题
- 某些环境下点击 `Todo Sidebar` 仍可能无响应。

### 讨论与决策摘要
- 依据 Thunderbird 文档，action 按钮可能被用户配置为“菜单按钮”；此时左键不会直接触发打开逻辑。
- 增加 action 菜单入口作为兜底，保证总有可点击入口打开右侧待办栏。

### 已做改动
- 版本号升级到 `1.0.7`。
- 新增 action 菜单项：`打开 Todo Sidebar`（支持工具栏按钮和邮件按钮菜单）。
- 菜单入口复用同一打开链路，并在失败时自动弹出详细错误悬浮窗。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`

### Commit 列表
- `2dc9891` fix(ui): add action-menu fallback for opening todo sidebar

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.7.xpi`

### 验证结果
- JavaScript 语法检查通过：`background.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.7`。

## v1.0.6 - 2026-02-25

### 用户问题
- 点击 `Todo Sidebar` 无反应，未能打开邮件页右侧待办栏。
- 需要在失败时自动弹出悬浮窗口，显示完整错误明细，便于定位问题。

### 讨论与决策摘要
- 主界面仍固定在邮件页边栏；仅当打开失败时自动弹错误悬浮窗（详细日志）。
- 按 Thunderbird 文档推荐路径实现点击行为，同时增加多层兜底打开方式，避免“静默失败”。

### 已做改动
- 版本号升级到 `1.0.6`。
- 新增 UI 打开兜底链路：
  - 首选 `TbMailPane.show/toggle`；
  - 失败后回退 `browserAction.openPopup()`；
  - 再失败回退 `tabs.create(sidebar/panel.html)`；
  - 全部失败时抛出聚合错误。
- 新增自动错误悬浮窗：
  - 新增 `error/error.html` 页面，自动读取并展示完整错误信息（name/message/code/status/file/line/stack）。
  - 点击扩展按钮或右键识别流程中若打开 UI 失败，自动弹窗展示详细错误。
- 新增后台错误缓存与读取接口：
  - `todoUiLastError.v1`
  - `todo:get-ui-error`

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`
- `thunderbird-addon/error/error.html`
- `thunderbird-addon/error/error.css`
- `thunderbird-addon/error/error.js`

### Commit 列表
- `3c00693` fix(ui): auto-show detailed popup errors when todo pane open fails

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.6.xpi`

### 验证结果
- JavaScript 语法检查通过：`background.js` / `error.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.6`。

## v1.0.5 - 2026-02-25

### 用户问题
- 需要将待办窗口从弹窗改为邮件页右侧栏（今日窗格存在时作为第5栏，否则第4栏）。
- 状态栏文案改为“状态：xxx”，不再使用“进度”字样。
- 初始化与清屏后中间事件区应为空白，不应默认显示“可能重要的事”。
- “已添加日历”卡片过高、默认应折叠，版本号需要固定在右下角。
- 需要支持右侧栏边缘拖拽调整宽度，并记忆显示状态与宽度。

### 讨论与决策摘要
- 采用实验 API 注入邮件主窗口右侧栏，保留现有工具栏与邮件内按钮入口。
- 右键“识别待办事项”流程自动确保右侧栏显示，再执行识别。
- 状态栏统一由前端加 `状态：/Status:` 前缀，后台仅提供内容文本。
- 空数据不渲染默认分组；仅有实际事件时展示对应分组。

### 已做改动
- 版本号升级到 `1.0.5`。
- 新增 `TbMailPane` 实验 API：
  - 在 `mail:3pane` 窗口右侧挂载 todo 面板；
  - 支持 `show/hide/toggle/getState`；
  - 支持左边缘拖拽改宽度，宽度持久化；
  - 监听今日窗格显隐变化，动态调整右侧偏移。
- 入口改造：
  - `browser_action`/`message_display_action` 移除 `default_popup`；
  - 点击按钮改为切换右侧栏；
  - 右键识别改为强制显示右侧栏后执行识别。
- 状态栏统一：
  - 去除所有“进度：/Progress:”前缀；
  - 面板固定显示 `状态：...`（英文 `Status: ...`）；
  - 清屏后显示 `状态：已清屏`。
- UI 修正：
  - 无事件时不再默认创建“可能重要的事”空分组；
  - “已添加日历”默认折叠并压缩卡片高度；
  - 面板宽度改为容器自适应，底部区域保持可见。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/api/tbMailPane/schema.json`
- `thunderbird-addon/api/tbMailPane/implementation.js`

### Commit 列表
- （当前提交）feat(ui): move todo panel to mail right pane and unify status line

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.5.xpi`

### 验证结果
- JavaScript 语法检查通过：`background.js` / `panel.js` / `api/tbMailPane/implementation.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.5`。

## v1.0.4 - 2026-02-25

### 用户问题
- 打开弹窗后直接出现“选择导入日历”浮层，属于错误行为。

### 讨论与决策摘要
- 该问题是样式回归：`.account-picker` 固定层的 `display:grid` 覆盖了 `hidden`。
- 采用最小修复，显式恢复 `[hidden]` 优先级，避免再次出现默认弹出。

### 已做改动
- 版本号升级到 `1.0.4`。
- 新增样式规则：`.account-picker[hidden] { display: none !important; }`。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/sidebar/panel.css`

### Commit 列表
- `2241bc2` fix(ui): hide calendar picker overlay by default and bump 1.0.4

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.4.xpi`

### 验证结果
- JavaScript 语法检查通过：`panel.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.4`。

## v1.0.3 - 2026-02-25

### 用户问题
- 清屏后状态栏仍显示“已处理 0 个事项”，不符合“清空状态栏”的预期。

### 讨论与决策摘要
- `清屏` 应清空待办与状态栏展示文本；仅当有处理计数时才显示“已处理 N 个事项”。

### 已做改动
- 版本号升级到 `1.0.3`。
- 调整状态栏渲染逻辑：
  - 有进度/错误文本时显示“状态 + 已处理计数”。
  - 无状态文本且处理数为 0 时显示空白。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/sidebar/panel.js`

### Commit 列表
- `4b62267` fix(ui): clear status line on clear-screen and bump to 1.0.3

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.3.xpi`

### 验证结果
- JavaScript 语法检查通过：`panel.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.3`。

## v1.0.2 - 2026-02-25

### 用户问题
- 点击刷新后，状态栏与版本号位置异常，跑到窗口中部。
- 希望窗口布局稳定，不因交互导致尺寸变化；并尽量记住窗口位置/尺寸。
- 识别大量邮件时需要支持暂停、继续、取消。
- 识别中新增事件应默认折叠。
- 全局按钮应固定显示；新增“清屏”按钮。
- “已添加日历”应固定在“导入日历”和状态栏中间，且默认折叠。

### 讨论与决策摘要
- 采用“三段式骨架”：顶部固定全局操作栏，中部滚动分组区，底部固定导入/历史/状态区。
- 统一“识别任务控制器”，`刷新/扫描未读/右键识别` 全部走同一任务状态与进度流。
- 取消策略采用“保留已识别结果”，仅停止后续处理。
- “清屏”仅清待办与状态栏，不清“已添加日历”历史。

### 已做改动
- 版本号升级到 `1.0.2`。
- 侧栏布局重构：
  - 顶部固定：`扫描未读/刷新/全部展开收起/配置/清屏`。
  - 中部仅分组滚动。
  - 底部固定：`导入日历` -> `已添加日历` -> `状态栏 + 版本号`。
- 新增统一识别任务控制按钮：`暂停/继续/取消任务`。
- 新增后端任务控制接口：
  - `todo:scan-pause`
  - `todo:scan-resume`
  - `todo:scan-cancel`
  - `todo:clear-screen`
- 刷新/扫描未读/右键识别前统一清空旧待办，并在状态栏实时显示进度。
- 识别进行中，新增待办强制保持折叠显示。
- 记录并尝试恢复窗口尺寸/位置（在可用窗口 API 场景下生效）。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/background.js`
- `thunderbird-addon/sidebar/panel.html`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/sidebar/panel.js`

### Commit 列表
- `de30b87` feat(ui): add fixed shell, task controls, and clear-screen workflow

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.2.xpi`

### 验证结果
- JavaScript 语法检查通过：`panel.js` / `background.js` / `options.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.2`。

## v1.0.1 - 2026-02-25

### 用户问题
- 每次改动都要同步更新版本号，避免混淆。
- 当前弹窗出现“细条”现象，无法正常浏览和使用。

### 讨论与决策摘要
- 版本策略固定为每次改动自动 `patch+1`（如 `1.0.0 -> 1.0.1`）。
- 弹窗布局采用兼容性修复：移除 `100vh` 依赖，改为更稳的常规布局 + sticky 底栏。

### 已做改动
- 版本号升级到 `1.0.1`。
- 修复侧栏细条问题：
  - 移除 `body` 的 `height: 100vh` 与强制 `overflow: hidden`。
  - 调整为更兼容的最小高度布局。
  - 底部状态区改为 `sticky`，避免影响主要内容区域。
  - 滚动位置恢复逻辑改为“分组滚动优先 + 窗口滚动兜底”。

### 影响文件
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/sidebar/panel.js`

### Commit 列表
- `03f7b88` fix(ui): bump 1.0.1 and restore usable popup layout

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.1.xpi`

### 验证结果
- JavaScript 语法检查通过：`panel.js` / `background.js` / `options.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`，产物为 `1.0.1`。

## v1.0.0 - 2026-02-25

### 用户问题
- 需要在配置页自定义外观（字体颜色、字号、粗体、间距、模块背景色等），默认跟随 Thunderbird 主题，支持预设与自定义。
- 需要修复和统一侧栏交互：识别过程保持折叠、固定底栏、恢复滚动位置、全局展开/收起、处理后自动折叠、导入定位、动作自动打开邮件、导入记录可回跳邮件。
- 需要配置项补充简短说明，降低学习成本。

### 讨论与决策摘要
- 采用 `follow_tb / preset / custom` 三模式，默认 `follow_tb`。
- 预设先内置 6 套，基础项默认显示，进阶项通过“更多外观”同页折叠展开。
- 外观配置采用“统一对象 + normalize 校验 + 回退默认”策略，避免配置对象异常导致页面失效。
- “标记已读/转为待办”先落保守策略 v1：命中明确可执行信息（时间/地点/动作）优先待办，否则偏向已读或忽略。

### 已做改动
- 新增外观系统：
  - 增加统一外观模块 `common/appearance.js`。
  - 配置页新增“外观配置”区块（基础 + 更多外观进阶项 + 保存外观配置按钮 + 结果提示）。
  - 侧栏与配置页改为 CSS 变量驱动，支持主题模式和预设。
- 稳定侧栏交互：
  - 新增“全部展开/收起”按钮。
  - 识别处理中强制分组保持折叠。
  - 事件处理后自动折叠回标题行。
  - “已添加日历”默认完全折叠，仅显示分组头和数量。
  - 底部状态栏与版本号固定，列表区独立滚动。
  - 侧栏 UI 状态本地持久化（展开状态 + 滚动位置）。
  - 点击导入日历后自动滚动并聚焦日历选择区。
  - 点击确认/拒绝/标记已读/转为待办时，先尝试打开对应邮件。
  - “已添加日历”事件新增“查看原邮件”操作。
- 本地规则保守判定 v1：
  - 强化可执行事件识别（时间/地点/动作动词）。
  - 对 no-reply / automated 邮件采用更保守策略。
- 配置页说明文本：
  - 为主要配置项动态注入小灰字说明，统一风格。

### 影响文件
- `thunderbird-addon/common/appearance.js`
- `thunderbird-addon/manifest.json`
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/sidebar/panel.html`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/background.js`
- `docs/plans/2026-02-25-thunderbird-appearance-customization-design.md`
- `docs/plans/2026-02-25-thunderbird-ui-stability-and-decision-rules-design.md`

### Commit 列表
- `0eb0159` feat(ui): stabilize sidebar interactions and add guided config hints
- `cf9f18b` feat(ui): add configurable appearance themes and advanced style controls
- `56b845d` docs: add ui stability and decision-rules design
- `50a0861` docs: add appearance customization design plan

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-1.0.0.xpi`

### 验证结果
- JavaScript 语法检查通过：`background.js` / `panel.js` / `options.js` / `appearance.js`。
- 打包通过：`./scripts/build_thunderbird_xpi.sh`。
- 关键交互已按需求落地（折叠、固定底栏、导入定位、动作联动邮件、导入记录回跳）。

## v0.10.3 - 2026-02-25（历史补录）

### 用户问题
- 导入日历后需要可核验的历史记录，并能回看导入情况。
- 多事件邮件需要父子结构展示与更稳定的折叠行为。
- 识别流程需要统一的一行进度状态。

### 讨论与决策摘要
- 采用“父事件 + 子事件”结构展示同一邮件的多事件。
- 进度信息统一收敛为单行状态，避免重复区域。
- 导入记录按“已添加日历”分组沉淀，便于追溯。

### 已做改动
- 新增父子事件视图与折叠/展开行为修复。
- 统一识别过程一行进度显示（含刷新、扫描、右键识别）。
- 增加“已添加日历”分组与导入记录保留逻辑（30天窗口）。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/background.js`

### Commit 列表
- `68f9226` fix: add calendar read/write permissions
- `9262fae` feat: support calendar selection before importing events
- `7a97e9b` feat: support inline editing on event double-click
- `c3d661e` fix: group expand behavior and restore double-click edit
- `545ba0e` fix: stabilize parent toggle and group collapse behavior
- `dc04850` fix: parent event toggle behavior and refresh clear timing
- `ba4b76f` feat: add parent-child event view and remove scan box
- `83cd3bf` fix: show one-line progress for all extraction actions

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.10.0.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.10.1.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.10.2.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.10.3.xpi`

### 验证结果
- 历史补录依据：聊天记录与提交历史对齐。
- 版本产物文件已存在于 `dist/`。

## v0.9.5 - 2026-02-25（历史补录）

### 用户问题
- 希望逐封邮件调用 LLM 并实时回流结果。
- 希望 LLM 分组可配置，且识别严格约束到分组集合。
- 希望显示更清晰处理进度（上传/等待/返回/统计）。

### 讨论与决策摘要
- 采用逐封上传与逐封渲染，不阻塞用户边看边处理。
- 新增可配置分组约束，LLM 输出按 UI 语言对齐。
- 进度改成单行滚动更新，最终给出累计统计。

### 已做改动
- 支持自定义 Prompt 与分组约束（含默认分组集合）。
- 支持逐封识别、批量参数、正文截断参数配置。
- 状态栏统一显示处理进度与最终统计。

### 影响文件
- `thunderbird-addon/background.js`
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/sidebar/panel.js`

### Commit 列表
- `d913393` fix: force-migrate legacy llm prompt to multi-event template
- `3b026e4` feat: add one-line live progress and multi-event extraction
- `c5ce9a1` feat: add bilingual default llm group constraints
- `6c3b25c` feat: stream per-message llm extraction with full email body
- `4b30fe8` feat: upgrade llm prompt to batch extraction protocol
- `4c7bb3f` feat: add custom llm prompt section and per-section save actions

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.9.0.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.9.1.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.9.2.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.9.3.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.9.4.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.9.5.xpi`

### 验证结果
- 历史补录依据：聊天记录与提交历史对齐。
- 版本产物文件已存在于 `dist/`。

## v0.8.7 - 2026-02-25（历史补录）

### 用户问题
- LLM 配置需要可测连通性、完整错误日志、可选参数开关。
- 本地规则关键词需要自定义增删且忽略大小写匹配。
- 刷新、右键识别、扫描未读流程需要统一触发与清空语义。

### 讨论与决策摘要
- 测试连接结果和错误详情在配置页直接展示。
- 温度、Max Tokens、Top P 增加勾选开关，不勾选不发送。
- 统一“先清空旧结果，再按当前触发源识别新结果”。

### 已做改动
- 完善 LLM 测试连接与错误诊断输出。
- 增加本地规则关键词管理与统一配置入口。
- 增加右键批量识别、按账号扫描未读、识别后自动弹窗。

### 影响文件
- `thunderbird-addon/options/options.html`
- `thunderbird-addon/options/options.js`
- `thunderbird-addon/background.js`
- `thunderbird-addon/sidebar/panel.js`

### Commit 列表
- `fd55d43` fix: reset todos before refresh/menu extraction and move llm status panel
- `e68c0a2` fix: live-update todos during scan and auto-open panel after menu extract
- `df8ed4b` feat: add context-menu extraction and account-scoped unread scan picker
- `ffc4824` fix: refresh active mail extraction, debug context toggle, and settings layout
- `b48beae` feat: add configurable local rule keywords and unified settings panel
- `32b1855` fix: implement compact group toggle, refresh semantics, and ui language labels
- `9f736e8` feat: support optional advanced LLM params with toggle controls
- `a446ef1` fix: send responses-compatible payload to OpenAI responses API
- `d090537` fix: surface full llm connection diagnostics in options
- `9f2068a` fix: simplify cards, add llm connection test, and restore group toggles

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.0.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.1.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.2.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.3.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.4.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.5.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.6.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.8.7.xpi`

### 验证结果
- 历史补录依据：聊天记录与提交历史对齐。
- 版本产物文件已存在于 `dist/`。

## v0.7.9 - 2026-02-24（历史补录）

### 用户问题
- 事件展示过于冗长，需要三行化（标题/时间/地点）并支持单击展开、双击编辑。
- 分组逻辑需要固定“可能重要的事”优先展示，已接受事件默认折叠置底。
- 拒绝事件保留原位置灰显，不移动分组。

### 讨论与决策摘要
- 采用“卡片默认简洁 + 按需展开详情 + 双击原位编辑”。
- 分组顺序遵循：重要优先，已接受靠后，其他分组由识别结果驱动。
- 状态转换优先保留用户上下文，不强制搬移卡片位置。

### 已做改动
- 统一三行展示与分组行为。
- 完善确认/拒绝/恢复与灰显规则。
- 改善分组折叠与语言跟随逻辑。

### 影响文件
- `thunderbird-addon/sidebar/panel.js`
- `thunderbird-addon/sidebar/panel.css`
- `thunderbird-addon/background.js`

### Commit 列表
- `6600e87` chore: bump addon version to 0.6.2
- `4de9a35` feat: align thunderbird panel behavior with accepted UX consensus

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.0.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.1.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.2.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.3.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.4.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.5.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.6.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.7.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.8.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.7.9.xpi`

### 验证结果
- 历史补录依据：聊天记录与提交历史对齐。
- 版本产物文件已存在于 `dist/`。

## v0.6.0 - 2026-02-24（历史补录）

### 用户问题
- 需要把早期设计文档落地为 Thunderbird 邮件待办侧栏插件原型。
- 需要在迭代中持续对齐交互共识并保留设计文档。

### 讨论与决策摘要
- 先用最小可用插件跑通“邮件识别 -> 待办展示 -> 基础操作”闭环。
- 设计与实现并行，先通过文档冻结交互，再逐步补功能。

### 已做改动
- 建立 Thunderbird 插件设计基线与共识文档。
- 形成早期侧栏交互主路径，为后续 0.7+ 迭代提供框架。

### 影响文件
- `docs/plans/2026-02-24-thunderbird-ui-state-redesign.md`
- `thunderbird-addon/*`（原型阶段）

### Commit 列表
- `3813a70` docs: add thunderbird todo sidebar plugin design
- `6a520cf` docs: freeze thunderbird panel interaction consensus

### XPI 路径
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.0.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.1.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.2.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.3.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.4.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.5.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.6.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.7.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.8.xpi`
- `/Users/lmh/Library/CloudStorage/OneDrive-WashingtonUniversityinSt.Louis/email2calendar/email2calendar/dist/email2calendar-thunderbird-0.6.9.xpi`

### 验证结果
- 历史补录依据：聊天记录与提交历史对齐。
- 版本产物文件已存在于 `dist/`。
