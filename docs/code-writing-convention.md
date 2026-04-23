# 前端代码编写规范

## 目的

本文档用于统一当前项目的前端代码风格、目录组织和协作方式。

目标是减少以下问题：

- 同一类功能出现多种写法
- 目录结构混乱，组件职责不清
- 页面、接口、状态管理分层不稳定
- 新增功能时风格与现有代码割裂

本文档以**当前仓库已经采用的实现方式**为准，不额外引入一套脱离现状的规范。

## 适用范围

- `src/` 下所有前端业务代码
- `docs/` 下与前端实现相关的协作文档
- 重点覆盖：
  - Vue 单文件组件
  - TypeScript 模块
  - API 请求层
  - Pinia Store
  - Router
  - 样式文件

## 总体原则

- 优先遵循现有目录和命名约定，不随意创造新风格
- 优先拆分“通用组件”和“功能专属组件”，避免职责混杂
- 优先保持后台和前台分层清晰
- 优先让后端菜单、前端固定路由、页面组件三者关系明确
- 优先使用类型约束代替隐式约定
- 优先小步修改，避免一次性大范围重写

## 技术栈约定

- 框架：Vue 3 + TypeScript
- 构建：Vite
- UI：Element Plus
- 状态管理：Pinia
- 路由：Vue Router
- 请求层：Axios 封装
- 校验与格式化：
  - `eslint.config.ts`
  - `.prettierrc.json`
  - `pnpm lint`
  - `pnpm type-check`

## 格式化规范

当前项目以 Prettier 配置为准：

- 不使用分号
- 使用单引号
- 缩进 2 空格
- `printWidth = 100`
- 尾随逗号使用 `es5`
- Vue 模板单行可多个属性，但应优先保证可读性

不要手工维护与 Prettier 冲突的格式。

修改代码后建议至少执行：

```sh
pnpm type-check
pnpm lint
```

## 目录结构规范

### 前后台分层

- 前台页面统一放在 `src/views/front`
- 后台页面统一放在 `src/views/admin`
- 通用错误页、登录注册页放在 `src/views/common`
- 后台布局放在 `src/layouts`

### 功能目录

每个后台功能使用独立目录表示，不要把多个功能页面平铺在同一级目录里。

推荐示例：

- `src/views/admin/user`
- `src/views/admin/role`
- `src/views/admin/article`
- `src/views/admin/category`

### 组件目录

- 全局通用组件：`src/components`
- 功能专属组件：放在功能目录内的 `components/`

推荐示例：

- `src/components/admin/AdminResourceOverview.vue`
- `src/views/admin/user/components/UserFormDialog.vue`
- `src/views/admin/role/components/AssignMenusDialog.vue`

禁止把明显只服务于单个功能的组件继续堆到全局 `src/components`。

## 文件命名规范

### Vue 页面与组件

- Vue 文件名使用 PascalCase
- 列表页建议使用复数命名
- 对话框、抽屉、详情卡片等组件按职责命名

推荐示例：

- `Users.vue`
- `Roles.vue`
- `Articles.vue`
- `UserFormDialog.vue`
- `AssignMenusDialog.vue`
- `ArticleEditorPage.vue`

### TypeScript 模块

- 普通工具模块使用小写或语义化名称
- 组合式函数以 `use` 开头
- 类型文件使用统一聚合方式维护

推荐示例：

- `useTableHeight.ts`
- `permission.ts`
- `article-editor.ts`
- `types.ts`

## Vue 单文件组件规范

推荐结构：

```vue
<template>
</template>

<script lang="ts" setup>
</script>

<style scoped>
</style>
```

### `script setup` 约定

- 默认使用 `<script lang="ts" setup>`
- 类型导入优先使用 `import type`
- `defineProps`、`defineEmits`、`defineExpose` 顺序遵循 ESLint 规则
- 复杂页面逻辑优先抽到组合式函数或同目录工具文件

### 组件内部顺序建议

建议按下面顺序组织：

1. `import`
2. `Props / Emits / 局部类型`
3. `defineProps / defineEmits`
4. `ref / reactive / computed`
5. 工具函数
6. 请求函数
7. 事件函数
8. `watch / 生命周期`

### 模板书写约定

- 一行一个属性，复杂标签保持换行
- 显式写出关键 `v-model`、`@click`、`v-permission`
- 列表页表格列优先显式配置 `label`、`prop`、`min-width`
- 超长文本优先使用 `show-overflow-tooltip`

## TypeScript 规范

- 能写类型时不要退回 `any`
- 接口请求、页面数据、表单数据都应有明确类型
- 共用类型统一放在 `src/api/types.ts`
- 局部类型仅在作用域非常明确时定义在当前文件
- 异步函数优先显式写返回值，如 `Promise<void>`

推荐：

```ts
async function fetchRoles(): Promise<void> {}
```

不推荐：

```ts
async function fetchRoles() {}
```

## API 层规范

### 目录约定

- 认证相关：`src/api/auth.ts`
- 后台接口：`src/api/sys/*`
- 前台用户侧接口：`src/api/user/*`
- 公共内容接口：`src/api/content.ts`

### 编写要求

- 每个接口模块只负责本领域请求
- 请求注释写明接口编号、方法、路径
- 优先在 API 层做字段兼容和响应归一化
- 页面不要直接到处写字段兜底逻辑

例如：

- 如果后端可能返回 `createdAt`
- 但页面统一使用 `createTime`
- 应优先在 `src/api/sys/*.ts` 中做 normalize 处理

## Store 规范

### 使用原则

- 认证态、标签页、全局状态放在 `src/stores`
- 业务领域 store 放在 `src/stores/modules`
- 页面局部状态优先留在页面内部，不要所有数据都塞进 store

### 编写要求

- store 只暴露领域状态和领域动作
- 不在 store 内写与视图强耦合的 DOM 逻辑
- 请求失败返回布尔值或空结构时，要保持语义稳定
- 登录态相关能力统一收口到 `src/stores/auth.ts`

## Router 规范

当前项目采用：

- 固定前台路由
- 固定后台路由
- 后端菜单动态路由

详细规则见：

- `docs/backend-menu-routing-convention.md`

### 当前实现约定

- `/admin/**` 统一视为后台
- 非 `/admin/**` 统一视为前台
- `/admin/dashboard` 为前端固定后台首页
- 后端菜单主要驱动后台业务页

### 编写要求

- 固定路由配置集中维护在路由层
- 后端菜单路径与组件映射遵循既有规范
- 不要在页面里手写绕过路由守卫的跳转逻辑
- 新增后台业务页面时，优先检查：
  - 路由路径是否归一到 `/admin/**`
  - 页面组件是否在 `src/views/admin/**`
  - 后端 `component` 是否可被解析

## 页面编写规范

### 列表页

后台管理列表页建议统一包含：

- 搜索区
- 表格区
- 分页区
- 表单弹窗 / 详情弹窗 / 分配弹窗

常见结构：

```vue
<el-card class="search-card" />
<el-card class="table-card" />
<UserFormDialog />
```

### 表格

- 优先使用 `min-width` 而不是过多固定 `width`
- 需要时使用 `table-layout="auto"`
- 高度优先交给 `useTableHeight`
- 操作列按钮统一使用按钮组容器控制对齐

### 表单弹窗

- 新增和编辑尽量复用同一个弹窗组件
- 弹窗关闭时要重置表单
- 弹窗打开时再拉详情，不要默认无条件请求
- 对话框布局优先保证居中和移动端可用

## 权限控制规范

- 页面级访问由路由和后端菜单共同控制
- 按钮级权限统一使用 `v-permission`
- 禁用态权限统一使用 `v-permission.disable`
- 不要只隐藏按钮却保留无保护的点击逻辑

## 样式规范

### 基本原则

- 页面样式优先使用 `scoped`
- 全局变量和全局 reset 统一放在 `src/styles`
- 尽量复用 Element Plus 变量，不硬编码过多魔法值

### 类名建议

- 页面根容器：`xxx-page`
- 卡片：`search-card`、`table-card`
- 表格操作区：`table-actions`
- 页面头部：`card-header`

### 样式编写要求

- 优先保证桌面端和移动端都可用
- 对后台列表页，优先保证表格、分页、搜索区对齐统一
- 对弹窗，优先保证居中显示与合理滚动

## 文档同步规范

当以下内容发生变化时，应同步更新文档：

- 路由体系变化
- 后端菜单与组件映射规则变化
- 目录组织变化
- 通用组件位置变化
- 重要页面开发约定变化

推荐同步位置：

- `README.md`
- `docs/backend-menu-routing-convention.md`
- 本文档

## 提交前检查清单

提交代码前至少确认：

1. 类型检查通过
2. Lint 可通过或已知问题未被扩大
3. 新增页面目录符合当前结构
4. 新增组件位置符合“通用 / 专属”划分
5. API 字段与页面字段命名一致，必要时已做 normalize
6. `/admin` 后台页面与前台页面边界清晰
7. 相关文档已同步更新

## 不推荐做法

- 在页面里直接拼装与领域无关的大量请求逻辑
- 同一个功能拆出多套目录结构
- 为了临时兼容，把字段兜底逻辑散落在多个页面
- 后台页面写到 `src/views/front`
- 通用组件和专属组件混放
- 在没有文档同步的情况下修改路由基础约定

## 推荐阅读

- [后端菜单驱动路由规范](/e:/project/blog/blog-front/docs/backend-menu-routing-convention.md)
