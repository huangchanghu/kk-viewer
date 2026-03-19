# Spec: Karakeep 浏览器插件

## 1. 背景与目标

### 1.1 背景

Karakeep 是一个自托管的书签管理应用，用户需要一个浏览器插件来快速访问和浏览其托管实例中的列表和书签，无需每次登录Web界面。

### 1.2 业务目标

- 提供便捷的浏览器插件，让用户快速访问karakeep中的书签
- 支持自托管karakeep实例的配置
- 提供流畅的列表浏览和书签访问体验

### 1.3 用户/涉众目标

- **主要用户**：已部署karakeep实例的用户
- **使用场景**：日常快速查看和访问已保存的书签
- **期望**：一键访问、层级导航、快速搜索

## 2. 需求类型概览

| 类型 | 适用 | 证据 |
|------|------|------|
| 业务 | 是 | 用户需要一个便捷的karakeep访问工具 |
| 用户/涉众 | 是 | 快速浏览列表和书签 |
| 解决方案 | 是 | 浏览器插件实现 |
| 功能 | 是 | Spec各节详细定义 |
| 非功能 | 是 | 性能、安全、可用性要求 |
| 外部接口 | 是 | Karakeep REST API |
| 过渡 | 否 | 新项目，无迁移需求 |

## 3. 功能需求

### FR-001: 配置管理

- **描述**：系统必须允许用户配置karakeep服务的API URL和API Key
- **验收标准**：
  - 提供配置页面，可输入API URL和API Key
  - 配置持久化存储在浏览器扩展storage中
  - 支持修改和清除配置
  - 配置验证：保存时测试API连接
- **优先级**：Must
- **类型映射**：功能需求
- **来源**：任务描述

### FR-002: 列表浏览（层级导航）

- **描述**：系统必须支持层级导航浏览karakeep列表，采用面包屑导航结构
- **验收标准**：
  - 显示根级列表（parentId为null的列表）
  - 点击列表进入下一级，显示其子列表和书签
  - 面包屑导航显示当前路径（如：首页 > SL > 广告团队文档）
  - 点击面包屑任意层级可跳转到该层级
  - 默认全部折叠（不预展开子列表）
- **优先级**：Must
- **类型映射**：功能需求
- **来源**：任务描述、用户澄清

### FR-003: 书签显示与访问

- **描述**：系统必须显示书签列表并支持点击打开
- **验收标准**：
  - 书签显示标题；若标题为空则显示URL
  - 只显示link类型的书签（过滤text和asset类型）
  - 点击书签在新标签页打开对应URL
  - 书签列表分页显示（每页20条）
  - 支持分页导航（上一页/下一页）
- **优先级**：Must
- **类型映射**：功能需求
- **来源**：任务描述、用户澄清

### FR-004: 书签搜索

- **描述**：系统必须支持书签搜索功能
- **验收标准**：
  - 提供搜索输入框
  - 输入关键词后实时搜索（防抖300ms）
  - 搜索结果显示link类型书签
  - 支持分页显示搜索结果
- **优先级**：Should
- **类型映射**：功能需求
- **来源**：用户澄清

### FR-005: 错误处理

- **描述**：系统必须妥善处理各类错误并提示用户
- **验收标准**：
  - 网络错误：显示"网络连接失败"
  - 认证失败（401）：显示"API Key无效或已过期"
  - 服务器错误（5xx）：显示"服务器错误，请稍后重试"
  - 空列表/书签：显示友好的空状态提示
  - 所有错误以Toast通知形式展示
- **优先级**：Must
- **类型映射**：功能需求
- **来源**：用户澄清

### FR-006: 主题适配

- **描述**：系统必须跟随浏览器主题（深色/浅色）
- **验收标准**：
  - 自动检测浏览器主题偏好
  - 实时响应主题变化
  - 深色和浅色主题均有良好的视觉效果
- **优先级**：Should
- **类型映射**：功能需求
- **来源**：用户澄清

## 4. 非功能需求

### NFR-001: 性能

- **描述**：插件响应时间应快速流畅
- **测量**：
  - 弹窗打开时间 < 500ms
  - 列表加载时间 < 1s（正常网络）
  - 搜索响应时间 < 2s
- **优先级**：Should
- **来源**：用户体验最佳实践

### NFR-002: 安全性

- **描述**：API Key安全存储
- **测量**：
  - API Key存储在chrome.storage.local（仅插件可访问）
  - 不在控制台日志中输出API Key
  - 网络请求使用HTTPS
- **优先级**：Must
- **来源**：安全最佳实践

### NFR-003: 可用性

- **描述**：插件应易于使用
- **测量**：
  - 首次使用有配置引导
  - 界面清晰直观
  - 错误提示友好易懂
- **优先级**：Should
- **来源**：用户体验最佳实践

## 5. 外部接口需求

### IF-001: Karakeep REST API

- **类型**：API
- **端点**：
  - `GET /api/v1/lists` - 获取所有列表
  - `GET /api/v1/lists/{listId}/bookmarks` - 获取列表内书签
  - `GET /api/v1/bookmarks` - 获取所有书签
  - `GET /api/v1/bookmarks/search?q={query}` - 搜索书签
- **认证**：`Authorization: Bearer {apiKey}`
- **请求/响应**：
  ```json
  // GET /api/v1/lists 响应
  {
    "lists": [
      {
        "id": "string",
        "name": "string",
        "icon": "string",
        "parentId": "string | null",
        "type": "manual | smart"
      }
    ]
  }

  // GET /api/v1/lists/{listId}/bookmarks 响应
  {
    "bookmarks": [
      {
        "id": "string",
        "title": "string | null",
        "content": {
          "type": "link",
          "url": "string",
          "title": "string | null"
        }
      }
    ],
    "nextCursor": "string | null"
  }
  ```
- **错误处理**：
  - 401: 认证失败，提示用户检查API Key
  - 404: 资源不存在
  - 5xx: 服务器错误
- **来源**：Karakeep OpenAPI规范

## 6. 过渡需求

不适用（新项目）。

## 7. 约束与假设

### 7.1 技术约束

- 浏览器：Chrome 和 Edge（基于Chromium）
- 使用Manifest V3规范
- 使用TypeScript开发
- 使用React构建UI

### 7.2 业务约束

- 只读操作，不进行新增、修改、删除
- 只显示link类型书签

### 7.3 假设

- 用户已部署karakeep实例并可访问其API
- API Key格式为 `ak2_{keyId}_{secret}` 或 `ak1_{keyId}_{secret}`

## 8. 优先级与里程碑建议

| ID | 需求 | 优先级 | 原因 |
|-----|------|------|------|
| FR-001 | 配置管理 | Must | 核心功能，其他功能依赖此功能 |
| FR-002 | 列表浏览 | Must | 核心功能 |
| FR-003 | 书签显示与访问 | Must | 核心功能 |
| FR-005 | 错误处理 | Must | 用户体验必需 |
| NFR-002 | 安全性 | Must | 安全必需 |
| FR-004 | 书签搜索 | Should | 增强功能 |
| FR-006 | 主题适配 | Should | 用户体验增强 |
| NFR-001 | 性能 | Should | 用户体验优化 |

**建议里程碑**：
- 里程碑1：配置管理 + 基础列表浏览 + 书签显示
- 里程碑2：搜索功能 + 主题适配 + 性能优化

## 9. 变更/设计提案 (RFC)

### 9.1 现状分析

- **当前架构**：无（全新项目）
- **当前问题**：用户需要便捷访问karakeep书签的方式
- **相关代码路径**：不适用

### 9.2 目标状态

- **提议架构**：
  ```
  kk-viewer/
  ├── src/
  │   ├── popup/                 # 弹窗页面
  │   │   ├── App.tsx            # 主应用组件
  │   │   ├── components/        # UI组件
  │   │   │   ├── ConfigPage.tsx # 配置页面
  │   │   │   ├── ListPage.tsx   # 列表浏览页面
  │   │   │   ├── BookmarkList.tsx # 书签列表
  │   │   │   ├── Breadcrumb.tsx # 面包屑导航
  │   │   │   └── SearchBar.tsx  # 搜索栏
  │   │   └── index.tsx          # 入口
  │   ├── background/            # Service Worker
  │   │   └── index.ts
  │   ├── api/                   # API客户端
  │   │   └── karakeep.ts        # Karakeep API封装
  │   ├── store/                 # 状态管理
  │   │   └── useStore.ts        # Zustand store
  │   └── utils/                 # 工具函数
  │       └── storage.ts         # 存储工具
  ├── public/
  │   ├── manifest.json          # 扩展manifest
  │   └── icons/                 # 图标资源
  ├── package.json
  └── vite.config.ts
  ```

- **关键变更**：
  1. 创建基于Manifest V3的浏览器扩展
  2. 实现层级导航的列表浏览界面
  3. 封装Karakeep API客户端
  4. 实现配置管理和持久化

### 9.3 详细设计

#### 9.3.1 模块/组件设计

**API客户端模块** (`src/api/karakeep.ts`)
```typescript
interface KarakeepClient {
  getLists(): Promise<ZBookmarkList[]>
  getListBookmarks(listId: string, cursor?: string): Promise<PaginatedBookmarks>
  searchBookmarks(query: string, cursor?: string): Promise<PaginatedBookmarks>
}
```

**状态管理** (`src/store/useStore.ts`)
```typescript
interface AppState {
  // 配置
  apiUrl: string | null
  apiKey: string | null
  setConfig: (url: string, key: string) => void
  clearConfig: () => void

  // 导航状态
  currentPath: ListItem[]  // 面包屑路径
  navigateTo: (list: ListItem | null) => void

  // 数据
  lists: ZBookmarkList[]
  bookmarks: Bookmark[]
  loading: boolean
  error: string | null
}
```

**组件结构**：
- `App.tsx`: 主容器，根据配置状态显示ConfigPage或ListPage
- `ConfigPage.tsx`: 配置表单，URL和Key输入，连接测试
- `ListPage.tsx`: 列表浏览主页面，包含面包屑、子列表、书签列表
- `Breadcrumb.tsx`: 面包屑导航组件
- `BookmarkList.tsx`: 书签列表组件，支持分页
- `SearchBar.tsx`: 搜索输入组件

#### 9.3.2 数据模型

**配置数据** (存储在chrome.storage.local)
```typescript
interface Config {
  apiUrl: string    // 如: https://karakeep.huangch.com
  apiKey: string    // 如: ak2_xxx_xxx
}
```

**导航状态**
```typescript
interface NavItem {
  id: string | null    // null表示根目录
  name: string
  icon?: string
}
```

#### 9.3.3 主流程

**列表浏览流程**：
1. 用户点击插件图标，打开弹窗
2. 检查配置：无配置 → 显示ConfigPage；有配置 → 显示ListPage
3. ListPage加载根级列表（parentId为null）
4. 用户点击列表：
   - 更新面包屑路径
   - 加载该列表的子列表和书签
5. 用户点击书签：在新标签页打开URL
6. 用户点击面包屑层级：跳转到对应层级

**搜索流程**：
1. 用户在搜索框输入关键词
2. 防抖300ms后发起搜索请求
3. 显示搜索结果（link类型书签）

#### 9.3.4 技术选型

| 技术 | 选择 | 原因 |
|------|------|------|
| 构建工具 | Vite + CRXJS | 快速构建，热重载，Manifest V3支持 |
| UI框架 | React 18 | 组件化开发，生态成熟 |
| 状态管理 | Zustand | 轻量级，TypeScript友好 |
| 样式 | Tailwind CSS | 快速开发，主题支持 |
| HTTP客户端 | 原生fetch | 简单够用，无额外依赖 |
| 语言 | TypeScript | 类型安全 |

### 9.4 备选方案

| 选项 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| Vite + CRXJS | 快速、热重载、V3支持 | 配置稍复杂 | **选择** |
| Webpack | 成熟稳定 | 构建慢、配置繁琐 | 拒绝 |
| Plasmo | 专为扩展设计 | 学习成本、限制较多 | 拒绝 |

| 选项 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| Zustand | 轻量、简单、TS友好 | 功能较少 | **选择** |
| Redux Toolkit | 功能强大、生态丰富 | 相对较重 | 拒绝 |
| Jotai | 极简、原子化 | 生态较小 | 拒绝 |

### 9.5 实施与迁移计划

#### 实施顺序

1. **Phase 1: 项目初始化**
   - 创建项目结构
   - 配置Vite + CRXJS
   - 配置Tailwind CSS
   - 创建manifest.json

2. **Phase 2: 配置管理**
   - 实现存储工具
   - 创建ConfigPage组件
   - 实现配置验证逻辑

3. **Phase 3: API客户端**
   - 创建Karakeep API客户端
   - 实现错误处理
   - 添加请求/响应类型

4. **Phase 4: 列表浏览**
   - 创建ListPage组件
   - 实现Breadcrumb组件
   - 实现层级导航逻辑

5. **Phase 5: 书签显示**
   - 创建BookmarkList组件
   - 实现分页功能
   - 实现书签点击打开

6. **Phase 6: 搜索功能**
   - 创建SearchBar组件
   - 实现搜索API调用
   - 实现搜索结果展示

7. **Phase 7: 优化与完善**
   - 主题适配
   - 性能优化
   - 错误处理完善

#### 风险缓解

| 风险 | 缓解策略 |
|------|------|
| API变更 | 使用类型定义，版本兼容 |
| 跨域问题 | 使用background script代理请求 |
| 存储限制 | 只存储必要配置，数据实时获取 |

#### 测试策略

- **单元测试**：API客户端、工具函数
- **集成测试**：组件交互、状态管理
- **E2E测试**：完整用户流程（手动测试）

#### 回滚计划

由于是全新项目，无需回滚计划。如遇重大问题，可重新构建。

## 10. TBD清单

| ID | 项目 | 缺失信息 | 下一步 |
|-----|------|------|------|
| TBD-1 | 插件图标 | 未定义图标设计 | 已解决：蓝色背景+白色'K' |
| TBD-2 | 分页大小 | 默认20条，是否合适 | 已确认：合适 |