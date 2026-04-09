# Spec: Karakeep Viewer Vim 风格快捷键支持

## 1. 背景与目标

### 1.1 背景

Karakeep Viewer 当前完全依赖鼠标操作，所有列表项、书签项、面包屑导航均只有 click handler，无任何键盘事件处理。仅 SearchBar 组件有自动聚焦功能。对于习惯 vim 操作的用户，纯鼠标操作严重影响效率。

### 1.2 业务目标

- 让 vim 用户能纯键盘完成所有核心操作：浏览列表、进入/返回列表、打开书签、搜索
- 提升扩展的可访问性和操作效率

### 1.3 用户/涉众目标

- 用户可以不触碰鼠标完成日常书签浏览操作
- 快捷键行为符合 vim 用户的肌肉记忆和直觉预期
- 新用户可通过帮助面板快速了解可用快捷键

## 2. 需求类型概览

| 类型 | 适用 | 来源 |
|------|------|------|
| 业务需求 | 是 | 用户反馈 |
| 用户/涉众需求 | 是 | 用户讨论 |
| 解决方案需求 | 是 | 分析 |
| 功能需求 | 是 | Spec 第 3 节 |
| 非功能需求 | 是 | Spec 第 4 节 |
| 外部接口需求 | 是 | Spec 第 5 节 |
| 过渡需求 | 否 | 无迁移需要 |

## 3. 功能需求

### FR-001: Vim 模态系统

- **描述**: 系统 MUST 实现两种模式：Normal 模式和 Insert 模式。默认进入 Normal 模式。在 Normal 模式下，vim 快捷键生效；在 Insert 模式下，搜索框获得焦点，键盘输入作为搜索文本。
- **验收标准**:
  - 扩展弹窗打开后默认处于 Normal 模式
  - Normal 模式下按 `/` 或 `i` 进入 Insert 模式，搜索框获得焦点
  - Insert 模式下按 `Esc` 退出回到 Normal 模式，搜索框失焦
  - Normal 模式下按 `Esc` 关闭弹窗（`window.close()`）
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-002: 焦点移动 — j/k

- **描述**: Normal 模式下，系统 MUST 支持 `j`（下移）和 `k`（上移）在可交互项之间移动焦点。可交互项包括：置顶列表、子列表、书签项（普通模式）或搜索结果（搜索模式）。
- **验收标准**:
  - `j` 将焦点移到下一个项，`k` 移到上一个项
  - 焦点在第一项时按 `k` 不动，焦点在最后一项时按 `j` 不动（除非触发加载更多，见 FR-008）
  - 聚焦项有明显的视觉高亮，区别于 hover 样式
  - 焦点项自动滚动到可见区域（scrollIntoView）
  - 支持数字前缀：`5j` 表示下移 5 项，`3k` 表示上移 3 项
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-003: 进入列表 / 打开书签 — Enter/l

- **描述**: Normal 模式下，当焦点在列表项上时，按 `Enter` 或 `l` MUST 进入该列表（调用 `navigateTo`）。当焦点在书签项上时，按 `Enter` MUST 在新标签页打开书签，`l` 无操作。
- **验收标准**:
  - 焦点在列表项上按 `Enter` 或 `l`，导航进入该列表
  - 进入列表后焦点重置为索引 0（第一项）
  - 焦点在书签项上按 `Enter`，在新标签页打开书签（`chrome.tabs.create`）
  - 焦点在书签项上按 `l`，无操作
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-004: 返回上级 — h/Backspace

- **描述**: Normal 模式下，按 `h` 或 `Backspace` MUST 返回上级列表（调用 `navigateBack`）。在根页面时无操作。
- **验收标准**:
  - 按 `h` 或 `Backspace` 返回上级列表
  - 返回后焦点重置为索引 0
  - 根页面按 `h`/`Backspace` 无响应
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-005: 打开书签 — o/O

- **描述**: Normal 模式下，当焦点在书签项上时，按 `o` MUST 在当前标签页打开书签链接，按 `O`（大写）MUST 在新标签页打开。
- **验收标准**:
  - `o`：调用 `chrome.tabs.update` 在当前标签页打开 URL
  - `O`：调用 `chrome.tabs.create` 在新标签页打开 URL
  - 焦点在列表项（非书签）上时，`o`/`O` 无操作
  - 当焦点项为搜索结果中的书签时，同样生效
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-006: 跳转 — gg/G

- **描述**: Normal 模式下，按 `gg`（连续两次 `g`）MUST 跳到列表顶部，按 `G` MUST 跳到列表底部。
- **验收标准**:
  - `gg`：焦点移到第一项，滚动到顶部
  - `G`：焦点移到最后一项，滚动到底部
  - `gg` 需在合理时间窗口内（如 500ms）连续按两次 `g` 触发
  - 支持数字前缀：`5G` 跳到第 5 项（从 1 开始计数，类似 vim 行号）
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-007: 搜索快捷键 — /

- **描述**: Normal 模式下，按 `/` MUST 聚焦搜索框并切换到 Insert 模式。
- **验收标准**:
  - 按 `/` 后搜索框获得焦点，光标在搜索框内
  - 此时用户输入的字符进入搜索框，不触发 vim 快捷键
  - 按 `Esc` 退出 Insert 模式，搜索框失焦，回到 Normal 模式
  - 退出 Insert 模式不清除搜索内容（保留搜索结果）
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-008: 自动加载更多

- **描述**: Normal 模式下，当焦点通过 `j` 移到当前列表最后一项且仍有更多数据时，系统 MUST 自动触发 `loadMore`（或 `loadMoreSearch`）加载下一页，加载完成后焦点继续下移。
- **验收标准**:
  - 焦点在最后一项，按 `j`，如果 `hasMore`/`hasMoreSearch` 为 true，自动加载
  - 加载期间显示加载状态
  - 加载完成后焦点移到新加载内容的第一项
  - `G` 跳到底部时也触发同样逻辑
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-009: Pin/Unpin 列表 — p

- **描述**: Normal 模式下，当焦点在列表项上时，按 `p` MUST 切换该列表的 pin 状态。
- **验收标准**:
  - 焦点在列表项上按 `p`，如果未 pin 则 pin，已 pin 则 unpin
  - 操作后焦点位置不变
  - 焦点在书签项上时 `p` 无操作
- **优先级**: Should
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-010: 帮助面板 — ?

- **描述**: Normal 模式下，按 `?` MUST 显示快捷键帮助面板，列出所有可用快捷键及说明。再次按 `?` 或 `Esc` 关闭面板。
- **验收标准**:
  - 按 `?` 弹出覆盖层，显示所有快捷键的分组说明
  - 面板打开时，除 `?` 和 `Esc` 外的快捷键不响应
  - 按 `?` 或 `Esc` 关闭面板，回到 Normal 模式
  - 面板样式与扩展整体风格一致（支持暗色模式）
- **优先级**: Should
- **类型映射**: 功能需求
- **来源**: 用户讨论

### FR-011: 数字前缀支持

- **描述**: Normal 模式下，系统 MUST 支持数字前缀与动作键组合。用户输入数字后接动作键，动作重复指定次数。
- **验收标准**:
  - `5j`：下移 5 项
  - `3k`：上移 3 项
  - `5G`：跳到第 5 项
  - 数字输入有超时机制（如 1000ms 内未按动作键则清除数字缓冲）
  - 数字上限为合理范围（如最大 99）
- **优先级**: Must
- **类型映射**: 功能需求
- **来源**: 用户讨论

## 4. 非功能需求

### NFR-001: 响应性能

- **描述**: 快捷键响应时间 MUST 小于 50ms（不含网络请求），用户按键后焦点移动和视觉反馈应无感知延迟。
- **测量方式**: 手动测试按键到视觉反馈的时间
- **优先级**: Must
- **来源**: 用户体验标准

### NFR-002: 无干扰

- **描述**: vim 快捷键 MUST NOT 干扰 Chrome 浏览器自身的快捷键。扩展弹窗内的按键事件应正确处理 `stopPropagation` 和 `preventDefault`。
- **测量方式**: 测试常用 Chrome 快捷键在弹窗打开时是否仍然正常
- **优先级**: Must
- **来源**: 系统集成分析

### NFR-003: 可维护性

- **描述**: 快捷键逻辑 SHOULD 集中管理，便于后续扩展新快捷键。
- **测量方式**: 添加新快捷键仅需修改配置和对应 handler
- **优先级**: Should
- **来源**: 代码质量

## 5. 外部接口需求

### IF-001: 键盘事件接口

- **类型**: UI 交互
- **入口**: 全局 `keydown` 事件监听（挂载在弹窗 document 级别）
- **交互**: 捕获按键 → 判断当前模式 → 分发到对应 handler
- **错误处理**: 未识别按键静默忽略

### IF-002: Chrome Tabs API

- **类型**: 系统集成
- **入口**: `chrome.tabs.update` (当前标签页打开) / `chrome.tabs.create` (新标签页打开)
- **交互**: `o` 键触发 `chrome.tabs.update({url})`，`O` 键触发 `chrome.tabs.create({url})`
- **错误处理**: API 调用失败时显示 error toast

## 6. 过渡需求

不适用。此为纯新增功能，无需迁移。

## 7. 约束与假设

### 7.1 技术约束

- Chrome 扩展 popup 环境，按键事件仅在弹窗获得焦点时生效
- popup 固定尺寸 360×500px，焦点项需确保在可视区域内
- React + Zustand 技术栈，需与现有状态管理方案兼容

### 7.2 业务约束

- 无

### 7.3 假设

- Chrome 扩展 popup 打开时自动获得焦点 — 来源: 已验证（Chrome 行为）
- `window.close()` 可正常关闭 popup — 来源: 已验证（Chrome API）

## 8. 优先级与里程碑建议

| ID | 需求 | 优先级 | 原因 |
|----|------|--------|------|
| FR-001 | 模态系统 | Must | 所有快捷键的基础 |
| FR-002 | j/k 移动 | Must | 核心导航 |
| FR-003 | Enter/l 进入列表 / 打开书签 | Must | 核心导航 |
| FR-004 | h/Backspace 返回 | Must | 核心导航 |
| FR-005 | o/O 打开书签 | Must | 核心功能 |
| FR-006 | gg/G 跳转 | Must | vim 基本操作 |
| FR-007 | / 搜索 | Must | 核心功能 |
| FR-008 | 自动加载更多 | Must | 用户体验 |
| FR-011 | 数字前缀 | Must | vim 核心特性 |
| FR-009 | p pin/unpin | Should | 便捷功能 |
| FR-010 | ? 帮助面板 | Should | 可发现性 |

- **里程碑 1**: FR-001 + FR-002 + FR-003 + FR-004 + FR-005 + FR-007（核心导航与操作）
- **里程碑 2**: FR-006 + FR-008 + FR-011（高级移动与数字前缀）
- **里程碑 3**: FR-009 + FR-010（辅助功能）

## 9. 变更/设计方案 (RFC)

### 9.1 现状分析

- **当前架构**: React + Zustand 单 store，组件直接调用 store action。无键盘事件处理。
- **当前问题**: 零键盘支持，所有交互依赖 click handler。
- **相关代码路径**:
  - `src/store/useStore.ts` — 状态管理，含 navigateTo/navigateBack/loadMore 等 action
  - `src/components/ListPage.tsx` — 主视图容器，渲染列表和书签
  - `src/components/BookmarkList.tsx` — 书签列表渲染
  - `src/components/SearchBar.tsx` — 搜索输入框，有 auto-focus 逻辑

### 9.2 目标状态

- **新增模块**:
  1. `src/hooks/useVimKeybindings.ts` — 自定义 Hook，封装 vim 模式管理、按键监听、数字前缀缓冲
  2. `src/components/HelpPanel.tsx` — 快捷键帮助面板组件
- **Store 扩展**: 在 useStore 中新增 vim 相关状态（focusedIndex、vimMode、isHelpOpen）
- **组件改造**: ListPage 集成焦点高亮，BookmarkList 支持焦点项渲染

### 9.3 详细设计

#### 9.3.1 状态设计

在 `useStore.ts` 中新增 vim 相关状态：

```typescript
// 新增状态
focusedIndex: number          // 当前聚焦项索引，-1 表示无焦点
vimMode: 'normal' | 'insert'  // 当前模式
isHelpOpen: boolean            // 帮助面板是否打开

// 新增 action
setFocusedIndex(index: number): void
setVimMode(mode: 'normal' | 'insert'): void
setHelpOpen(open: boolean): void
```

#### 9.3.2 可交互项列表（Focusable Items）

将页面上所有可交互项统一为一个扁平列表，焦点索引在此列表上移动。

```typescript
type FocusableItem =
  | { type: 'list'; data: ZBookmarkList }
  | { type: 'bookmark'; data: Bookmark }

function getFocusableItems(state): FocusableItem[] {
  if (isSearchMode) return searchResults.map(b => ({ type: 'bookmark', data: b }))

  const items: FocusableItem[] = []
  if (currentListId === null) {
    pinnedLists → items.push({ type: 'list', ... })
    rootLists → items.push({ type: 'list', ... })
  } else {
    childLists → items.push({ type: 'list', ... })
    bookmarks → items.push({ type: 'bookmark', ... })
  }
  return items
}
```

#### 9.3.3 useVimKeybindings Hook

核心按键处理逻辑，挂载在 document 级别 keydown 事件。

- 帮助面板打开时：只响应 `?` 和 `Esc`
- Insert 模式：只响应 `Esc` 退出
- Normal 模式：处理所有 vim 快捷键
- 数字前缀：收集数字字符到缓冲区，1000ms 超时清除

#### 9.3.4 gg 序列处理

- 按下 `g` → 设 pendingG = true，启动 500ms 计时器
- 500ms 内再按 `g` → 触发 gg（跳顶部），清除 pendingG
- 500ms 超时 → 清除 pendingG，该次 g 无操作

#### 9.3.5 焦点高亮与滚动

- 根据 `focusedIndex` 和 `focusableItems` 给对应项添加高亮 CSS class
- 使用 `ref` + `scrollIntoView({ block: 'nearest' })` 确保焦点项可见
- 高亮样式：`ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30`

#### 9.3.6 焦点重置时机

- `navigateTo` / `navigateBack` 后 → `focusedIndex = 0`
- 搜索结果更新后 → `focusedIndex = 0`
- 模式切换不改变 focusedIndex

#### 9.3.7 Enter/l 在不同项上的行为

- 焦点在列表项：`Enter` / `l` → 进入列表
- 焦点在书签项：`Enter` → 在新标签页打开书签；`l` → 无操作

#### 9.3.8 帮助面板

覆盖层形式，展示所有快捷键分组说明，支持暗色模式。按 `?` 或 `Esc` 关闭。

### 9.4 备选方案

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| A: 单一 Hook + Store 扩展 | 逻辑集中，易维护；与现有 Zustand 架构一致 | Store 稍变大 | **选用** |
| B: 独立 Context Provider | 完全解耦 | 需额外 Provider 层，与 Zustand 双状态源 | 否决 |
| C: 外部库 (tinykeys/hotkeys-js) | 成熟按键绑定 | 增加依赖，Chrome 扩展中可能有兼容问题 | 否决 |

### 9.5 实施与迁移计划

- **实施顺序**:
  1. Store 扩展：添加 focusedIndex、vimMode、isHelpOpen 状态与 action
  2. useVimKeybindings Hook：实现核心按键处理逻辑
  3. ListPage 改造：集成焦点高亮、传递 focusableItems
  4. BookmarkList 改造：支持焦点项渲染与 ref
  5. SearchBar 改造：移除自动聚焦，改为 vim 模式控制
  6. HelpPanel 组件：新增帮助面板
  7. 测试与调试
- **风险缓解**:
  - 风险：搜索框焦点与 vim 模式冲突 → 缓解：严格的模式状态机，Insert 模式下除 Esc 外不拦截任何按键
  - 风险：焦点索引与实际列表不同步 → 缓解：列表数据变化时自动 clamp focusedIndex 到有效范围
- **测试策略**:
  - 手动测试：覆盖所有快捷键在不同场景下的行为
  - 边界测试：快速连续按键、数字前缀超时、gg 序列中断
- **回滚方案**:
  - 代码变更独立于现有功能，回滚只需 revert 新增文件和 store 修改

## 10. TBD 列表

| ID | 项目 | 缺失信息 | 下一步 |
|----|------|----------|--------|
| — | — | — | 无待定项 |
