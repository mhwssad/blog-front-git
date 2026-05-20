# 前端项目结构规范

## 1. 文档定位

本文档用于约束当前仓库的目录结构、模块边界、文件落点和结构级协作规则。

适用范围：

- 仓库根目录的工程组织方式
- `src/` 主源码目录
- `mock/` 本地联调与测试数据目录
- `docs/` 协作文档目录
- 环境变量、构建配置、测试配置等工程文件

本文档只回答“文件应该放在哪里、各目录负责什么、结构变更时要同步哪些地方”。
代码风格、Vue/TypeScript 写法、依赖使用约定请参考 `docs/code-writing-convention.md`。

## 2. 优先级与关联文档

本文档不替代以下文件：

- `AGENTS.md`：仓库级开发摘要、命令、提交流程、文档入口
- `CLAUDE.md`：仓库技术栈、环境变量、开发命令补充说明
- `docs/code-writing-convention.md`：代码书写、依赖使用、校验与测试约定
- `docs/api文档/**`：接口路径、字段、权限与业务行为

优先级说明：

- 仓库真实结构高于本文档
- 本文档高于旧说明、历史注释、口头约定
- 命令与提交流程以 `AGENTS.md` / `CLAUDE.md` 为准
- 代码写法以 `docs/code-writing-convention.md` 为准
- 接口定义以 `docs/api文档/**` 为准

当实际结构发生变化时，应先同步本文档，再继续扩展或重构。

## 3. 根目录结构规范

### 3.1 根目录职责

当前根目录的关键文件和目录职责如下：

| 路径 | 职责 |
| --- | --- |
| `src/` | 正式业务源码，所有前端实现必须落在这里 |
| `mock/` | Mock 接口、测试数据、分页和通用响应辅助 |
| `docs/` | 规范、API 文档、需求、计划、SQL 脚本、设计图 |
| `public/` | 不经过 Vite 构建处理的静态资源 |
| `AGENTS.md` | 仓库级开发与提交要求 |
| `CLAUDE.md` | 技术栈、环境和命令摘要 |
| `README.md` | 项目入口说明 |
| `package.json` | 脚本、依赖、Node 版本要求 |
| `pnpm-lock.yaml` | 锁文件，统一使用 `pnpm` |
| `env.d.ts` | `import.meta.env` 类型声明 |
| `.env.development` | 本地开发环境，默认启用 Mock |
| `.env.staging` | 联调环境，关闭 Mock，连接测试后端 |
| `.env.production` | 生产构建环境 |
| `.env.example` | 环境变量模板与说明 |
| `vite.config.ts` | Vite 构建与插件配置 |
| `vitest.config.ts` | Vitest 测试配置 |
| `eslint.config.ts` | ESLint Flat Config |
| `uno.config.ts` | UnoCSS 预设、快捷类、主题配置 |
| `tsconfig*.json` | TypeScript 工程配置 |
| `.editorconfig` / `.prettierrc.json` / `.oxlintrc.json` | 格式化和静态检查基础配置 |
| `dist/` | 构建产物目录，不手工维护 |

### 3.2 根目录约束

- 业务源码只能放在 `src/`
- Mock 相关代码只能放在 `mock/`
- 正式协作文档只能放在 `docs/`
- 新增环境变量时，必须同时更新 `env.d.ts` 和 `.env.example`
- 构建产物、缓存文件、调试输出不得作为正式源码维护
- 不在根目录新增零散业务脚本、临时实现文件、一次性测试文件

### 3.3 工具与本地目录

仓库中可能存在 `.codex/`、`.claude/`、`.roo/`、`.vscode/`、`.idea/` 等工具目录。

约束如下：

- 这些目录属于开发工具或代理协作元数据，不是业务源码
- 不在这些目录中放业务实现
- 如需新增团队长期使用的正式规则，优先写入 `AGENTS.md`、`CLAUDE.md` 或 `docs/`

## 4. `src/` 主源码结构规范

### 4.1 顶层目录职责

当前 `src/` 下目录职责固定如下：

| 目录 | 职责 |
| --- | --- |
| `src/views/` | 页面级视图，按后台、前台、公共页面分区 |
| `src/components/` | 全局可复用组件 |
| `src/layouts/` | 前后台布局壳及布局私有组件 |
| `src/api/` | API 请求封装、请求基础设施、WebSocket 封装 |
| `src/types/` | API 类型、UI 类型、WebSocket 类型、自动导入类型 |
| `src/stores/` | Pinia Store、Store 共享类型、Store 复用辅助 |
| `src/router/` | 固定路由、动态路由、守卫、菜单映射、组件解析 |
| `src/composables/` | 组合式逻辑 |
| `src/plugins/` | 应用级插件注册，如权限指令、图标注册 |
| `src/config/` | 应用配置聚合 |
| `src/constants/` | 全局常量与枚举 |
| `src/i18n/` | 国际化文案与 i18n 入口 |
| `src/styles/` | 全局样式、变量、reset、对话框样式 |
| `src/assets/` | 需参与构建的静态资源 |
| `src/utils/` | 无状态工具、日志、权限、格式化、文件与 DOM 工具 |

### 4.2 `views/` 页面分区规范

`src/views/` 固定分为三类：

- `src/views/admin/`：后台管理页面
- `src/views/front/`：前台业务页面
- `src/views/common/`：登录、找回密码、错误页等跨场景页面

约束如下：

- 禁止在 `src/views/` 根目录直接放页面文件
- 后台、前台、公共页面不能混放
- 复杂页面必须在同级创建 `components/` 目录存放私有组件
- 页面私有 `types.ts`、局部工具文件应就近放置，不上提到全局目录

#### 4.2.1 后台模块清单

当前后台主要模块如下：

| 目录 | 说明 | 主页面 |
| --- | --- | --- |
| `admin/dashboard/` | 后台首页与统计面板 | `index.vue` |
| `admin/user/` | 用户管理 | `Users.vue` |
| `admin/user-level/` | 用户等级与经验规则 | `UserLevels.vue` |
| `admin/article/` | 文章管理与审核 | `Articles.vue`、`ArticleReview.vue` |
| `admin/category/` | 分类管理 | `Categories.vue` |
| `admin/tag/` | 标签管理 | `Tags.vue` |
| `admin/comment/` | 评论管理 | `Comments.vue` |
| `admin/role/` | 角色管理 | `Roles.vue` |
| `admin/menu/` | 菜单管理 | `Menus.vue` |
| `admin/config/` | 系统配置 | `Configs.vue` |
| `admin/notice/` | 通知管理 | `Notices.vue` |
| `admin/log/` | 系统日志 | `Logs.vue` |
| `admin/file/` | 文件管理 | `Files.vue` |
| `admin/chat/` | 聊天后台治理 | `Chats.vue`、`Lobby*`、`GroupJoinApplications.vue` |
| `admin/follow/` | 关注关系管理 | `Follows.vue` |
| `admin/footprint/` | 足迹管理 | `Footprints.vue` |
| `admin/collection/` | 收藏管理 | `Collections.vue` |
| `admin/interaction/` | 互动记录管理 | `Interactions.vue` |
| `admin/ai/` | AI 管理中心 | `AiConfigCenter.vue`、`AiAgentManage.vue`、`AiToolManage.vue` 等 |
| `admin/audit/` | 审计日志 | `AuditLog.vue` |
| `admin/author/` | 作者申请审核 | `AuthorApplications.vue` |
| `admin/channel/` | 频道管理与审核 | `ChannelManagement.vue`、`ChannelAudit.vue` |
| `admin/forum/` | 论坛板块、帖子、回复管理 | `ForumSections.vue`、`ForumPosts.vue`、`ForumReplies.vue` |
| `admin/migration/` | 博客迁移任务 | `MigrationTasks.vue` |
| `admin/report/` | 举报处理 | `ReportList.vue` |

约束如下：

- 后台固定首页文件为 `src/views/admin/dashboard/index.vue`
- 后台新增业务页优先作为 `/admin` 子路由落地
- 管理页私有弹窗、抽屉、详情卡片必须放在该模块的 `components/`

#### 4.2.2 前台模块清单

当前前台主要模块如下：

| 目录 | 说明 | 主页面 |
| --- | --- | --- |
| `front/home/` | 首页 | `HomeView.vue` |
| `front/articles/` | 公开文章列表聚合页 | `ArticlesView.vue` |
| `front/article/` | 文章详情、创作与文章私有组件 | `ArticleDetail.vue`、`ArticleEditor.vue`、`ArticleList.vue` |
| `front/category/` | 分类浏览 | `CategoryView.vue` |
| `front/tag/` | 标签详情 | `TagDetailView.vue` |
| `front/user/` | 其他用户主页 | `UserProfileView.vue` |
| `front/profile/` | 当前用户个人中心 | `ProfileView.vue` |
| `front/settings/` | 账号设置 | `UserSettings.vue` |
| `front/ai/` | AI 助手 | `AiAssistant.vue` |
| `front/author/` | 作者申请 | `AuthorApply.vue` |
| `front/chat/` | 用户聊天 | `ChatView.vue`、`GroupSettings.vue`、`JoinRequestsView.vue` |
| `front/collection/` | 收藏中心 | `CollectionsView.vue` |
| `front/file/` | 用户文件 | `UserFilesView.vue` |
| `front/footprint/` | 足迹 | `FootprintsView.vue` |
| `front/forum/` | 论坛首页、发帖、编辑、我的帖子 | `ForumHome.vue`、`ForumCreate.vue`、`ForumEdit.vue`、`MyForumPosts.vue` |
| `front/channel/` | 频道列表、详情、申请 | `ChannelList.vue`、`ChannelDetail.vue`、`ChannelApply.vue` |
| `front/friends/` | 友情链接 | `FriendsView.vue` |
| `front/hall/` | 大厅 | `HallView.vue` |
| `front/notice/` | 通知中心 | `NoticesView.vue` |
| `front/notification/` | 通知设置 | `NotificationSettings.vue` |
| `front/search/` | 搜索 | `SearchView.vue` |
| `front/series/` | 系列列表与详情 | `SeriesList.vue`、`SeriesDetail.vue` |
| `front/about/` | 关于页 | `AboutView.vue` |

约束如下：

- 前台页面应保持展示页、用户页、互动页的模块边界清晰
- 如果某个前台目录既有真实路由页，也有该领域私有辅页，这是允许的
- 前台页面私有组件同样就近放在模块 `components/`

#### 4.2.3 公共页面

当前公共页面目录如下：

| 目录 | 说明 | 页面文件 |
| --- | --- | --- |
| `common/auth/` | 认证页 | `Login.vue`、`Register.vue`、`ForgotPassword.vue` |
| `common/err/` | 错误页 | `Forbidden.vue`、`NotFound.vue`、`ServerError.vue` |

### 4.3 `components/` 与 `layouts/` 规范

#### 4.3.1 全局组件目录

当前 `src/components/` 包含：

- `src/components/common/`：跨页面、跨业务域的通用组件
- `src/components/editor/`：编辑器相关全局组件
- `src/components/admin/`：预留给“跨多个后台模块复用”的后台公共组件，当前为空

`src/components/common/` 当前主要承载以下类别：

- 表格与列表辅助：`ActionColumn.vue`、`BatchToolbar.vue`、`DataTable.vue`
- 表单与弹窗基础件：`FormDialog.vue`、`DetailDialog.vue`
- 媒体与展示：`ImageUpload.vue`、`ImagePreview.vue`、`CodeBlock.vue`
- 权限与状态展示：`StatusSwitch.vue`、`UserCell.vue`、`UserLevelBadge.vue`
- 业务通用弹窗：`ReportDialog.vue`、`RiskConfirmDialog.vue`、`TwoFactorDialog.vue`

约束如下：

- 只有跨页面或跨业务域复用的组件才允许进入 `src/components/`
- 单页面私有组件必须留在所属页面目录
- 不要把暂时只用一次的后台弹窗提前上提到 `src/components/admin/`
- 编辑器类公共组件统一放 `src/components/editor/`

#### 4.3.2 布局目录

当前 `src/layouts/` 结构如下：

```text
src/layouts/
├── AdminLayouts.vue
├── FrontLayout.vue
└── components/
    ├── FrontHeader.vue
    ├── LayoutLogo.vue
    ├── SiteFooter.vue
    ├── LayoutHeader/
    ├── LayoutSidebar/
    └── LayoutTabs/
```

约束如下：

- 布局壳文件只放在 `src/layouts/` 根目录
- 布局私有组件只放在 `src/layouts/components/`
- 业务页面不要直接依赖布局内部实现细节

### 4.4 `api/` 目录规范

当前 `src/api/` 结构固定为三层：

```text
src/api/
├── auth.ts
├── content.ts
├── follow.ts
├── forum.ts
├── websocket.ts
├── request/
│   ├── index.ts
│   └── interceptors/
│       ├── request.ts
│       ├── response.ts
│       ├── refresh.ts
│       └── retry.ts
├── sys/
└── user/
```

约束如下：

- 顶层文件只放公开接口与请求基础设施
- 后台管理接口统一放 `src/api/sys/`
- 用户侧接口统一放 `src/api/user/`
- 禁止把用户侧和后台侧 API 混在同一个顶层文件
- `src/api/request/` 只放 Axios 实例、拦截器和请求封装
- 实时通信封装统一放 `src/api/websocket.ts`

### 4.5 `types/` 目录规范

当前 `src/types/` 真实结构如下：

```text
src/types/
├── api-types/
│   ├── index.ts
│   ├── common.ts
│   ├── auth.ts
│   ├── user.ts
│   ├── article.ts
│   └── ...
├── auto-imports.d.ts
├── element-plus.d.ts
├── ui.ts
└── websocket.ts
```

约束如下：

- API 共享类型按业务域拆分在 `src/types/api-types/`
- 统一通过 `src/types/api-types/index.ts` 暴露
- `src/types/ui.ts` 放界面层共享类型
- `src/types/websocket.ts` 放 WebSocket 协议类型
- 自动生成文件如 `auto-imports.d.ts` 不手工维护
- 禁止在 `src/api/` 目录中新增散落类型文件

### 4.6 `stores/` 目录规范

当前 `src/stores/` 除了常规 `auth.ts`、`tabs.ts`、`modules/` 外，还包含：

- `src/stores/index.ts`：统一导出入口
- `src/stores/types.ts`：Store 共享类型
- `src/stores/composables/`：Store 级复用辅助
- `src/stores/modules/chat/`：聊天 Store 按子领域进一步拆分

约束如下：

- 核心认证和标签页 Store 放根目录
- 业务域 Store 放 `src/stores/modules/`
- 如果某个大领域内部状态复杂，可以像 `chat/` 一样继续分子目录
- Store 共享类型优先放 `src/stores/types.ts`
- 仅服务 Store 体系的复用逻辑可放 `src/stores/composables/`

### 4.7 其他核心目录规范

#### 4.7.1 `router/`

当前 `src/router/` 包含：

- `index.ts`：创建路由实例
- `fixed-routes.ts`：前台固定路由、公共路由、后台固定首页
- `dynamic-routes.ts`：后台动态菜单路由注册与清理
- `component-resolver.ts`：后端 `component` 到实际视图组件的解析
- `guards.ts`：路由守卫
- `menu.ts`：菜单树辅助与规范化

约束如下：

- 路由定义、守卫、动态注册、菜单辅助只能放在 `src/router/`
- 后台固定首页入口为 `/admin/dashboard`，组件文件为 `src/views/admin/dashboard/index.vue`
- 动态后台路由统一作为 `AdminLayout` 子路由注册

#### 4.7.2 `plugins/`

当前 `src/plugins/` 只有：

- `element-plus.ts`
- `permission.ts`

约束如下：

- 全局注册能力统一放 `src/plugins/`
- 不在页面中重复注册全局指令、图标或全局插件

#### 4.7.3 `config/`

当前 `src/config/` 由 `index.ts` 聚合以下配置：

- API 配置
- 应用基础配置
- 日志配置
- 认证配置
- 上传配置
- 分页配置
- 表格配置

约束如下：

- 环境无关、业务可复用的应用配置统一收口到 `src/config/`

#### 4.7.4 `constants/`

当前 `src/constants/` 主要用于全局枚举和常量定义，现有文件为 `enums.ts`。

约束如下：

- 可跨模块复用、语义稳定的枚举与常量放这里
- 某个业务域私有常量优先留在该业务域附近

#### 4.7.5 `i18n/`

当前 `src/i18n/` 包含：

- `index.ts`
- `zh-CN.ts`
- `en.ts`

约束如下：

- 国际化文案和 i18n 初始化都只放在 `src/i18n/`
- 不在页面目录中零散维护全局文案表

#### 4.7.6 `styles/`

当前 `src/styles/` 包含：

- `index.css`
- `reset.css`
- `variables.css`
- `dialog.css`

约束如下：

- 全局样式、全局变量、reset、跨页面对话框样式统一放这里
- 页面私有样式留在组件自身的 `<style>` 中

## 5. 模块协作与落地规则

### 5.1 职责边界

- 页面层负责视图、交互、页面局部状态
- API 层负责请求方法、返回类型、字段兼容
- Store 层负责共享状态、缓存、异步流程编排
- Composable 层负责可复用交互逻辑
- Utils 层负责纯函数、基础设施和无状态工具

禁止行为：

- 在页面里重复拼装复杂请求逻辑
- 在 API 层写视图提示和页面跳转
- 在 Store 中堆叠单页展示逻辑
- 在 `utils` 中实现依赖页面上下文的业务流程

### 5.2 新增业务模块的同步清单

新增或重构一个业务域时，至少检查以下目录是否需要同步：

- `src/views/**`
- `src/api/**`
- `src/stores/**`
- `src/types/api-types/**`
- `src/composables/**`
- `src/utils/**`
- `mock/*.mock.ts`
- `mock/data/**`
- `docs/api文档/**`
- `docs/project-structure-convention.md`
- `docs/code-writing-convention.md`
- `env.d.ts`
- `.env.example`

## 6. Mock 目录规范

### 6.1 当前 Mock 结构

当前 `mock/` 已按公开、用户、后台场景拆分：

- 公开接口：`auth.mock.ts`、`public-content.mock.ts`、`public-extra.mock.ts`、`public-forum.mock.ts`
- 用户接口：`user-*.mock.ts`
- 后台接口：`system-*.mock.ts`
- 通用能力：`shared.ts`
- 测试数据：`mock/data/*.json`、`mock/data/index.ts`

### 6.2 Mock 约束

- Mock 文件必须按业务域拆分，不回退到单个超大入口文件
- 共用分页、响应组装和辅助函数统一放 `mock/shared.ts`
- 可复用测试数据统一放 `mock/data/`
- 新增 API 域时，应同步补齐对应 Mock 域

### 6.3 环境与 Mock 对应关系

结合 `AGENTS.md`、`CLAUDE.md` 与当前环境文件，约定如下：

- `.env.development`：`pnpm dev`，默认 `VITE_ENABLE_MOCK=true`
- `.env.staging`：`pnpm dev:staging` / `pnpm build:staging`，关闭 Mock，连接测试后端
- `.env.production`：`pnpm build`，关闭 Mock，用于生产构建
- `.env.example`：环境变量模板与三套环境说明

如果调整 Mock 策略或后端联调方式，必须同步更新环境文件说明和相关文档。

## 7. `docs/` 文档目录规范

### 7.1 当前文档目录

当前 `docs/` 顶层包含：

- `docs/api文档/`：接口文档
- `docs/需求文档/`：产品需求、业务草案、设计说明
- `docs/plans/`：开发计划与实施草案
- `docs/sql初始化脚本/`：数据库初始化脚本
- `docs/设计图片/`：设计稿与参考图
- `docs/code-writing-convention.md`：代码规范
- `docs/project-structure-convention.md`：结构规范
- `docs/需要修改的内容.md`：临时任务清单类文档

### 7.2 文档约束

- 正式规范文档必须放在 `docs/`
- 接口变化优先更新 `docs/api文档/**`
- 结构变化优先更新本文档
- 代码写法变化优先更新 `docs/code-writing-convention.md`
- 临时任务清单可以放在 `docs/`，但不能替代正式规范

## 8. 命名与结构约束

- 目录名应使用稳定、明确的业务语义
- 页面目录、API 文件、Mock 文件、Store 模块名应尽量保持领域一致
- 禁止使用 `temp`、`demo`、`new`、`test1` 之类无语义名称
- 禁止中英文混杂且没有统一规则的目录命名
- 前后台相同业务域应优先保持名称一致，避免一侧叫 `authorApplication`、另一侧叫 `authorReview` 这类不必要分裂

## 9. 禁止事项

- 禁止在 `src/views/` 根目录放页面文件
- 禁止把后台、前台、公共页面混放
- 禁止把页面私有组件堆进 `src/components/`
- 禁止将用户侧和后台侧 API 混在一个顶层文件
- 禁止继续把类型约定写成不存在的 `src/types/api-types.ts` 单文件模式
- 禁止新增业务接口只补请求层，不补 Mock 和类型
- 禁止修改环境文件却不更新 `env.d.ts` / `.env.example` / 文档说明
- 禁止把临时脚本、调试代码长期留在主源码目录
- 禁止出现“代码已变、文档未变”的长期双轨状态

## 10. 执行原则

本文档以当前仓库真实结构为准，而不是以历史规划图为准。

后续如果出现以下变化，应同步更新本文档：

- 新目录被正式纳入主工程结构
- 大模块被重命名、拆分或合并
- `src/types/`、`src/stores/`、`src/router/` 等基础目录发生结构升级
- 环境文件、Mock 组织方式、文档目录发生调整

结构规范的目标不是列一个永远不变的树，而是保证新增功能时每个文件都能找到明确、稳定、可维护的落点。
