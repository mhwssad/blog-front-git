# 前端代码编写规范

## 1. 文档定位

本文档用于统一当前项目的前端**代码编写风格、实现模式和协作约定**。

适用范围：

- Vue 单文件组件编写方式
- TypeScript 使用规范
- API、Store、Router 等模块的代码编写约定
- 格式化、注释、命名等编码风格

本文档专注于**代码编写规范**，不包含目录结构、文件放置、模块组织等内容。项目结构规范请参考 `docs/project-structure-convention.md`。

优先级说明：

- 代码风格、组件写法、TypeScript 用法以本文档为准
- 目录结构、文件放置、模块边界以 `docs/project-structure-convention.md` 为准
- 仓库命令、基础开发流程以 `AGENTS.md` 和 `CLAUDE.md` 为准

## 2. 总体原则

- 优先使用类型约束代替隐式约定
- 优先保持前后台代码风格一致
- 优先小步修改，避免一次性大范围重写
- 优先使用 Element Plus 现成组件，只在无法满足需求时才自定义基础组件，并保持风格一致
- 优先在 API 层做字段兼容和响应归一化，不在页面散落字段兜底逻辑
- 优先拆分通用组件和功能专属组件，避免职责混杂

## 3. 技术栈约定

- 框架：Vue 3 + TypeScript
- 构建：Vite + UnoCSS
- UI：Element Plus + @element-plus/icons-vue
- 状态管理：Pinia
- 路由：Vue Router
- 请求层：Axios（三层拦截器）+ WebSocket
- 校验与格式化：ESLint + Prettier
- 提交规范：commitlint + commitizen + cz-git

## 4. 格式化规范

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

## 5. 文件命名规范

### Vue 页面与组件

- Vue 文件名使用 PascalCase
- 列表页建议使用复数命名（如 `Users.vue`、`Articles.vue`）
- 对话框、抽屉、详情卡片等组件按职责命名（如 `UserFormDialog.vue`、`AssignMenusDialog.vue`）

### TypeScript 模块

- 组合式函数以 `use` 开头（如 `useTableHeight`、`usePermission`、`useContentAdmin`）
- Store 使用 `useXxxStore` 命名
- 普通工具模块使用语义化命名（如 `dateUtils.ts`、`storage.ts`）

### 文件放置

组件和文件的放置规则（全局组件 vs 私有组件、API 分层等）以 `docs/project-structure-convention.md` 为准，本文档不重复约束。

## 6. Vue 单文件组件规范

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

## 7. TypeScript 规范

- 能写类型时不要退回 `any`
- 接口请求、页面数据、表单数据都应有明确类型
- 共用类型统一放在 `src/types/api-types.ts`
- 局部类型仅在作用域非常明确时定义在当前文件
- 异步函数优先显式写返回值

推荐：

```ts
async function fetchRoles(): Promise<void> {}
```

不推荐：

```ts
async function fetchRoles() {}
```

## 8. 注释规范

以现有代码风格为准，简洁、聚焦于"为什么"而非"是什么"。

### 模块级注释

模块入口文件使用块注释说明职责：

```ts
/**
 * 用户管理 API
 */

export const userApi = { ... }
```

API 模块每个方法使用块注释，标注接口编号、方法、路径：

```ts
/**
 * 2.1 分页查询用户
 * GET /api/sys/users
 */
getUsers: (params?: UserQueryRequest) =>
  http.get<PageResult<SysUserAdminVO>>('/sys/users', params),
```

### 函数注释

- 工具函数和导出的公共函数使用块注释说明用途
- 内部函数如逻辑自明可不写注释
- 不要为每行操作写注释

### 内联注释

只在以下情况使用：

- 关键业务判断逻辑（如 `// Token 过期，跳转登录`）
- 非显而易见的处理（如 `// 防止重复刷新`）
- 临时代码需标注 `// TODO: ...` 或 `// FIXME: ...`

不写注释示例：

```ts
// 设置 loading
loading.value = true

// 调用 API
const response = await articleApi.getArticles(params)
```

### Vue 组件

- 不需要为每个组件写块注释
- 模板中不写 HTML 注释
- 复杂交互逻辑在 `<script>` 部分可加内联注释

## 9. API 编写规范

### http 封装用法

所有接口通过 `http.get<T>(url, params, config)` 发起，返回 `Promise<ApiResponse<T>>`。

常用配置选项：

- `skipAuth: true` — 跳过令牌注入（如注册接口）
- `skipRefresh: true` — 跳过 Token 刷新（如刷新接口本身）

### 编写要求

- 每个接口模块只负责本领域请求
- 请求注释写明接口编号、方法、路径
- 优先在 API 层做字段兼容和响应归一化
- 页面统一使用归一化后的字段名（如 `createTime`），不在页面散落字段兜底逻辑

例如：后端返回 `createdAt` 时，API 层 normalize 为 `createTime`，页面直接使用 `createTime`。

### 类型使用

- 所有接口类型统一使用 `src/types/api-types.ts` 中的定义
- API 模块通过 `import type { ... } from '@/types/api-types'` 引入
- 非常局部、只在单一文件使用的类型才允许定义在当前文件

## 10. Store 编写规范

### 编写要求

- 使用 setup 语法：`defineStore('name', () => { ... })`，返回含状态和方法的普通对象
- store 只暴露领域状态和领域动作
- 不在 store 内写与视图强耦合的 DOM 逻辑
- 请求失败返回布尔值或空结构时，要保持语义稳定
- 登录态相关能力统一收口到 `src/stores/auth.ts`
- 页面临时状态优先留在页面内部，不要无差别提升到 store

## 11. Router 编写规范

### 菜单类型

- `C`（目录）：菜单分组或路由容器，不直接加载业务页面，推荐 `component`: `layouts/RouteView`
- `M`（菜单页面）：真实可访问页面，必须提供 `routePath`
- `B`（按钮权限）：不注册为路由，仅用于按钮级权限控制

### component 解析规范

组件解析器位于 `src/router/component-resolver.ts`：

```ts
const viewModules = import.meta.glob('../views/**/*.vue')
export function resolveMenuComponent(menu): ResolvedMenuComponent
```

解析规则：

- `type=C` + `component=layouts/routeview` → 返回 `RouterView` 容器
- `type=M` + 其他 component → 从 `viewModules` 中查找匹配项（大小写不敏感）
- 查找失败时，打 warning 日志并跳过该菜单（不影响其他路由注册）

常见映射：

| 后端 component | 前端页面文件 |
| -------------- | ------------ |
| `admin/user/Users` | `src/views/admin/user/Users.vue` |
| `admin/article/Articles` | `src/views/admin/article/Articles.vue` |
| `layouts/RouteView` | `RouterView` 容器 |

### 动态路由注册流程

`src/router/dynamic-routes.ts` 中的 `buildAdminRoutes` 处理动态注册：

- **只处理 `M` 类型菜单**，`C` 和 `B` 类型不注册为路由
- 所有动态路由作为 `AdminLayout`（`/admin`）的子路由注册
- `routeName` 缺失时自动生成：从路径提取 PascalCase 名称，前缀 `Admin`
- 重复 `routeName` 时追加 `_${menuId}` 保证唯一性
- `keepAlive = 1` 允许页面缓存，`keepAlive = 0` 不缓存
- `icon` 使用 Element Plus 图标别名（`Home`、`User`、`Document` 等）

### 侧边栏菜单过滤

使用 `src/router/menu.ts` 中的 `filterVisibleMenus` 过滤：

- `visible === 1` 且 `type !== 'B'` 的菜单才显示

### 编写要求

- 固定路由配置集中维护在 `src/router/` 下
- 后端菜单路径与组件映射遵循上表规范
- 不要在页面里手写绕过路由守卫的跳转逻辑
- 新增后台业务页面时，优先检查：
  - 路由路径是否归一到 `/admin/**`
  - 页面组件是否在 `src/views/admin/**`
  - 后端 `component` 是否可被解析

## 12. 页面编写规范

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

## 13. 权限控制规范

### 按钮级权限

使用 `v-permission` 指令（注册在 `src/plugins/permission.ts`）：

```vue
<!-- 隐藏无权限按钮 -->
<el-button v-permission="'sys:user:create'">新增</el-button>

<!-- 禁用无权限按钮（样式变为半透明 + pointer-events:none） -->
<el-button v-permission.disable="'sys:user:update'">编辑</el-button>

<!-- 权限组：any 模式（满足任一即可） -->
<el-button v-permission.any="['sys:user:delete', 'sys:user:force-delete']">删除</el-button>

<!-- 对象形式：可指定 mode 和 action -->
<el-button
  v-permission="{ permissions: 'sys:user:delete', mode: 'any', action: 'disable' }"
>
  删除
</el-button>
```

指令模式说明：

- `v-permission`（默认）：无权限时 `display: none`
- `v-permission.disable`：无权限时 `disabled + 0.6透明度 + pointer-events:none`，同时禁用嵌套的 button/input/select/textarea
- `v-permission.any`：权限校验采用 OR 逻辑（默认 AND）

不要只隐藏按钮却保留无保护的点击逻辑。

## 14. 样式编写规范

### 基本原则

- 页面样式优先使用 `scoped`
- 全局变量和全局 reset 统一放在 `src/styles`
- 尽量复用 Element Plus 变量，不硬编码过多魔法值

### 类名建议

- 页面根容器：`xxx-page`
- 卡片：`search-card`、`table-card`
- 表格操作区：`table-actions`
- 页面头部：`card-header`

### 编写要求

- 优先保证桌面端和移动端都可用
- 对后台列表页，优先保证表格、分页、搜索区对齐统一
- 对弹窗，优先保证居中显示与合理滚动

## 15. 提交前检查清单

提交代码前至少确认：

1. 类型检查通过（`pnpm type-check`）
2. Lint 可通过或已知问题未被扩大（`pnpm lint`）
3. API 字段与页面字段命名一致，必要时已做 normalize
4. 新增组件命名符合 PascalCase 规范
5. 相关文档已同步更新

## 16. 不推荐做法

- 在页面里直接拼装与领域无关的大量请求逻辑
- 同一个功能出现多种写法
- 为了临时兼容，把字段兜底逻辑散落在多个页面
- 退回 `any` 类型
- 在 API 层写视图提示和页面跳转
- 在 Store 中堆叠只服务单个页面的展示逻辑
- 在 `utils` 中实现依赖页面上下文的业务流程