# Thunderbird Addon 外观配置设计（2026-02-25）

## 1. 目标与范围

目标：在不破坏现有功能的前提下，为插件新增可配置外观系统，支持：

- 默认跟随 Thunderbird 主题。
- 内置 6 套预设主题。
- 用户自定义基础外观参数。
- 用户在“更多外观”中自定义进阶参数。
- 外观配置同时作用于侧栏（panel）和配置页（options）。

本次仅设计与实现 UI 外观系统，不改动待办识别、导入日历、LLM 识别等业务逻辑。

## 2. 交互与信息架构

在 `options` 页新增独立区块：`外观配置（Appearance）`。

区块结构：

1. 模式选择：
   - `follow_tb`（默认，跟随 Thunderbird）
   - `preset`
   - `custom`
2. 预设下拉（仅 `preset` 模式启用）
3. 基础外观字段（默认显示）
4. `更多外观` 折叠区域（同页展开，不弹窗、不跳页）
5. `保存外观配置` 按钮
6. 区块底部状态提示（成功/部分失败/失败 + 时间）

页面底部保留原有 `保存全部配置` 按钮。

## 3. 主题与配置模型

### 3.1 模式

- `follow_tb`：颜色类参数不生效（输入可显示但禁用），字号/间距/粗细可生效。
- `preset`：加载预设值用于展示，点击保存后持久化。
- `custom`：完全使用用户填写值。

### 3.2 预设（6 套）

- 跟随系统（默认）
- 高对比浅色
- 高对比深色
- 护眼柔和
- 学术蓝灰
- 活力橙绿

### 3.3 配置对象

```json
{
  "mode": "follow_tb | preset | custom",
  "presetId": "system|contrast_light|contrast_dark|soft_eye|academic_bluegray|vibrant_orangegreen",
  "basic": {
    "textColor": "#141824",
    "baseFontSize": 14,
    "titleBold": true,
    "eventGap": 8,
    "groupGap": 10,
    "moduleBg": "#ffffff",
    "buttonBg": "#146ef5",
    "buttonText": "#ffffff"
  },
  "advanced": {
    "groupTitleColor": "#111827",
    "groupTitleSize": 14,
    "itemTitleColor": "#111827",
    "itemTitleSize": 13,
    "metaColor": "#4b5565",
    "metaSize": 12,
    "statusColor": "#4b5565",
    "statusSize": 11,
    "cardBg": "#ffffff",
    "cardBorderColor": "#d8dee7",
    "cardRadius": 10,
    "cardShadow": 0,
    "cardMinHeight": 0,
    "cardPaddingY": 8,
    "cardPaddingX": 8,
    "cardGap": 8
  }
}
```

## 4. 生效顺序与渲染策略

生效顺序：

1. Thunderbird 主题变量（基础）
2. 预设主题（如启用）
3. 用户基础配置
4. 用户进阶配置

通过 CSS 变量统一渲染（panel + options 共用命名规范）：

- `--e2c-text-color`
- `--e2c-base-font-size`
- `--e2c-card-bg`
- `--e2c-card-gap`
- `--e2c-card-min-height`
- 等

`follow_tb` 下颜色变量优先取 Thunderbird；字号/间距变量可被用户值覆盖。

## 5. 校验、容错与保存反馈

为避免“外观配置对象失败”：

- 新增 `normalizeAppearanceConfig(raw)`：补齐缺省值、类型转换、范围夹取。
- 新增 `validateAppearanceConfig(cfg)`：返回 `errors[]`、`warnings[]`、`sanitizedConfig`。
- 读取配置时始终先 normalize，保证旧版本配置兼容。

保存反馈：

- 成功：`外观配置保存成功`
- 部分失败：`外观配置部分保存失败：字段X已回退默认`
- 失败：`外观配置保存失败：错误码 + 详细信息`

区块底部显示最近一次保存状态（文本+时间戳）。

## 6. 可读性保护

- 若按钮前景/背景对比不足，自动修正按钮文字色（黑或白）。
- 关键文本最小字号限制（如 10px）防止不可读。
- 输入非法颜色值时阻止保存并提示字段名。

## 7. 实施拆解

1. 在 `options.html/options.js` 新增外观区块与交互。
2. 在 `background.js` 增加外观配置存储、默认值、迁移。
3. 在 `panel.js` 与 `options.js` 注入 CSS 变量。
4. 在 `panel.css`、`options` 样式中替换硬编码为变量。
5. 添加保存结果提示与日志信息。

## 8. 验收清单

- 模式切换符合预期（follow_tb/preset/custom）。
- 6 套预设可切换并生效。
- 基础项可保存并生效。
- 进阶项可保存并生效（含卡片高度、卡片间距）。
- 保存外观配置有明确成功/失败提示。
- 配置异常时可回退默认，不影响页面可用。
- Thunderbird 重启后配置可恢复。
- 侧栏与配置页外观保持一致风格。
