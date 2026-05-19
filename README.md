# blog-front

博客前端项目，基于 Vue 3 + TypeScript + Vite + Element Plus 构建。前后端分离，前台展示博客内容，后台管理系统。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.5 + TypeScript 6 |
| 构建 | Vite 8 + UnoCSS |
| UI | Element Plus 2 + @element-plus/icons-vue |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 5 |
| 请求 | Axios（三层拦截器：请求/响应/Token 刷新） |

## 开发命令

```text
pnpm dev          # 启动本地开发服务
pnpm build        # 类型检查 + 生产构建
pnpm build-only   # 仅构建
pnpm type-check   # vue-tsc 类型检查
pnpm lint         # Oxlint + ESLint 自动修复
pnpm format       # Prettier 格式化 src/
```

## Mock 调试

- 默认启用全量 Mock 数据（`VITE_ENABLE_MOCK=true`）
- Mock 按领域拆分：`mock/*.mock.ts`，共用逻辑在 `mock/shared.ts`，测试数据在 `mock/test-data.json`
- 默认测试账号：`admin / admin123`、`editor / editor123`、`tester / tester123`
- 联调真实后端：`VITE_ENABLE_MOCK=false`，设置 `VITE_DEV_PROXY_TARGET` 指向后端地址

## 项目结构

```text
src/
├── views/           # 页面视图
│   ├── admin/       # 后台管理页面
│   ├── front/       # 前台用户页面
│   └── common/      # 登录、注册、错误页
├── components/      # 全局通用组件
│   ├── common/      # 通用业务组件
│   └── editor/      # 编辑器组件
├── layouts/         # 布局组件（AdminLayouts 等）
├── api/             # 接口层
│   ├── auth.ts      # 认证接口
│   ├── content.ts   # 公开内容接口
│   ├── follow.ts    # 公开关注接口
│   ├── forum.ts     # 公开论坛接口
│   ├── websocket.ts # WebSocket 连接
│   ├── request/     # Axios 实例 + 拦截器
│   ├── sys/         # 后台管理接口
│   └── user/        # 用户侧接口
├── stores/          # Pinia Store
│   ├── auth.ts      # 认证态
│   └── modules/     # 业务域 store
├── router/          # 路由（固定 + 动态）
├── plugins/         # v-permission 指令、Element Plus 图标
├── composables/     # 组合式函数
├── utils/           # 工具函数
├── constants/       # 常量定义
├── i18n/            # 国际化
└── styles/          # 全局样式
```

后台动态路由由后端菜单驱动，前端根据 `GET /api/auth/current-user-menus` 动态注册。

## 项目文档

- [前端项目结构规范](./docs/project-structure-convention.md) — 目录结构、模块边界、文件放置、路由架构
- [前端代码编写规范](./docs/code-writing-convention.md) — 代码风格、Vue/TS 细节、API/Store/Router 编写约定
- [前端开发文档集](./docs/前端/README.md) — 页面设计、API 端点、数据模型、错误码
- [API 接口文档](./docs/api文档/README.md)
- [开发协作规范](./AGENTS.md)