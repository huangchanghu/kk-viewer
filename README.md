# Karakeep Viewer

一个用于浏览 Karakeep 书签的浏览器扩展。

## 功能

- 配置 Karakeep 实例的 API URL 和 Key
- 层级浏览书签列表（面包屑导航）
- 书签搜索功能
- 支持深色/浅色主题（跟随浏览器）
- 分页加载书签

## 安装

### 开发模式

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 在 Chrome/Edge 中加载扩展：
   - 打开 `chrome://extensions/`（或 `edge://extensions/`）
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist` 目录

### 生产构建

```bash
npm run build
```

构建产物位于 `dist` 目录，可打包发布。

## 配置

首次使用时，点击扩展图标，输入：
- **API URL**: 你的 Karakeep 实例地址（如 `https://karakeep.example.com`）
- **API Key**: 在 Karakeep 设置中生成的 API Key（格式：`ak2_xxx_xxx`）

## 技术栈

- React 18
- TypeScript
- Zustand (状态管理)
- Tailwind CSS
- Vite + CRXJS
- Manifest V3

## 项目结构

```
kk-viewer/
├── src/
│   ├── popup/           # 弹窗页面
│   ├── components/      # React 组件
│   ├── api/            # API 客户端
│   ├── store/          # 状态管理
│   └── utils/          # 工具函数
├── public/
│   └── icons/          # 扩展图标
├── manifest.json       # 扩展清单
└── docs/
    └── SPEC-RFC.md     # 需求规格文档
```

## License

MIT