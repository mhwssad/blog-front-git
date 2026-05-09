# 前端项目结构规范

## 1. 文档定位

本文档用于约束当前项目前端工程的目录结构、模块边界、文件落点和新增功能的落地方式。

适用范围：

- 仓库根目录下的工程组织方式
- `src/` 主源码目录
- `mock/` 本地联调数据目录
- `docs/` 协作文档目录
- 环境变量与开发命令相关约定

本文档专注于**结构规范**，不包含代码编写风格、Vue/TypeScript 细节等内容。代码编写规范请参考 `docs/code-writing-convention.md`。

本文档不替代以下文档：

- `CLAUDE.md`：仓库级开发摘要、命令、基础协作要求
- `docs/code-writing-convention.md`：约束代码书写风格、组件写法、命名规范等
- `docs/api文档/*`：约束接口路由、字段和业务行为

优先级说明：

- 目录、文件放置、模块职责、扩展落点以本文档为准
- 仓库命令、基础开发流程和通用工程说明以 `CLAUDE.md` 为准
- 代码风格、Vue/TypeScript 细节、文件命名以 `docs/code-writing-convention.md` 为准
- 接口字段和请求方式以 API 文档为准

## 2. 根目录结构规范

### 2.1 根目录职责

当前项目根目录的主要职责如下：

- `src/`：前端业务源码，所有正式业务实现必须放在这里
- `mock/`：本地 Mock 接口和测试数据
- `docs/`：协作文档、接口文档、结构规范、初始化 SQL 等
- `public/`：无需经过构建处理的静态资源
- `.env.development`、`.env.production`、`.env.example`：环境变量配置模板和运行配置
- `vite.config.ts`、`eslint.config.ts`、`tsconfig*.json`、`uno.config.ts`：构建和工程配置
- `dist/`：构建产物目录，不允许手工维护

### 2.2 根目录约束

- 业务代码必须放在 `src/`，禁止在根目录新增零散业务脚本或临时实现文件
- 协作文档必须放在 `docs/`，禁止把正式规范写进临时任务目录或聊天记录文件
- 新增环境变量时必须同步更新 `.env.example`
- 构建产物、缓存文件、调试输出不得作为正式源码维护

## 3. `src/` 主源码结构规范

### 3.1 目录职责

当前 `src/` 下目录职责固定如下：

- `src/views/`：页面级视图，按后台、前台、公共页面分区
- `src/components/`：全局可复用通用组件
- `src/layouts/`：布局壳、导航、头部、侧栏等框架层组件
- `src/api/`：接口请求封装、请求层基础设施
- `src/types/`：全局类型声明（接口类型定义在 `api-types.ts`）
- `src/stores/`：Pinia Store
- `src/router/`：固定路由、动态路由、菜单映射、守卫
- `src/composables/`：可复用组合式逻辑
- `src/plugins/`：应用级插件注册（v-permission 指令、Element Plus 图标）
- `src/config/`：应用配置聚合
- `src/utils/`：基础工具、格式化、日志、存储等工具能力
- `src/styles/`：全局样式、变量和主题相关样式
- `src/assets/`：需经过构建处理的静态资源

### 3.2 `views` 目录约束

`src/views/` 按场景固定分为：

- `src/views/admin`：后台管理页面
- `src/views/front`：前台页面
- `src/views/common`：登录、注册、错误页等跨场景公共页面

约束如下：

- 后台页面必须放在 `src/views/admin/**`
- 前台页面必须放在 `src/views/front/**`
- 公共页面必须放在 `src/views/common/**`
- 禁止在 `src/views/` 根目录放置任何页面文件
- 禁止把后台页面、前台页面、公共页面混放

#### 3.2.1 后台模块清单

当前后台已落地模块：

| 目录 | 说明 | 页面文件 |
| ------ | ------ | --------- |
| `admin/Dashboard.vue` | 后台首页（固定路由） | Dashboard.vue |
| `admin/user/` | 用户管理 | Users.vue, UserLevels.vue |
| `admin/article/` | 文章管理 | Articles.vue, ArticleReview.vue |
| `admin/role/` | 角色管理 | Roles.vue |
| `admin/category/` | 分类管理 | Categories.vue |
| `admin/tag/` | 标签管理 | Tags.vue |
| `admin/comment/` | 评论管理 | Comments.vue |
| `admin/notice/` | 通知管理 | Notices.vue |
| `admin/log/` | 日志管理 | Logs.vue |
| `admin/config/` | 配置管理 | Configs.vue |
| `admin/menu/` | 菜单管理 | Menus.vue |
| `admin/ai/` | AI 配置与统计 | AiConfigCenter.vue, AiUsageStats.vue |
| `admin/audit/` | 审计日志 | AuditLog.vue |
| `admin/author/` | 作者申请管理 | AuthorApplications.vue |
| `admin/channel/` | 频道管理 | ChannelManagement.vue, ChannelAudit.vue |
| `admin/chat/` | 聊天管理 | Chats.vue |
| `admin/collection/` | 收藏管理 | Collections.vue |
| `admin/file/` | 文件管理 | Files.vue |
| `admin/follow/` | 关注关系管理 | Follows.vue |
| `admin/footprint/` | 足迹管理 | Footprints.vue |
| `admin/interaction/` | 互动管理 | Interactions.vue |
| `admin/forum/` | 论坛管理 | ForumSections.vue, ForumPosts.vue, ForumReplies.vue |
| `admin/migration/` | 博客迁移管理 | MigrationTasks.vue |
| `admin/report/` | 举报管理 | ReportList.vue |

#### 3.2.2 前台模块清单

当前前台已落地模块：

| 目录 | 说明 | 页面文件 |
| ------ | ------ | --------- |
| `front/home/` | 首页 | HomeView.vue |
| `front/article/` | 文章详情 | ArticleDetail.vue |
| `front/about/` | 关于页 | AboutView.vue |
| `front/ai/` | AI 助手 | AiAssistant.vue |
| `front/author/` | 作者申请 | AuthorApply.vue |
| `front/category/` | 分类浏览 | CategoryView.vue |
| `front/channel/` | 频道 | ChannelList.vue, ChannelDetail.vue, ChannelApply.vue |
| `front/chat/` | 聊天 | ChatView.vue, GroupSettings.vue, JoinRequestsView.vue |
| `front/collection/` | 收藏 | CollectionsView.vue |
| `front/file/` | 用户文件 | UserFilesView.vue |
| `front/footprint/` | 足迹 | FootprintsView.vue |
| `front/friends/` | 好友 | FriendsView.vue |
| `front/forum/` | 论坛 | ForumHome.vue, ForumSection.vue, ForumPost.vue, ForumCreate.vue, ForumEdit.vue, MyForumPosts.vue |
| `front/hall/` | 大厅 | HallView.vue |
| `front/notice/` | 通知 | NoticesView.vue |
| `front/notification/` | 通知设置 | NotificationSettings.vue |
| `front/profile/` | 用户主页 | ProfileView.vue |
| `front/search/` | 搜索 | SearchView.vue |
| `front/series/` | 系列 | SeriesList.vue, SeriesDetail.vue |
| `front/settings/` | 用户设置 | UserSettings.vue |
| `front/tag/` | 标签 | TagDetailView.vue |
| `front/user/` | 用户资料 | UserProfileView.vue |

#### 3.2.3 公共页面

| 目录 | 说明 | 页面文件 |
| ------ | ------ | --------- |
| `common/auth/` | 认证页面 | Login.vue, Register.vue, ForgotPassword.vue |
| `common/err/` | 错误页面 | NotFound.vue, Forbidden.vue, ServerError.vue |

### 3.3 页面目录约束

一个业务模块应使用一个独立目录承载，目录名与业务语义保持一致。

约束如下：

- 复杂页面必须在同级创建 `components/` 存放私有组件
- 私有弹窗、抽屉、详情面板、局部卡片必须放在所属页面目录下的 `components/`
- 页面私有类型定义（如 `types.ts`）可放在同级目录
- 页面私有工具函数（如 `article-editor.ts`）可放在同级 `components/` 中
- 禁止把单页面私有组件放进 `src/components/`
- 禁止把多个无关业务页面塞进同一个目录

### 3.4 `components` 与 `layouts` 约束

#### 3.4.1 全局组件目录

`src/components/` 只允许放全局可复用组件，按类型分子目录：

```text
src/components/
├── common/         # 通用业务组件
│   ├── AuthorBadge.vue         # 作者标识
│   ├── ExperienceBar.vue       # 经验值进度条
│   ├── LevelRequirementTip.vue # 等级要求提示
│   ├── ReportDialog.vue        # 举报弹窗
│   ├── RiskConfirmDialog.vue   # 危险操作确认弹窗
│   ├── TwoFactorDialog.vue     # 二次验证弹窗
│   └── UserLevelBadge.vue      # 用户等级徽章
└── editor/         # 编辑器组件
    └── HtmlCodeEditor.vue      # CodeMirror HTML 编辑器
```text

只有被多个页面或多个业务域复用时，组件才允许进入 `src/components/`。页面私有组件优先就近放置，不上提到全局目录。

#### 3.4.2 布局目录

```text
src/layouts/
├── AdminLayouts.vue         # 后台壳布局
├── FrontLayout.vue          # 前台壳布局
└── components/
    ├── LayoutHeader/        # 后台头部
    │   ├── index.vue
    │   ├── HeaderActions.vue
    │   ├── HeaderBreadcrumb.vue
    │   ├── HeaderFullscreen.vue
    │   ├── HeaderNotice.vue
    │   └── HeaderUser.vue
    ├── LayoutSidebar/       # 后台侧栏
    │   ├── index.vue
    │   ├── SidebarMenu.vue
    │   └── SidebarMenuItem.vue
    ├── LayoutTabs/          # 后台标签页
    │   └── index.vue
    └── LayoutLogo.vue       # Logo 组件
```text

- `src/layouts/` 只允许放应用布局层组件
- 布局私有组件放在 `src/layouts/components/` 下

### 3.5 `api` 目录约束

`src/api/` 的结构和职责固定如下：

```text
src/api/
├── auth.ts               # 认证接口 (登录、注册、Token 刷新、退出)
├── content.ts            # 公开内容接口 (文章/分类/标签/评论的公开查询，class 风格)
├── follow.ts             # 公开关注接口 (关注列表、粉丝列表，class 风格)
├── request/              # Axios 实例、请求工具
│   ├── index.ts          # Axios 实例和请求方法
│   ├── utils.ts          # 请求工具函数
│   └── interceptors/     # 三层拦截器
│       ├── request.ts    # 请求拦截器
│       ├── response.ts   # 响应拦截器
│       └── refresh.ts    # Token 刷新拦截器
├── sys/                  # 后台管理接口
│   ├── article.ts        # 文章管理
│   ├── category.ts       # 分类管理
│   ├── tag.ts            # 标签管理
│   ├── comment.ts        # 评论管理
│   ├── user.ts           # 用户管理
│   ├── role.ts           # 角色管理
│   ├── menu.ts           # 菜单管理
│   ├── config.ts         # 配置管理
│   ├── notice.ts         # 通知管理
│   ├── log.ts            # 日志管理
│   ├── chat.ts           # 聊天管理
│   ├── file.ts           # 文件管理
│   ├── follow.ts         # 关注关系管理
│   ├── footprint.ts      # 足迹管理
│   ├── collection.ts     # 收藏管理
│   ├── interaction.ts    # 互动管理
│   ├── ai.ts             # AI 渠道配置与会话管理
│   └── report.ts         # 举报管理
└── user/                 # 用户侧接口
    ├── content.ts        # 用户内容操作
    ├── chat.ts           # 用户聊天
    ├── file.ts           # 用户文件
    ├── follow.ts         # 用户关注
    ├── notice.ts         # 用户通知
    ├── ai.ts             # 用户 AI 会话
    └── report.ts         # 用户举报
```text

约束如下：

- API 模块只负责请求发起、响应类型和必要的兼容归一化
- 禁止在 API 文件里写页面状态处理
- 公开接口放顶层（`auth.ts`、`content.ts`、`follow.ts`）
- 用户接口放 `user/`，后台接口放 `sys/`
- **禁止将用户侧和后台侧 API 混在同一个顶层文件中**（必须拆分到 `user/` 和 `sys/`）
- 统一复用 `src/types/api-types.ts` 中的公共类型（通过 `@/types/api-types` 引入）
- 非常局部、只在单一文件使用的类型才允许定义在当前文件
- 新增接口域时必须同步新增对应 API 模块到正确的子目录，不允许把多个无关领域堆在同一文件

### 3.6 `types` 目录约束

```text
src/types/
├── api-types.ts          # 所有接口类型定义（请求/响应 VO、分页、枚举等）
├── auto-imports.d.ts     # 自动导入类型（自动生成）
└── element-plus.d.ts     # Element Plus 类型扩展
```text

约束如下：

- 所有接口相关类型统一在 `api-types.ts` 中定义
- API 模块通过 `import type { ... } from '@/types/api-types'` 引入
- 禁止在 `src/api/` 目录下创建独立的类型文件

### 3.7 `stores`、`composables`、`utils` 约束

#### 3.7.1 Store 目录

```text
src/stores/
├── index.ts              # Store 统一导出
├── auth.ts               # 认证状态 (登录态、Token、用户信息)
├── tabs.ts               # 后台标签页管理
└── modules/              # 业务域 Store
    ├── article.ts, category.ts, tag.ts, comment.ts
    ├── user.ts, role.ts, menu.ts, config.ts
    ├── notice.ts, log.ts
    ├── chat.ts, file.ts, follow.ts, footprint.ts
    ├── collection.ts, interaction.ts
    ├── frontContent.ts                # 前台内容
    ├── userChat.ts, userContent.ts, userFile.ts
    ├── userFollow.ts, userNotice.ts
```text

约束如下：

- `src/stores/` 只放状态管理逻辑
- `src/stores/modules/` 放业务域 store
- 页面临时状态优先留在页面内部，不要无差别提升到 store
- 禁止在 store 中直接操作 DOM

#### 3.7.2 Composables 目录

```text
src/composables/
├── useContentAdmin.ts    # 后台内容管理页统一表格高度和分页布局
├── usePermission.ts      # 权限检查
└── useTableHeight.ts     # 表格高度自适应
```text

约束如下：

- `src/composables/` 只放可复用的组合式逻辑
- 只服务单个页面的交互逻辑留在页面内部

#### 3.7.3 Utils 目录

```text
src/utils/
├── index.ts              # 工具统一导出
├── baseUtils.ts          # 基础工具
├── contentAdmin.ts       # 内容管理常量和格式化（后台内容域选项、状态格式化）
├── systemAdmin.ts        # 系统管理常量和格式化（菜单/通知/日志域选项、状态格式化）
├── dateUtils.ts          # 日期格式化
├── formatUtils.ts        # 通用格式化
├── stringUtils.ts        # 字符串工具
├── arrayUtils.ts         # 数组工具
├── objectUtils.ts        # 对象工具
├── mapUtils.ts           # Map 工具
├── setUtils.ts           # Set 工具
├── treeUtils.ts          # 树结构工具
├── graphUtils.ts         # 图结构工具
├── mathUtils.ts          # 数学工具
├── randomUtils.ts        # 随机数工具
├── stackQueueUtils.ts    # 栈和队列工具
├── scheduleUtils.ts      # 调度工具
├── rateLimiterUtils.ts   # 限流工具
├── fileUtils.ts          # 文件操作工具
├── fileHashUtils.ts      # 文件哈希工具
├── domUtils.ts           # DOM 操作工具
├── vueDomUtils.ts        # Vue DOM 工具
├── http.ts               # HTTP 请求工具（Token 管理、错误处理）
├── permission.ts         # 权限匹配逻辑
├── loading.ts            # 全屏加载动画
├── logger.ts             # 日志工具
├── storage.ts            # 本地存储工具
├── iconUtils.ts          # Element Plus 图标工具
├── svgUtils.ts           # SVG 图标工具
├── markdown.ts           # Markdown 与 HTML 互转
└── contentAdmin.ts       # 内容管理常量和格式化
```text

约束如下：

- `src/utils/` 只放无状态工具、格式化、基础设施工具
- 禁止在 `utils` 中写页面强耦合逻辑
- `contentAdmin.ts` 和 `systemAdmin.ts` 分别承载后台内容域和系统域的选项常量和格式化函数，按域拆分

### 3.8 `router`、`plugins`、`config` 约束

#### 3.8.1 路由架构与目录

```text
src/router/
├── index.ts              # 路由创建和静态路由定义
├── guards.ts             # 路由守卫 (权限校验、动态路由注入)
├── fixed-routes.ts       # 固定路由 (前台路由 + 后台首页 Dashboard)
├── dynamic-routes.ts     # 动态路由解析和注册
├── component-resolver.ts # 动态路由组件解析
└── menu.ts               # 菜单工具函数
```

路由策略采用"固定前后台路由 + 后端菜单动态路由"的组合模式：

| 路由类型 | 来源 | 示例 |
| -------- | ---- | ---- |
| 前台固定路由 | 前端代码维护 | `/`、`/login`、`/register` |
| 后台固定路由 | 前端代码维护 | `/admin/dashboard` |
| 后台动态业务路由 | 后端菜单授权 | `/admin/users`、`/admin/articles` |

路径规范：

- `/admin/**` 统一视为后台，渲染 `AdminLayouts.vue`
- 非 `/admin/**` 统一视为前台
- 后台业务路由由后端 `GET /api/auth/current-user-menus` 动态返回
- 菜单 `routePath` 必须直接写最终访问路径，不支持旧路径别名（如 `/system/**`、`/content/**`）

常见组件映射：

| 后端 component | 前端页面文件 |
| -------------- | ------------ |
| `admin/user/Users` | `src/views/admin/user/Users.vue` |
| `admin/article/Articles` | `src/views/admin/article/Articles.vue` |
| `layouts/RouteView` | `RouterView` 容器 |

约束如下：

- 路由定义、动态菜单映射、路由守卫只能放在 `src/router/`
- 后台首页 (`/admin/dashboard`) 对应组件为 `src/views/admin/Dashboard.vue`
- 固定路由配置集中维护在 `src/router/` 下，禁止在页面中绕过路由守卫

#### 3.8.2 插件目录

```text
src/plugins/
├── element-plus.ts       # Element Plus 图标注册
└── permission.ts         # v-permission 指令注册
```text

- 应用级注册能力统一放在 `src/plugins/`
- 禁止在页面内重复实现菜单解析、权限初始化或全局错误注册

#### 3.8.3 配置目录

```text
src/config/
└── index.ts              # 应用配置聚合
```text

- 环境无关配置集中放在 `src/config/`

### 3.9 `styles` 目录

```text
src/styles/
├── index.css      # 全局样式引入
├── reset.css      # CSS 重置
├── variables.css  # CSS 变量
└── dialog.css     # 弹窗样式
```text

## 4. 模块协作与落地规则

### 4.1 页面、API、Store、Composable 的职责边界

- 页面层负责视图、交互、表单、页面局部状态
- API 层负责请求方法、参数、返回类型、字段兼容
- Store 层负责共享状态、缓存、异步流程编排
- Composable 层负责多页面可复用的交互逻辑或页面能力抽离

禁止行为：

- 在页面里重复拼装复杂请求逻辑
- 在 API 层里写视图提示和页面跳转
- 在 Store 中堆叠只服务单个页面的展示逻辑
- 在 `utils` 中实现依赖页面上下文的业务流程

### 4.2 新增业务模块的落地要求

新增一个完整业务模块时，至少应检查以下内容：

- 页面目录是否落在正确的 `views` 分区（admin/front/common）
- 私有组件是否拆到同级 `components/`
- API 模块是否按公开、用户、后台场景正确放置到对应子目录
- 用户侧和后台侧 API 是否拆分到 `user/` 和 `sys/`，禁止混合放在顶层
- 是否需要新增或扩展 Store
- 是否需要抽离 Composable
- 是否需要补 `utils` 中的格式化或常量
- 是否需要补 Mock 接口和测试数据
- 是否需要补 `docs/api文档` 或结构文档

## 5. Mock 目录规范

### 5.1 当前 Mock 结构

当前 `mock/` 已采用按领域拆分的方式组织：

- `auth.mock.ts`：认证相关 Mock
- `public-content.mock.ts`：公开内容 Mock
- `user-content.mock.ts`：用户内容 Mock
- `user-notice.mock.ts`：用户通知 Mock
- `system-basic.mock.ts`：系统基础模块 Mock
- `system-content.mock.ts`：系统内容模块 Mock
- `system-chat.mock.ts`：聊天模块 Mock
- `system-file.mock.ts`：文件模块 Mock
- `system-follow.mock.ts`：关注关系 Mock
- `shared.ts`：共用方法、分页工具、通用响应方法
- `test-data.json`：可复用测试数据

### 5.2 Mock 约束

- Mock 文件必须按业务域拆分，禁止重新合并成单个超大入口文件
- 领域共用方法、分页工具、通用响应方法统一放在 `mock/shared.ts`
- 可复用测试数据统一放在 `mock/test-data.json`
- 业务域自己的 Mock 逻辑应写在对应的领域文件中
- 禁止在每个 Mock 文件中重复维护同一份测试数据

### 5.3 Mock 与源码的对应关系

新增 API 域时，应同步补对应的 Mock 域规则：

- 新增公开接口域，应补对应公开 mock 文件
- 新增用户接口域，应补对应用户 mock 文件
- 新增后台接口域，应补对应后台 mock 文件

当前项目默认全部使用 Mock 数据，环境配置基线如下：

- `.env.development` 默认启用 `VITE_ENABLE_MOCK=true`
- `.env.production` 当前也保持 `VITE_ENABLE_MOCK=true`

如果后续恢复真实后端联调，必须同步更新环境变量说明和 README，而不是只改本地环境文件。

### 5.4 缺失的 Mock 文件

以下 API 域已有接口文件但尚未补充对应 Mock：

- `src/api/user/ai.ts` — 缺少 AI 用户侧 Mock
- `src/api/sys/ai.ts` — 缺少 AI 后台 Mock
- `src/api/user/report.ts` — 缺少举报用户侧 Mock
- `src/api/sys/report.ts` — 缺少举报后台 Mock

## 6. 文档与配置规范

### 6.1 文档目录规范

`docs/` 下文档职责固定如下：

- `docs/api文档/`：接口文档
- `docs/*-convention.md`：规范类文档
- `docs/task/`：任务协作文档
- `docs/init.sql`：初始化数据说明

约束如下：

- 结构规范、代码规范、路由规范等正式文档必须放在 `docs/`
- 接口变化优先更新接口文档，不要只在页面代码中隐式体现
- 新增规范文档时，建议同步补 README 中的文档入口

### 6.2 环境变量规范

- 所有环境变量必须在 `env.d.ts` 中声明
- 所有新增环境变量必须同步写入 `.env.example`
- 配置项优先收口到 `src/config/`
- 页面和业务代码不得直接散落读取大量环境变量

## 7. 结构命名规范

本文档只约束与结构相关的命名，不重复约束组件书写、函数签名、TypeScript 细节。

- 业务目录使用稳定语义命名
- 同类目录命名风格保持一致
- 页面目录、API 目录、Mock 文件目录名应与业务域一致
- 禁止使用 `temp`、`test1`、`new`、`demo` 这类无语义目录名
- 组件、Store、Composable、工具模块的具体命名细则以 `docs/code-writing-convention.md` 为准
- 禁止中英文混杂且无统一规则的目录命名

## 8. 禁止事项

- 禁止在 `src/views/` 根目录放置页面文件（必须按 admin/front/common 分区）
- 禁止把后台、前台、公共页面混放
- 禁止把页面私有组件堆进全局 `src/components/`
- 禁止将用户侧和后台侧 API 混在同一个顶层文件（必须拆分到 `user/` 和 `sys/`）
- 禁止在 `src/api/` 中定义类型文件（统一用 `src/types/api-types.ts`）
- 禁止新增业务接口只补请求层、不补 Mock
- 禁止把临时调试代码、临时测试脚本长期留在主源码目录
- 禁止绕过现有目录分层随意新增平铺文件
- 禁止修改环境配置但不更新文档说明

## 9. 执行原则

本文档以当前仓库真实结构为基准。后续如果项目发生目录级重构，应先更新本文档，再推进大规模结构调整，避免出现"代码已变、规范未变"或"规范已写、仓库未落地"的双轨状态。

命令、提交流程、基础验证要求不在本文档重复展开，统一以 `CLAUDE.md` 为准；代码书写和组件实现细节统一以 `docs/code-writing-convention.md` 为准。
