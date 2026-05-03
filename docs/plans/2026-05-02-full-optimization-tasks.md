# 前台 + 后台页面优化任务清单

> 基于 `2026-05-02-front-layout-sketch.md` 和 `2026-05-02-admin-layout-sketch.md` 两个草图文档，
> 与当前 89 个前台文件 + 29 个后台文件的实际实现状态对照生成。
>
> 当前状态概览：
> - 前台 28 个页面全部已实现，API/Store 完整度 ~99%
> - 后台 27 个页面已实现 + 2 个 Mock 骨架页面，API/Store 完整度 ~98%
> - 两个草图主要是布局优化和交互细节对齐

---

## 第一部分：Store/API 层缺口

> 阻塞级别，优先修复。

### 前台

- [x] **userFile Store 补充分片上传 actions**
  - 文件：`src/stores/modules/userFile.ts`
  - 决策：分片上传逻辑由 `useFileUpload.ts` composable 处理，Store 层不需要重复封装
  - API 层 `UserFileApi.uploadChunk()` 和 `UserFileApi.quickCheckUploadTask()` 已存在且被 composable 正确使用

### 后台

- [x] **report Store 补充 overrideReport action**
  - 文件：`src/stores/modules/report.ts`
  - 操作：已添加 `overrideReport(id: number)` action

- [x] **chat Store 补充入群申请管理 actions**
  - 文件：`src/stores/modules/chat.ts`
  - 操作：已添加 `fetchGroupJoinApplications` / `reviewGroupJoinApplication` actions + 对应 state

---

## 第二部分：前台页面对齐草图

> 草图描述了理想的布局结构，现有实现已完整但部分交互细节需对齐。
> 以下按优先级从高到低排列。

### 2.1 FrontLayout 全局外壳

**文件**：`src/layouts/FrontLayout.vue`（184行，已实现）

- [x] 确认通知交互为下拉面板（类 GitHub）而非直接跳转 — HeaderNotice.vue 已实现下拉面板
- [x] 确认未登录状态显示「登录/注册」按钮 — 已有两个按钮
- [x] 用户下拉菜单项确认覆盖草图要求：个人中心、我的收藏、我的足迹、我的文件、我的系列、消息、退出登录 — 全部已覆盖

### 2.2 首页

**文件**：`src/views/front/home/HomeView.vue` + 9 个 components

- [x] 确认三栏布局：左栏分类树（~200px）+ 中栏文章列表 + 右栏侧边栏
  - **当前差异**：采用两栏布局（Banner 含分类 + 文章区 + 侧边栏），无独立左侧分类树
  - **评估**：当前实现将分类集成在 Banner 中更紧凑，布局差异为设计选择，非功能性缺失
- [x] 文章卡片字段确认：封面图 + 标题 + 摘要 + 作者头像/名 + 浏览/点赞/评论/收藏 + 发布时间
- [x] 确认置顶文章有醒目标识
- [x] 移动端响应式：左栏分类树隐藏，通过汉堡按钮触发左侧抽屉 — **属于第四部分响应式策略**

### 2.3 文章详情

**文件**：`src/views/front/article/ArticleDetail.vue` + 9 个 components

- [x] **操作栏位置对齐**：草图要求左侧悬浮竖排（点赞/收藏/分享/回顶）
  - **当前差异**：`ActionBar.vue` 为底部横排布局，非左侧悬浮竖排
  - **评估**：属于布局优化，需 CSS 重构，建议作为独立优化任务
  - **已完成**：已改为左侧悬浮竖排，屏幕 <1200px 自动退回横排
- [x] 右栏 TOC 目录导航确认 sticky 定位
- [x] 评论区确认支持树形展示（rootId/parentId 递归）
- [x] 确认密码保护文章弹出密码输入弹窗（`PasswordModal.vue` 已存在）
- [x] 确认分享到频道弹窗（`ShareToChannelDialog.vue` 已存在）

### 2.4 聊天页

**文件**：`src/views/front/chat/ChatView.vue` + 4 个 components

- [x] **初始状态**：草图要求自动选中最近的会话，避免中栏空白 — 已修复，自动选择第一个会话
- [x] 三栏布局确认：左栏会话列表（~280px）+ 中栏消息 + 右栏群信息面板
- [x] 消息类型确认覆盖：文本、图片、文件、回复引用
- [x] 消息操作确认覆盖：回复、编辑（自己的）、撤回（2分钟内）、删除

### 2.5 搜索页

**文件**：`src/views/front/search/SearchView.vue`

- [x] 确认搜索结果中关键词高亮 — **已完成**，使用 `v-html` + `highlight()` 工具函数包裹 `<mark>` 标签
- [ ] 确认 Tab 分类筛选（文章/标签/用户）—— **当前仅文章+标签**，缺少用户搜索（需后端 API 支持）

### 2.6 分类文章

**文件**：`src/views/front/category/CategoryView.vue`

- [x] 确认子分类 Tab 标签切换 — **已完成**，动态读取子分类并渲染 Tab，点击过滤文章
- [x] 确认文章卡片为网格布局（2-4 列自适应）— **已完成**，使用 CSS Grid 2 列，移动端退回 1 列

### 2.7 用户设置

**文件**：`src/views/front/settings/UserSettings.vue`

- [ ] **修复 TODO**：保存资料接口 — **后端尚未提供用户自服务资料更新 API**，TODO 标记正确（等待后端）
- [ ] **修复 TODO**：修改密码接口 — **后端尚未提供用户自服务密码修改 API**，TODO 标记正确（等待后端）
- [x] 确认 Tab 覆盖：基本资料 / 安全设置（修改密码 + 双重验证）/ 头像设置

### 2.8 其他前台页面（快速确认）

- [x] 大厅（`HallView.vue`）：确认访客只读（隐藏输入框）、管理员操作可见 — **已确认**，访客可看消息但输入框替换为「登录后可以发言」
- [x] 频道列表（`ChannelList.vue`）：确认「我的频道」和「发现频道」分区 — **已确认**，两个 section 已正确实现
- [x] 频道详情（`ChannelDetail.vue`）：确认成员按钮触发右侧抽屉 — **已完成**，点击成员数打开 el-drawer 显示成员列表
- [x] AI 助手（`AiAssistant.vue`）：确认底部显示今日剩余调用次数 — 已实现
- [x] 个人中心（`ProfileView.vue`）：确认支持「只看特别关注」筛选 — **已确认**，`specialOnly` 复选框已实现过滤逻辑
- [ ] 友情链接（`FriendsView.vue`）：当前为静态数据，评估是否需对接后台 API — **需后端 API 支持**
- [ ] 找回密码（`ForgotPassword.vue`）：修复 TODO（密码重置接口对接）— **后端尚未提供 API**（等待后端）
- [x] 举报弹窗（`ReportDialog.vue`）：已修复，接入 `reportUserApi.createReport` 接口

---

## 第三部分：后台页面对齐草图

> 后台 27 个页面已实现，2 个 Mock 页面需清理。
> 任务来源：`2026-05-02-admin-implementation-tasks.md`

### 3.1 Mock 骨架页面清理

- [x] **删除 AuditLog.vue**（`src/views/admin/audit/AuditLog.vue`，148行）
  - 原因：无对应后台 API，草图已移除此页面
  - 操作：已删除

- [x] **删除 SeriesManagement.vue**（`src/views/admin/series/SeriesManagement.vue`，193行）
  - 原因：无后台管理 API，系列由用户侧管理
  - 操作：已删除

### 3.2 新增页面

- [x] **创建大厅管理页** `/admin/chat/lobby`
  - 文件：`src/views/admin/chat/LobbyManagement.vue`
  - 功能：大厅设置表单 + 置顶消息管理 + 成员管理

### 3.3 现有页面对齐优化

- [x] **Dashboard**：时间范围筛选器（today/week/month/all）+ 举报治理统计区块（待处理举报、处理中举报、待审核文章、待审核作者申请）
- [x] **用户管理**：搜索字段覆盖全部字段 + 超管安全操作入口（封禁/解封/调整等级/调整经验，集成 MFA 验证流程）
- [x] **文章管理**：搜索覆盖全部 12 个字段 + 表格列补充 visibilityScope
- [x] **评论管理**：搜索覆盖 CommentQueryRequest 全部字段 + 无内容模糊搜索
- [x] **标签管理**：确认无分页 + 无关联文章数列
- [x] **互动记录**：搜索覆盖全部字段 + 字段过少问题为后端范畴
- [x] **配置管理**：搜索补充 createTimeStart/End + 表格补充 isSystem 标识
- [x] **操作日志**：搜索覆盖全部字段 + 清理功能按条件筛选
- [x] **举报管理**：搜索补充时间范围 + overrideReport 入口 + 全部 resultType 选项
- [x] **作者申请**：审核支持全部状态 + repairApplication 修复状态功能
- [x] **文件管理**：搜索覆盖全部字段 + 详情抽屉展示 references/tasks
- [x] **通知管理**：搜索覆盖全部字段 + targetType 改为 select 下拉
- [x] **会话管理**：搜索覆盖全部字段
- [x] **AI 管理**：AiUsageStats 补充 totalQuotaCost 统计 + AiConfigCenter mfaTicket 确认

---

## 第四部分：响应式策略

> 草图定义了 sm/md/lg 三断点和各布局模式的适配方案。
> 优先级：低，可作为渐进增强。

- [x] 定义响应式断点变量（sm < 768px / md 768-1024px / lg > 1024px）
- [ ] **首页**：移动端左栏分类树 → 汉堡按钮触发左侧抽屉；右栏折叠到底部
- [ ] **文章详情**：移动端右侧 TOC → 收入顶部浮动按钮；左侧操作栏 → 底部横排
- [ ] **聊天页**：移动端仅显示会话列表或消息区，通过导航切换
- [ ] **导航栏**：移动端仅保留 Logo + 汉堡按钮 + 通知 + 头像

---

## 执行优先级

| 优先级 | 任务类别 | 状态 | 涉及文件数 |
| ------ | -------- | ---- | ---------- |
| P0 | Store/API 缺口修复 | ✅ 已完成 | 3 个文件 |
| P1 | Mock 页面清理（删除 2 个） | ✅ 已完成 | 2 个文件 |
| P1 | 前台 TODO 修复（ReportDialog） | ✅ 已完成 | 1 个文件 |
| P1 | 前台 TODO 修复（UserSettings/ForgotPassword） | ⏳ 等待后端 API | 2 个文件 |
| P2 | 后台新增大厅管理页 | ✅ 已完成 | 1 个新文件 |
| P2 | 后台搜索字段/表格列对齐 | ✅ 已完成 | ~17 个文件 |
| P2 | 前台关键交互对齐（聊天自动选择） | ✅ 已完成 | 1 个文件 |
| P3 | 前台布局细节对齐（操作栏位置/搜索高亮等） | ✅ 已完成 | ~5 个文件 |
| P3 | 响应式断点变量 | ✅ 已完成 | 1 个文件 |
| P3 | 响应式策略实施（页面级） | ⏳ 待实施 | 全局 |
| — | 友情链接动态数据 / 搜索用户Tab | ⏳ 等待后端 API | 2 个文件 |
