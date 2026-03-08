# Thunderbird Mail Pane 第四栏设计（2026-03-08）

## 1. 背景与目标

当前 `Unread2Calendar Todo Sidebar` 的主入口是 `browser_action/message_display_action` popup。

这带来两个根本限制：

- popup 失焦后通常会关闭，无法稳定实现“移出后降透明”等持续显示交互。
- popup 不是常规可拖拽窗口，无法把“用户手动调整宽度并记住”作为可靠能力。

本设计目标是将插件主界面从 popup 迁移为 Thunderbird 邮件主界面 `about:3pane` 中的固定右侧第四栏，并满足以下已确认约束：

- 第四栏位置：覆盖“邮件列表 + 邮件正文”整块区域的最右侧。
- 默认状态：常驻显示，用户可手动收起。
- 宽度策略：默认宽度 + 拖拽边界调整宽度，并记住上次宽度。
- 业务 UI：继续复用现有 `sidebar/panel.html` + `sidebar/panel.js`。

## 2. 能力边界与结论

Thunderbird 标准 MailExtension UI 不提供“向 `about:3pane` 注册第四栏”的公开入口。标准能力主要覆盖 action、popup、tab、menu 等。

因此，本需求不能通过单纯修改 `manifest` 中的 `default_popup` 或新增普通 sidebar 配置完成，必须通过 `Experiment API` 操作 Thunderbird 主界面。

结论：

- 标准 API 路线：不可行。
- Experiment 路线：可行。
- 对当前仓库：推荐复用现有 `tbMailPane` experiment 原型，而不是新建第二套宿主注入逻辑。

## 3. 已确认决策

本次设计固定以下决策：

1. 第四栏挂载在 `mail:3pane` 主窗口。
2. 第四栏固定在整个邮件工作区最右侧，不只依附邮件正文区。
3. 插件默认展开显示。
4. 用户可通过拖拽分隔条调整宽度。
5. 仅记住宽度，不记住额外窗口位置。
6. 工具栏按钮不再作为主 popup 入口，而是负责显示或聚焦第四栏。

## 4. 现有代码基础

仓库中已经存在未接入的 `tbMailPane` experiment：

- `thunderbird-addon/api/tbMailPane/implementation.js`
- `thunderbird-addon/api/tbMailPane/schema.json`

该原型已具备以下能力：

- 在 `mail:3pane` 窗口右侧注入宿主容器。
- 插入可拖拽分隔条。
- 读取并保存 `visible` 与 `width` 偏好值。
- 在宿主中加载 `sidebar/panel.html?layout=mailpane`。
- 在窗口 resize 与 Today Pane 显隐变化时重新计算几何位置。

这意味着第四栏方案不是从零开始，而是把现有原型正式纳入产品路径。

## 5. 架构设计

采用“两层结构”：

- 宿主层：`TbMailPane` experiment
- 业务层：现有 `panel.html` / `panel.js`

### 5.1 宿主层职责

`TbMailPane` 仅负责：

- 在所有 `mail:3pane` 窗口中插入或移除第四栏宿主。
- 控制显示、隐藏、切换状态。
- 提供分隔条拖拽，更新并持久化宽度。
- 根据 Thunderbird 主界面布局变化，重新定位第四栏。
- 在窗口关闭时清理监听器与观察器。

宿主层不承担待办识别、导入日历、分组展示等业务逻辑。

### 5.2 业务层职责

现有 `panel.js` 继续负责：

- 扫描未读、刷新当前邮件、识别所选邮件。
- 展示分组、事件卡片、导入记录、状态栏。
- 通过 `runtime.sendMessage` 与后台通信。
- 打开配置页、触发日历导入、刷新 view model。

这种分层可把 Thunderbird UI 宿主的不稳定性与业务逻辑隔离开。

## 6. 数据流与入口调整

### 6.1 面板数据流

第四栏中的 `panel.html` 仍通过后台消息获取和更新状态：

1. `panel.js` 请求 `todo:get-view-model`
2. `background.js` 返回当前识别与导入状态
3. 用户操作后，`panel.js` 发出动作消息
4. `background.js` 更新内部状态并广播 `todo:state-changed`
5. 已挂载的第四栏面板收到广播后刷新

因此，主迁移点是 UI 宿主，不是业务数据结构。

### 6.2 打开逻辑

当前 `background.js` 的打开逻辑优先走 popup / tab。

改造后建议：

1. `browser_action` / `message_display_action` 按钮优先调用 `browser.TbMailPane.show()`。
2. 右键或其他入口需要“打开主界面”时，同样调用 `browser.TbMailPane.show()`。
3. 仅在 `TbMailPane` 初始化失败时，回退到现有 tab 或 popup 路径。

这样可以保证第四栏成为唯一主界面，避免同时维护两套主入口。

## 7. 宽度与状态策略

### 7.1 宽度

- 默认宽度：沿用当前原型默认值 `520px`，后续可再调整。
- 最小宽度：`360px`
- 最大宽度：`960px`
- 拖拽方式：通过右侧栏左边的分隔条进行水平拖拽。

### 7.2 持久化

- 使用偏好值保存 `visible` 与 `width`。
- 插件或 Thunderbird 重启后恢复上次宽度。
- 本次不记录其他窗口几何信息。

### 7.3 默认显示

- 默认 `visible = true`
- 用户可通过按钮或后续单独的收起按钮隐藏。

## 8. 与原需求的关系

迁移到第四栏后，原先 popup 难以实现的需求将转为可实施：

- “鼠标移出后降到 30% 透明度”：在常驻第四栏宿主中可实现。
- “用户手动调整并记住宽度”：通过分隔条拖拽可稳定实现。
- “测试连接超时改为 5 秒”：与宿主无关，仍是低风险独立改动。

因此，第四栏改造可作为后续交互优化的基础设施变更。

## 9. 风险与兼容性

### 9.1 Thunderbird UI 结构变化

`about:3pane` 与相关 DOM/XUL 结构在不同 Thunderbird 版本中可能变化。

风险点：

- `today-pane-panel`
- `navigation-toolbox`
- `mail:3pane` 窗口生命周期

策略：

- 对关键宿主节点使用存在性判断。
- 找不到辅助区域时使用保守几何回退。
- 不把业务逻辑耦合到主界面内部 DOM。

### 9.2 多窗口

用户可能同时打开多个 `mail:3pane` 窗口。

策略：

- `show()` 时对所有 `mail:3pane` 窗口注入并显示第四栏。
- 新窗口打开后应可重新注入。
- 关闭窗口时断开 `MutationObserver` 与拖拽监听。

### 9.3 回退路径

如果 experiment 注册或注入失败：

- 工具栏按钮至少还能回退到 tab 或 popup。
- 不允许因宿主层失败导致插件主入口完全失效。

## 10. 实施拆解

1. 在 `manifest.json` 中注册 `TbMailPane` experiment。
2. 在 `background.js` 中接入 `browser.TbMailPane.show()` / `toggle()` / `getState()`。
3. 调整当前“打开主界面”逻辑，使第四栏成为主入口。
4. 检查 `panel.html/panel.js/panel.css` 在 `layout=mailpane` 下的尺寸与滚动行为。
5. 增加宿主失败时的回退逻辑。
6. 再评估并落地“移出后 30% 透明度”和“5 秒测试连接超时”。

## 11. 验收清单

- Thunderbird 邮件主界面右侧默认显示第四栏。
- 第四栏覆盖整个邮件工作区右侧，而非仅邮件正文右侧。
- 用户可拖拽分隔条调整宽度。
- 重启 Thunderbird 后宽度可恢复。
- 工具栏按钮可显示或聚焦第四栏，而不是只弹 popup。
- 扫描、刷新、导入日历、打开配置页等原有业务流程不回归。
- Today Pane 展开/收起时第四栏位置正确。
- 多个 `mail:3pane` 窗口下第四栏行为一致。
- Experiment 失败时仍存在可用回退入口。

## 12. 官方参考

- Thunderbird Supported UI Elements
- Thunderbird Supported Manifest Keys
- Thunderbird Mail Front-End / `about:3pane`
- Thunderbird Introducing Experiments
- Thunderbird Adapt to Changes in Thunderbird 103-115
