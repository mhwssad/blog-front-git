# Repository Guidelines

## 项目结构与模块组织
本仓库是基于 Vue 3、Vite、TypeScript 的前端项目。核心代码位于 `src/`：
- `src/views/`：页面级视图与后台功能页
- `src/components/`：通用组件
- `src/layouts/`：后台壳、顶部栏、侧边栏等布局
- `src/api/`：接口封装与类型定义
- `src/stores/`：Pinia 状态管理
- `src/router/`、`src/plugins/`、`src/utils/`、`src/composables/`：路由、插件、工具与组合式逻辑
- `src/assets/`、`public/`：静态资源

构建产物输出到 `dist/`，项目文档集中在 `docs/`。

## 构建、测试与开发命令
统一使用 `pnpm`，锁文件为 `pnpm-lock.yaml`。

- `pnpm dev`：启动本地开发服务
- `pnpm build`：先执行 `vue-tsc`，再构建生产包
- `pnpm build-only`：仅执行 Vite 构建
- `pnpm type-check`：检查 `.ts` 与 `.vue` 类型
- `pnpm lint`：运行 Oxlint 和 ESLint 自动修复
- `pnpm format`：使用 Prettier 格式化 `src/`

提交前至少执行 `pnpm type-check` 和 `pnpm build`。

## 编码风格与命名约定
格式由 `.editorconfig` 与 Prettier 统一约束：
- 2 空格缩进
- LF 换行
- 行宽 100
- 不使用分号
- 使用单引号

Vue 组件优先使用 `script setup` + TypeScript。组件文件使用 PascalCase，例如 `ArticleEditorPage.vue`；组合式函数使用 `useXxx`；Store 使用 `useXxxStore`；工具模块使用语义化命名。页面私有组件优先放在同级 `components/` 目录，避免把复杂页面写成单文件巨型组件。

前端界面开发优先使用 `element-plus` 现成组件与其组合能力完成需求；只有在组件库无法满足交互或展示要求时，才新增自定义基础组件，并保持风格与 `element-plus` 一致。

## 测试与验证
当前仓库没有独立的单元测试目录，`src/` 下也没有现成 `*.spec.ts` / `*.test.ts`。现阶段把 `pnpm type-check`、`pnpm lint`、`pnpm build` 作为最低验证标准。后续如果新增测试，建议就近放在功能目录旁，或集中到 `tests/`。

## 提交与合并请求规范
仓库已接入 `commitlint`、`commitizen`、`cz-git`，提交信息建议遵循 Conventional Commits，例如：
- `feat(article): 拆分文章编辑组件`
- `fix(layout): 修复后台滚动穿透`

PR 应包含变更说明、关联任务或问题、UI 改动截图/录屏，以及接口或配置影响说明。

## 配置与文档说明
新增环境变量时以 `.env.example` 为模板，不要提交敏感信息。`docs/` 目前包含 `auth-api.md`、`content-api.md`、`code-writing-convention.md`（含 Router 规范）、`init.sql`；`docs/task/` 目前为空。
