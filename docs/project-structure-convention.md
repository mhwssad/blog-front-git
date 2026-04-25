# 前端项目结构与编写规范

## 1. 文档定位

本文档用于约束当前项目前端工程的目录结构、模块边界、文件落点和新增功能的落地方式。

适用范围：

- 仓库根目录下的工程组织方式
- `src/` 主源码目录
- `mock/` 本地联调数据目录
- `docs/` 协作文档目录
- 环境变量与开发命令相关约定

本文档是结构规范，不替代以下文档：

- `AGENTS.md`：仓库级开发摘要、命令、基础协作要求
- `docs/code-writing-convention.md`：约束代码书写风格、组件写法和分层写法
- `docs/code-writing-convention.md` 的 Router 规范章节：约束后端菜单与前端动态路由映射
- `docs/api文档/*`：约束接口路由、字段和业务行为

优先级说明：

- 目录、文件放置、模块职责、扩展落点以本文档为准
- 仓库命令、基础开发流程和通用工程说明以 `AGENTS.md` 为准
- 代码风格、Vue/TypeScript 细节以 `docs/code-writing-convention.md` 为准
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
- `src/api/`：接口请求封装、请求层基础设施、接口类型
- `src/stores/`：Pinia Store
- `src/router/`：固定路由、动态路由、菜单映射、守卫
- `src/composables/`：可复用组合式逻辑
- `src/plugins/`：应用级插件注册（v-permission 指令、Element Plus 图标）
- `src/config/`：应用配置聚合
- `src/utils/`：基础工具、格式化、日志、存储等工具能力
- `src/styles/`：全局样式、变量和主题相关样式
- `src/assets/`：需经过构建处理的静态资源
- `src/types/`：全局类型声明和自动生成类型文件

### 3.2 `views` 目录约束

`src/views/` 按场景固定分为：

- `src/views/admin`：后台管理页面
- `src/views/front`：前台页面
- `src/views/common`：登录、注册、错误页等跨场景公共页面

约束如下：

- 后台页面必须放在 `src/views/admin/**`
- 前台页面必须放在 `src/views/front/**`
- 公共页面必须放在 `src/views/common/**`
- 禁止把后台页面、前台页面、公共页面混放

### 3.3 页面目录约束

一个业务模块应使用一个独立目录承载，目录名与业务语义保持一致。

当前后台模块示例：

- `src/views/admin/user`
- `src/views/admin/role`
- `src/views/admin/article`
- `src/views/admin/comment`

当前前台模块示例：

- `src/views/front/home`
- `src/views/front/article`

约束如下：

- 复杂页面必须在同级创建 `components/` 存放私有组件
- 私有弹窗、抽屉、详情面板、局部卡片必须放在所属页面目录下的 `components/`
- 禁止把单页面私有组件放进 `src/components/`
- 禁止把多个无关业务页面塞进同一个目录

### 3.4 `components` 与 `layouts` 约束

- `src/components/` 只允许放全局可复用组件
- `src/layouts/` 只允许放应用布局层组件
- 页面私有组件优先就近放置，不上提到全局目录
- 只有被多个页面或多个业务域复用时，组件才允许进入 `src/components/`

### 3.5 `api` 目录约束

`src/api/` 的结构和职责固定如下：

- `auth.ts`：认证相关接口（登录、注册、Token 刷新、退出）
- `content.ts`：公开内容接口（文章/分类/标签/评论的公开查询）
- `request/`：Axios 实例、三层拦截器（请求/响应/Token 刷新）、请求工具函数
- `types.ts`：统一接口类型定义（ApiResponse、ApiError、AuthMenuInfo 等）
- `user/*`：登录用户侧接口（article、category、chat、collection、comment、file、follow、footprint、interaction、content）
- `sys/*`：后台管理接口（user、role、menu、config、notice、log、article、category、tag、comment、collection、interaction、footprint、chat、file、follow）

约束如下：

- API 模块只负责请求发起、响应类型和必要的兼容归一化
- 禁止在 API 文件里写页面状态处理
- 公开接口放顶层（auth.ts、content.ts），用户接口放 `user/`，后台接口放 `sys/`
- 统一复用 `src/api/types.ts` 中的公共类型
- 非常局部、只在单一文件使用的类型才允许定义在当前文件
- 新增接口域时必须同步新增对应 API 模块，不允许把多个无关领域堆在同一文件

### 3.6 `stores`、`composables`、`utils` 约束

- `src/stores/` 只放状态管理逻辑
- `src/stores/modules/` 放业务域 store
- 页面临时状态优先留在页面内部，不要无差别提升到 store
- `src/composables/` 只放可复用的组合式逻辑
- `src/utils/` 只放无状态工具、格式化、基础设施工具
- 禁止在 `utils` 中写页面强耦合逻辑
- 禁止在 store 中直接操作 DOM

### 3.7 `router`、`plugins`、`config` 约束

- 路由定义、动态菜单映射、路由守卫只能放在 `src/router/`
- 应用级注册能力统一放在 `src/plugins/`
- 环境无关配置集中放在 `src/config/`
- 禁止在页面内重复实现菜单解析、权限初始化或全局错误注册

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

- 页面目录是否落在正确的 `views` 分区
- 私有组件是否拆到同级 `components/`
- API 模块是否按公开、用户、后台场景正确放置
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

- 禁止把后台、前台、公共页面混放
- 禁止把页面私有组件堆进全局 `src/components/`
- 禁止在 `src/api` 中重复定义同域公共类型
- 禁止新增业务接口只补请求层、不补 Mock
- 禁止把临时调试代码、临时测试脚本长期留在主源码目录
- 禁止绕过现有目录分层随意新增平铺文件
- 禁止修改环境配置但不更新文档说明

## 9. 执行原则

本文档以当前仓库真实结构为基准。后续如果项目发生目录级重构，应先更新本文档，再推进大规模结构调整，避免出现“代码已变、规范未变”或“规范已写、仓库未落地”的双轨状态。

命令、提交流程、基础验证要求不在本文档重复展开，统一以 `AGENTS.md` 为准；代码书写和组件实现细节统一以 `docs/code-writing-convention.md` 为准。
