# 前端代码编写规范

## 1. 文档定位

本文档用于约束当前项目的前端代码风格、实现方式、依赖使用边界和协作习惯。

适用范围：

- Vue 单文件组件
- TypeScript 与类型组织
- API、Store、Router、Composable、Utils 编写方式
- 当前 `package.json` 中依赖的推荐使用方式
- 本地开发、校验、测试与提交前验证

本文档只约束“怎么写代码”。目录结构、文件放置、模块落点请参考 `docs/project-structure-convention.md`。

优先级说明：

- 仓库真实代码、`package.json`、`vite.config.ts`、`eslint.config.ts`、`tsconfig*.json`、`.prettierrc.json` 高于本文档
- 本文档高于旧注释、历史写法和临时口头约定
- 当真实工程配置与本文档冲突时，应优先修正文档，避免“双轨规范”

## 2. 当前工程基线

当前仓库以以下组合为主：

- 框架：`vue@3.5` + `typescript@6`
- 构建：`vite@8` + `@vitejs/plugin-vue`
- UI：`element-plus` + `@element-plus/icons-vue`
- 状态管理：`pinia`
- 路由：`vue-router@5`
- 工具样式：`unocss` + `sass`
- 请求层：`axios`
- Mock：`vite-plugin-mock-dev-server`
- 自动导入：`unplugin-auto-import` + `unplugin-vue-components`
- 图表与编辑器：`echarts`、`codemirror`
- 测试：`vitest` + `@vue/test-utils` + `happy-dom`

总体原则：

- 优先沿用现有基础设施，不平地起新规范
- 优先在 API 层做兼容，不在页面散落兜底逻辑
- 优先显式类型，不靠字段猜测和隐式约定
- 优先小步演进，不做与任务无关的大重构
- 优先复用 Element Plus、Composable、Utils、现有业务组件

## 3. 依赖使用约定

### 3.1 已形成默认约定的依赖

| 依赖 | 当前状态 | 编写约定 |
| --- | --- | --- |
| `vue` | 默认框架 | 页面和组件统一使用 `<script lang="ts" setup>` |
| `typescript` | 默认语言 | 导出函数、Store、API、复杂对象都要有明确类型 |
| `vite` | 默认构建工具 | 使用 `@` 指向 `src`，不要写长相对路径链 |
| `element-plus` | 默认 UI 基座 | 表单、表格、弹窗、分页、上传优先复用现成组件 |
| `@element-plus/icons-vue` | 默认图标来源 | 优先使用 Element Plus 图标，不随意引入其他图标体系 |
| `pinia` | 默认共享状态方案 | Store 使用 setup 写法：`defineStore('xxx', () => {})` |
| `vue-router` | 默认路由方案 | 固定路由 + 后端菜单动态路由，路由逻辑只放 `src/router` |
| `axios` | 默认请求方案 | 所有请求走 `src/api/request` 的 `http` 封装 |
| `@vueuse/core` | 默认组合式工具库 | 优先复用 VueUse 能力，不重复手写常见监听、状态同步能力 |
| `date-fns` | 默认时间处理库 | 时间格式化、比较、计算统一走 `src/utils/dateUtils.ts` 或 `date-fns` |
| `spark-md5` | 默认文件哈希方案 | 文件上传、秒传、分片校验统一使用 MD5 能力 |
| `codemirror` + `@codemirror/*` | 默认代码编辑器方案 | 编辑器需求优先复用 `src/components/editor` 或既有封装 |
| `echarts` | 默认图表方案 | 图表能力优先复用 `src/composables/useECharts.ts`，按需注册模块 |
| `unocss` | 默认原子化样式工具 | 优先使用现有快捷类和原子类，避免重复写简单样式 |
| `vite-plugin-mock-dev-server` | 默认本地 Mock 能力 | 本地联调优先补 Mock，不要只改页面假数据 |
| `vitest` + `@vue/test-utils` + `happy-dom` | 默认单测方案 | 新增可复用逻辑时优先补 `src/**/__tests__/**/*.test.ts` |

### 3.2 已安装但应按场景使用的依赖

| 依赖 | 当前状态 | 使用边界 |
| --- | --- | --- |
| `vue-i18n` | 已有基础文件，但当前未在 `main.ts` 挂载 | 不要在页面内私自形成双轨文案；若正式启用，先补入口注册和全局约定 |
| `@stomp/stompjs` | 已安装，当前聊天仍使用原生 `WebSocket` | 新增实时能力优先复用 `src/api/websocket.ts`，不要直接混入 STOMP 协议实现 |
| `exceljs` | 已安装，当前前端未形成统一导出封装 | 需要前端生成 Excel 时先抽到 `utils`/`composables`，普通导出优先走后端文件流 |
| `lodash-es` | 已安装，源码当前未形成依赖 | 原生 `Array/Object/Map/Set` 足够时不要引入；确有复杂集合处理再按需引入单函数 |
| `qs` | 已安装，源码当前未形成依赖 | 仅在后端明确要求复杂 query 序列化时引入，普通请求继续使用 Axios `params` |
| `path-to-regexp` | 已安装，源码当前未形成依赖 | 仅用于复杂动态路径匹配，不要替代 Vue Router 自带能力 |
| `path-browserify` | 已安装，源码当前未形成依赖 | 仅限浏览器端路径处理场景，不要把 Node 端路径思维直接搬进页面 |
| `vue-draggable-plus`、`sortablejs` | 已安装，源码当前未形成依赖 | 拖拽排序、拖拽布局时统一选一种接入并先补封装，不要页面内裸接 |
| `vxe-table` | 已安装，当前后台列表主流仍是 `el-table` | 普通 CRUD 列表继续优先 `el-table`；只有复杂虚拟滚动、编辑表格才考虑引入 |
| `nprogress` | 已安装，当前未接入全局路由进度条 | 不要零散接入单页 loading bar；若要启用，先统一到 router/request 基建 |
| `animate.css` | 已安装，当前未作为默认动画体系 | 动画优先使用 CSS/UnoCSS；若引入 animate.css，必须控制范围，不做全局污染 |
| `default-passive-events` | 已安装，当前未作为全局入口副作用 | 不要页面内随意引入；若启用需在入口统一评估滚动和触控行为 |

### 3.3 工程与质量相关依赖

| 依赖组 | 当前状态 | 约定 |
| --- | --- | --- |
| `eslint`、`@eslint/js`、`eslint-plugin-vue`、`@typescript-eslint/*`、`typescript-eslint`、`vue-eslint-parser`、`globals` | 已接入 | 以 `eslint.config.ts` 为准，代码风格冲突不要靠“经验”处理 |
| `oxlint`、`eslint-plugin-oxlint` | 已接入 | `pnpm lint` 会一起执行，修代码时要同时满足两套校验 |
| `prettier`、`eslint-config-prettier`、`eslint-plugin-prettier` | 已接入 | 格式问题交给 Prettier，不手工维持与格式器冲突的排版 |
| `vue-tsc`、`@vue/tsconfig`、`@tsconfig/node24` | 已接入 | 类型问题以 `pnpm type-check` 为准 |
| `sass`、`postcss`、`autoprefixer` | 已接入 | 允许写 SCSS，但简单样式优先 `css` + UnoCSS |
| `stylelint` 相关依赖 | 已安装，当前仓库未见实际配置入口 | 不把 Stylelint 当成当前默认校验链，若启用需先补配置和脚本 |
| `unplugin-auto-import`、`unplugin-vue-components` | 已接入 | 使用自动导入约定，勿手写重复样板导入 |
| `vite-plugin-vue-devtools` | 已接入 | 仅开发辅助，不要写依赖其存在的业务代码 |
| `npm-run-all2` | 已接入 | 构建与校验脚本以 `package.json` 为准，不自行发明新入口 |
| `terser` | 构建依赖 | 只作为构建优化依赖看待，不在业务代码中感知 |
| `commitlint`、`commitizen`、`cz-git`、`husky`、`lint-staged` | 已接入 | 提交信息与提交前检查沿用现有流程，不绕过规范提交 |
| `@types/*` 系列 | 已接入 | 优先使用现成类型声明，不要重复声明第三方库类型 |

## 4. 格式化与静态检查规范

### 4.1 Prettier 基线

当前格式基线来自 `.prettierrc.json` 与 `.editorconfig`：

- 2 空格缩进
- LF 换行
- 不使用分号
- 使用单引号
- `printWidth = 100`
- `trailingComma = es5`
- `arrowParens = avoid`
- Vue `script` / `style` 不额外缩进
- 保留 Markdown 原有换行习惯，不强制硬折行

不要手工维护与 Prettier 冲突的格式。

### 4.2 ESLint 基线

当前 `eslint.config.ts` 已明确约束：

- Vue 组件与模板标签使用 PascalCase
- 自定义事件使用 camelCase
- `defineProps`、`defineEmits`、`defineExpose`、`defineOptions`、`defineSlots` 顺序固定
- 每行只允许一个模板属性，单行和多行都一样
- `vue/no-unused-refs`、`vue/prefer-separate-static-class` 等规则必须满足
- 类型导入统一使用 `import type`
- `no-explicit-any` 为 `warn`，不是“可随意使用”
- TypeScript 文件禁止悬空 Promise：`@typescript-eslint/no-floating-promises = error`

文档、示例和代码评审都要以这套规则为准，不要沿用旧文档中“一行多个属性也可以”之类的说法。

### 4.3 自动导入约定

当前 `vite.config.ts` 已接入自动导入：

- 自动导入来源：`vue`、`vue-router`、`pinia`、`@vueuse/core`
- 自动解析 Element Plus 组件和部分 API
- 生成文件：`src/types/auto-imports.d.ts`、`src/components.d.ts`

编写约定：

- 常用 Composition API、Router API、Pinia API、VueUse API 可直接使用
- 类型仍然显式导入，不依赖自动导入推断
- 服务类能力如 `ElMessage`、`ElMessageBox`、`ElLoading` 当前项目大量采用显式导入，新增代码继续保持显式
- 不手动修改自动生成的 `.d.ts` 文件

## 5. Vue 单文件组件规范

推荐结构：

```vue
<template>
  <section class="example-page">
    <el-card>
      <template #header>
        <span>标题</span>
      </template>
    </el-card>
  </section>
</template>

<script lang="ts" setup>
import type { ExampleItem } from '@/types/api-types'

interface Props {
  items: ExampleItem[]
}

const props = defineProps<Props>()
</script>

<style scoped>
.example-page {
  min-height: 100%;
}
</style>
```

编写要求：

- 默认使用 `<script lang="ts" setup>`
- 组件文件名统一 PascalCase
- 复杂页面逻辑优先拆到 `composables/`、同级 `components/` 或 `utils`
- 模板属性遵守“一行一个属性”
- `v-if`、`v-for`、`v-model`、`@click`、`v-permission` 等关键指令显式书写
- 组件对外事件必须通过 `defineEmits` 显式声明
- 对外暴露的方法通过 `defineExpose` 明确控制

组件内部顺序建议：

1. `import`
2. 类型声明
3. `defineProps` / `defineEmits`
4. `ref` / `reactive` / `computed`
5. 派生状态与常量
6. 请求函数
7. 事件函数
8. `watch` / 生命周期
9. `defineExpose`

## 6. TypeScript 与类型组织规范

### 6.1 基本要求

- 能明确类型时不要退回 `any`
- 公共函数、Store 动作、Composable 返回值、API 参数与响应都应具备明确类型
- 导出的异步函数在返回语义不明显时应显式声明 `Promise<T>`
- 类型导入统一使用 `import type`

推荐：

```ts
import type { UserProfileVO } from '@/types/api-types'

async function fetchProfile(): Promise<UserProfileVO | null> {
  return null
}
```

### 6.2 类型文件放置

当前仓库真实结构不是单个 `src/types/api-types.ts`，而是：

- `src/types/api-types/`：按业务域拆分 API 类型
- `src/types/api-types/index.ts`：统一导出入口
- `src/types/ui.ts`：界面相关类型
- `src/types/websocket.ts`：WebSocket 协议相关类型

编写约定：

- API 相关共享类型统一从 `@/types/api-types` 引入
- 新增业务域类型时，优先落到 `src/types/api-types/<domain>.ts`
- 只在当前页面或当前组件内部使用的极小类型可以本地声明
- 不在 `src/api/**` 中新建散落类型文件

### 6.3 TS 配置感知

当前 `tsconfig.app.json` 已启用：

- `noUncheckedIndexedAccess`
- `skipLibCheck`
- `@/* -> src/*`

因此：

- 对数组、对象、Map 的下标访问要处理 `undefined`
- 不要依赖“这个字段一定存在”的侥幸推断

## 7. 依赖驱动的实现规范

### 7.1 Element Plus

- 页面 UI 优先使用 `el-card`、`el-form`、`el-table`、`el-dialog`、`el-drawer`、`el-pagination`
- 普通后台列表页继续以 `el-table` 为默认实现，不默认切到 `vxe-table`
- 表单校验类型使用 `FormInstance`、`FormRules` 等官方类型
- 通知、确认框、全屏加载统一使用 `ElMessage`、`ElMessageBox`、`ElLoading`
- 图标统一优先使用 `@element-plus/icons-vue`

### 7.2 UnoCSS 与样式

- 简单布局、间距、对齐、文本截断优先使用 UnoCSS
- 项目已有快捷类应优先复用，如 `flex-center`、`flex-between`、`text-ellipsis`、`transition-base`
- 复杂样式、主题变量、组件级覆盖再回到 scoped CSS / SCSS
- 全局变量、reset、通用样式只放 `src/styles`
- 不要把大量 UnoCSS 原子类和大量重复 scoped 样式同时堆在一个节点上

### 7.3 VueUse

- 浏览器能力、状态同步、事件监听、尺寸侦听等优先查 VueUse，再决定是否自写
- 已有项目示例时优先沿用现成 composable，例如全屏、拖拽、日期格式化等
- 页面内如果只是一次性逻辑，不要为了“用库而用库”强行抽象

### 7.4 Axios 请求层

- 所有请求统一经由 `src/api/request/index.ts` 中的 `http`
- 使用已有的 `skipAuth`、`skipRefresh`、`retryCount`、`retryDelay` 等控制项
- API 文件只负责请求发起、类型约束、响应归一化
- 不在 API 层做路由跳转、DOM 操作、弹窗提示编排
- 公共请求参数能用 Axios `params` 解决时，不额外引入 `qs`

### 7.5 Pinia Store

- Store 使用 setup 写法
- 共享状态、认证上下文、跨页缓存、领域动作进入 Store
- 只服务单页面的临时开关、弹窗显示、局部表单状态优先留在页面内
- Store 内不直接操作 DOM，不写页面排版逻辑

### 7.6 Router

- 固定路由、动态路由、菜单过滤、守卫、组件解析统一放 `src/router`
- 后台动态路由组件解析依赖 `import.meta.glob('../views/**/*.vue')`
- 后端菜单 `component` 需可映射到 `src/views/**`
- `type = C` 的目录容器统一走 `layouts/RouteView`
- 不在页面中写绕过守卫的跳转旁路

### 7.7 WebSocket 与实时能力

- 当前项目实时通信标准是原生 `WebSocket` 封装：`src/api/websocket.ts`
- 包含自动重连、心跳、请求匹配、事件分发
- 新增聊天或实时通知能力优先扩展现有封装
- 不要在不同页面里分别维护各自的 socket 生命周期
- `@stomp/stompjs` 当前不是默认实现，除非完成统一升级，否则不要混用

### 7.8 编辑器、图表、文件处理

- 编辑器需求优先复用 `src/components/editor/HtmlCodeEditor.vue` 或既有文章编辑器能力
- ECharts 统一走 `useECharts`，按需注册图表和组件模块，不直接整库灌入页面
- 文件上传、秒传、分片上传统一复用 `useFileUpload` 与 `spark-md5`
- 需要导出 Excel 时，普通后台导出优先走后端文件流；确需前端生成时再引入 `exceljs` 封装

## 8. API、Store、Composable、Utils 编写规范

### 8.1 API

- API 模块只负责一个业务域
- 注释优先标清接口编号、方法、路径和必要的兼容说明
- 后端字段不稳定时，在 API 层做 normalize
- 页面统一使用归一化后的字段名，不重复写 `createdAt ?? createTime` 之类兜底

### 8.2 Composable

- 多页面复用或跨组件复用的交互逻辑进入 `src/composables`
- composable 返回值命名应稳定、语义化，如 `loading`、`list`、`fetchList`
- 纯页面私有逻辑不要为了“看起来高级”而过度抽离

### 8.3 Utils

- `src/utils` 只放无状态工具、格式化、基础设施与纯函数
- 日期处理优先走 `dateUtils.ts`
- 文件、哈希、权限、日志、存储分别复用现有工具模块
- 原生能力足够时，不强行为了引入 `lodash-es`、`path-browserify` 等额外包装

## 9. 页面编写规范

### 9.1 后台列表页

后台 CRUD 页面默认优先遵循以下组合：

- 搜索区
- 表格区
- 分页区
- 新增 / 编辑弹窗
- 必要时补详情弹窗、分配弹窗、审计抽屉

表格约定：

- 优先 `min-width`，谨慎写死 `width`
- 长文本优先 `show-overflow-tooltip`
- 高度管理优先 `useTableHeight`
- 操作区按钮配合 `v-permission`
- 普通列表继续优先 `el-table`，不要无故改成 `vxe-table`

### 9.2 表单与弹窗

- 新增、编辑尽量复用同一个表单组件
- 弹窗关闭时重置表单和局部状态
- 打开详情或编辑时按需拉取数据，不做无条件预请求
- 表单规则与类型一起维护，避免规则和模型脱节

### 9.3 前台页面

- 保持展示页、互动页、个人中心页的边界清晰
- 前台交互优先保证移动端可用
- 复杂上传、聊天、AI 对话、实时状态等页面优先复用既有 composable 和 store

## 10. 权限、日志与错误处理

### 10.1 权限

- 按钮级权限统一使用 `v-permission`
- 支持默认隐藏、`.disable`、`.any`、对象写法
- 不要只隐藏按钮而保留无保护的点击入口

### 10.2 日志

- 日志能力统一复用 `src/utils/logger` 与 `useLogger`
- 调试输出优先走日志工具，不随意散落 `console.log`
- 开发期临时日志在提交前应清理或收敛为正式 logger 调用

### 10.3 错误处理

- 页面层负责用户反馈
- API 层负责协议与数据层错误归一
- Store / composable 负责稳定返回值和流程兜底
- 不要让错误处理在 API、Store、页面三层重复弹消息

## 11. 测试与验证规范

当前命令以 `pnpm` 为准：

```sh
pnpm type-check
pnpm lint
pnpm test:run
pnpm build
```

约定如下：

- 提交前至少执行 `pnpm type-check` 和 `pnpm build`
- 触达共享逻辑、上传、请求、复杂 composable 时，优先补 `vitest`
- 测试文件放 `src/**/__tests__/`
- DOM 相关测试以 `happy-dom` 环境为准
- 新增生成文件、自动导入文件、Mock 文件时，不手改自动生成产物

## 12. 当前不推荐做法

- 在页面中重复拼装复杂请求逻辑
- 在多个页面散落后端字段兼容代码
- API 层直接写页面消息、页面跳转或 DOM 逻辑
- Store 中堆叠只服务单页面的展示状态
- 为了“用上依赖”而把未落地库直接裸接到页面
- 在普通 CRUD 场景滥用 `vxe-table`
- 原生能力足够时仍引入 `lodash-es`、`qs`、`path-browserify`
- 在未统一接入前随意启用 `vue-i18n`、`@stomp/stompjs`、`nprogress`
- 手改 `src/types/auto-imports.d.ts`、`src/components.d.ts`
- 用历史文档覆盖真实工程配置

## 13. 执行原则

本文档以当前仓库的真实依赖和现有实现为基础，不以“理论上可以怎么做”为准。

后续如果出现以下变化，应同步更新本文档：

- 新依赖被正式接入为默认基础设施
- 现有依赖被移除或替换
- ESLint、Prettier、TS、Vite 配置发生规则级变化
- 页面主流实现从 `el-table`、原生 `WebSocket`、当前 API 封装等迁移到新方案

目标不是把每个依赖都强行塞进业务代码，而是让“已安装的依赖有什么地位、什么时候该用、什么时候不要用”保持清晰且一致。
