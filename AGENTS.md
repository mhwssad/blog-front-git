# Repository Guidelines

## 项目概述

博客前端项目，基于 Vue 3 + TypeScript + Vite + Element Plus 构建。前后端分离架构，前台展示博客内容，后台管理系统。

## 构建、测试与开发命令

统一使用 `pnpm`，锁文件为 `pnpm-lock.yaml`。

- `pnpm dev`：启动本地开发服务
- `pnpm build`：先执行 `vue-tsc`，再构建生产包
- `pnpm build-only`：仅执行 Vite 构建
- `pnpm type-check`：检查 `.ts` 与 `.vue` 类型
- `pnpm lint`：运行 Oxlint 和 ESLint 自动修复
- `pnpm format`：使用 Prettier 格式化 `src/`

提交前至少执行 `pnpm type-check` 和 `pnpm build`。

## 编码风格

格式由 `.editorconfig` 与 Prettier 统一约束：

- 2 空格缩进、LF 换行、行宽 100、不使用分号、使用单引号
- Vue 组件优先使用 `script setup` + TypeScript，组件文件使用 PascalCase
- 组合式函数使用 `useXxx`，Store 使用 `useXxxStore`
- 优先使用 `element-plus` 现成组件完成需求

## 文档关联

- [项目结构规范](./docs/project-structure-convention.md) — 目录结构、模块边界、文件放置、路由架构
- [代码编写规范](./docs/code-writing-convention.md) — 代码风格、Vue/TS 细节、API/Store/Router 编写约定

## 提交与合并请求规范

仓库已接入 `commitlint`、`commitizen`、`cz-git`，提交信息建议遵循 Conventional Commits，例如：

- `feat(article): 拆分文章编辑组件`
- `fix(layout): 修复后台滚动穿透`

PR 应包含变更说明、关联任务或问题、UI 改动截图/录屏，以及接口或配置影响说明。
