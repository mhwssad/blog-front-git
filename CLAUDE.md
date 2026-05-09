# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

博客前端项目，基于 Vue 3 + TypeScript + Vite + Element Plus 构建。前后端分离架构，前台展示博客内容，后台管理系统。

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

## 格式化

Prettier 配置为准 (`.prettierrc.json`):

- 不使用分号
- 使用单引号
- 缩进 2 空格
- 行宽 100
- 尾随逗号 `es5`

## 环境变量

- 所有环境变量在 `env.d.ts` 中声明
- 新增变量必须同步更新 `.env.example`
- 三套环境：`.env.development`（Mock）、`.env.staging`（联调）、`.env.production`（生产）
- 开发默认启用 Mock：`VITE_ENABLE_MOCK=true`
- 联调真实后端：`VITE_ENABLE_MOCK=false`，`VITE_API_BASE_URL` 指向后端地址

## 提交规范

遵循 Conventional Commits:

- `feat(article): 拆分文章编辑组件`
- `fix(layout): 修复后台滚动穿透`
- `chore: 更新依赖`

## 文档关联

- [项目结构规范](./docs/project-structure-convention.md) — 目录结构、模块边界、文件放置、路由架构
- [代码编写规范](./docs/code-writing-convention.md) — 代码风格、Vue/TS 细节、API/Store/Router 编写约定
