# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

博客前端项目，基于 Vue 3 + TypeScript + Vite + Element Plus构建。前后端分离架构，前台展示博客内容，后台管理系统。

## 开发命令

```sh
pnpm dev          # 启动本地开发服务
pnpm build        # 类型检查 + 生产构建
pnpm build-only   # 仅构建
pnpm type-check   # vue-tsc 类型检查
pnpm lint         # Oxlint + ESLint 自动修复
pnpm format       # Prettier 格式化 src/
```

提交前至少执行 `pnpm type-check` 和 `pnpm build`。

## 技术栈

- **框架**: Vue 3.5 + TypeScript 6
- **构建**: Vite 8 + UnoCSS
- **UI**: Element Plus 2 + @element-plus/icons-vue
- **状态管理**: Pinia 3
- **路由**: Vue Router 5
- **请求**: Axios
- **编辑器**: CodeMirror 6 (文章编辑器)
- **图表**: ECharts 6
- **Mock**: vite-plugin-mock-dev-server

## 目录规范

### `src/views/` - 页面分区

```
src/views/
├── admin/      # 后台管理页面 (必须放在此目录)
├── front/      # 前台用户页面 (必须放在此目录)
└── common/     # 登录、注册、错误页等公共页面
```

**约束**: 后台页面禁止放在 front，前台页面禁止放在 admin。

### `src/views/admin/` - 后台页面结构

按业务域划分目录，每 个功能独立目录：

```
src/views/admin/
├── user/           # 用户管理
│   ├── Users.vue           # 列表页
│   └── components/         # 功能私有组件
│       ├── UserFormDialog.vue
│       └── AssignRolesDialog.vue
├── article/        # 文章管理
├── role/           # 角色管理
├── category/       # 分类管理
├── tag/            # 标签管理
├── comment/        # 评论管理
├── notice/         # 通知管理
├── log/            # 日志管理
└── config/         # 配置管理
```

**页面文件**: PascalCase 命名，如 `Users.vue`、`Roles.vue`
**私有组件**: 放在同级 `components/` 目录，名称体现职责

### `src/views/front/` - 前台页面结构

```
src/views/front/
└── home/           # 首页模块
    ├── HomeView.vue
    └── components/  # 首页私有组件
```

### `src/components/` - 全局通用组件

只允许被 2 个及以上页面复用的组件才能进入此目录。功能私有组件放在 `src/views/xxx/components/`。

```
src/components/
└── admin/
    └── AdminResourceOverview.vue
```

### `src/layouts/` - 布局组件

```
src/layouts/
├── AdminLayouts.vue      # 后台壳布局
├── components/
│   ├── LayoutHeader/
│   └── LayoutLogo.vue
```

### `src/api/` - 接口层

```
src/api/
├── auth.ts               # 认证接口
├── request/              # Axios 实例、拦截器
├── types.ts              # 统一接口类型定义
├── sys/                  # 后台管理接口 (menu, config, notice, log, article, category, tag, comment, collection, interaction, footprint)
└── user/                 # 用户侧接口 (content)
```

### `src/stores/` - 状态管理

```
src/stores/
├── auth.ts               # 认证状态 (登录态、Token、用户信息)
└── modules/              # 业务域 Store
    ├── user.ts, role.ts, article.ts, category.ts, tag.ts
    ├── comment.ts, collection.ts, interaction.ts
    ├── menu.ts, config.ts, notice.ts, log.ts, userNotice.ts
```

### `src/router/` - 路由

```
src/router/
├── index.ts              # 路由创建和静态路由定义
├── guards.ts             # 路由守卫 (权限校验、动态路由注入)
├── fixed-routes.ts       # 固定路由 (前台路由 + 后台首页)
├── dynamic-routes.ts     # 动态路由解析和注册
└── menu.ts               # 菜单工具函数
```

**路由策略**: 前台固定路由 + 后台 `/admin/dashboard` 固定 + 后端菜单动态路由

### `src/utils/` - 工具函数

无状态工具、格式化、存储等。按职责拆分，不在 utils 中写页面耦合逻辑。

### `src/composables/` - 组合式函数

可复用交互逻辑，如 `usePermission.ts`。

### `src/styles/` - 全局样式

```
src/styles/
├── index.css      # 全局样式引入
├── reset.css      # CSS 重置
└── dialog.css     # 弹窗样式
```

### `mock/` - Mock 数据

按业务域拆分，共享方法在 `mock/shared.ts`，测试数据在 `mock/test-data.json`。

```
mock/
├── auth.mock.ts
├── public-content.mock.ts
├── user-content.mock.ts
├── user-notice.mock.ts
├── system-basic.mock.ts
├── system-content.mock.ts
├── shared.ts
└── test-data.json
```

## 前端路由规范

### 路径规范

- `/admin/**` 统一视为后台管理页面，渲染 `AdminLayouts.vue`
- 非 `/admin/**` 统一视为前台页面
- 后台业务路由由后端 `GET /api/auth/current-user-menus` 动态返回

### 后台固定首页

- `/admin/dashboard` 为前端固定首页，由 `fixed-routes.ts` 定义
- 后端菜单主要维护 `/admin/users`、`/admin/articles` 等业务页

### 动态路由组件解析

后端返回的 `component` 字段映射到 `src/views/` 下页面：

| 后端 component | 前端页面文件 |
|--------------|------------|
| `admin/user/Users` | `src/views/admin/user/Users.vue` |
| `admin/article/Articles` | `src/views/admin/article/Articles.vue` |
| `layouts/RouteView` | 嵌套路由容器 `RouterView` |

## API 层规范

- 接口模块只负责本领域请求，字段兼容在 API 层处理
- 页面统一使用归一化后的字段名（如 `createTime`），不在页面散落字段兜底逻辑
- 后端返回 `createdAt` 时，API 层 normalize 为 `createTime`

## 权限控制

- 页面级访问由路由和后端菜单共同控制
- 按钮级权限使用 `v-permission` 指令
- 禁用态使用 `v-permission.disable`

## 格式化

Prettier 配置为准 (`.prettierrc.json`):

- 不使用分号
- 使用单引号
- 缩进 2 空格
- 行宽 100
- 尾随逗花 `es5`

## 环境变量

- 所有环境变量在 `env.d.ts` 中声明
- 新增变量必须同步更新 `.env.example`
- Mock 默认启用 (`VITE_ENABLE_MOCK=true`)
- 真实后端联调: `VITE_ENABLE_MOCK=false`，设置 `VITE_DEV_PROXY_TARGET`

## 提交规范

遵循 Conventional Commits:

- `feat(article): 拆分文章编辑组件`
- `fix(layout): 修复后台滚动穿透`
- `chore: 更新依赖`

## 文档关联

- [项目结构规范](./docs/project-structure-convention.md) - 目录结构、模块边界
- [代码编写规范](./docs/code-writing-convention.md) - 代码风格、Vue/TS 细节
- [代码编写规范](./docs/code-writing-convention.md) - 包含 Router 规范章节（动态路由映射规则）
- [前端开发文档](./docs/前端/README.md) - 页面设计、API 端点、数据模型
