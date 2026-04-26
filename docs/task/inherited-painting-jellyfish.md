# 前台用户页面实现计划

## Context

`src/views/front/` 下有 8 个占位页面需要实现完整功能。已有 API 层（`src/api/user/` 和 `src/api/content.ts`）、Pinia Store（`frontContent`、`userContent`、`userNotice`）、路由和布局。用户选择"逐页实现"策略，按优先级顺序推进。

实现顺序：文章详情 → 收藏 → 足迹 → 通知 → 个人中心 → 用户主页 → 我的文件 → 聊天

---

## 页面 1：文章详情 `/articles/:id`

**关键文件**:
- 修改: `src/views/front/article/ArticleDetail.vue`
- 新增: `src/views/front/article/components/` 下组件
- 使用: `useFrontContentStore`（fetchArticleById, fetchArticleComments, clearCurrentArticle）
- 使用: `useUserContentStore`（likeArticle, unlikeArticle, likeComment, unlikeComment, createComment, deleteComment, collectionFolder CRUD, collection CRUD）
- 使用: `ContentApi.getArticleById(id)`, `ContentApi.getComments()`

**实现内容**:
- 面包屑导航 + 文章元信息（标题、作者、发布时间、分类、标签、统计数据）
- Markdown 内容渲染区（用 v-html 渲染后端返回的 content）
- 右侧 TOC 目录导航（从 Markdown headings 提取）
- 浮动操作栏：点赞/取消点赞、收藏/取消收藏（弹窗选择收藏夹）
- 评论区：评论输入框 + 树形评论列表（回复、点赞评论、删除自己的评论）
- 密码访问验证弹窗（accessLevel=2 时）
- 页面离开时 clearCurrentArticle

**组件拆分**:
- `ArticleDetail.vue` — 页面容器
- `components/ArticleHeader.vue` — 面包屑 + 元信息
- `components/ArticleContent.vue` — Markdown 渲染 + TOC
- `components/ActionBar.vue` — 浮动操作栏
- `components/CommentSection.vue` — 评论区容器
- `components/CommentInput.vue` — 评论/回复输入
- `components/CommentItem.vue` — 单条评论（含子评论递归）
- `components/CollectionModal.vue` — 收藏夹选择弹窗
- `components/PasswordModal.vue` — 密码验证弹窗

**验证**: 访问 `/articles/1` 可展示文章、点赞、评论

---

## 页面 2：我的收藏 `/user/collections`

**关键文件**:
- 修改: `src/views/front/collection/CollectionsView.vue`
- 新增: `src/views/front/collection/components/` 下组件
- 使用: `useUserContentStore`（collectionFolders, collections, 全部 CRUD）

**实现内容**:
- 左右分栏布局：左侧收藏夹列表 + 右侧收藏记录列表
- 收藏夹列表：新建、编辑、删除操作
- 收藏记录列表：分页展示，支持删除
- 收藏夹表单弹窗（新增/编辑）

**组件拆分**:
- `CollectionsView.vue` — 页面容器
- `components/FolderList.vue` — 收藏夹列表
- `components/FolderItem.vue` — 收藏夹项
- `components/CollectionRecordList.vue` — 收藏记录列表
- `components/FolderFormDialog.vue` — 收藏夹表单弹窗

**验证**: 访问 `/user/collections` 可查看/管理收藏夹和收藏记录

---

## 页面 3：我的足迹 `/user/footprints`

**关键文件**:
- 修改: `src/views/front/footprint/FootprintsView.vue`
- 使用: `useUserContentStore`（footprints, fetchFootprints, deleteFootprint, clearFootprints）

**实现内容**:
- 筛选栏（按 targetType 筛选）+ 清空全部按钮
- 足迹时间线列表（按日期分组，每条显示标题、访问时间、跳转链接、删除按钮）
- 分页

**组件拆分**: 单文件实现，结构简单

**验证**: 访问 `/user/footprints` 可查看和删除足迹

---

## 页面 4：通知中心 `/user/notices`

**关键文件**:
- 修改: `src/views/front/notice/NoticesView.vue`
- 新增: `src/views/front/notice/components/` 下组件
- 使用: `useUserNoticeStore`（myNotices, fetchMyNotices, markAsRead, markAllAsRead, fetchUnreadCount）

**实现内容**:
- 筛选标签（全部/未读/已读）+ 全部已读按钮
- 通知卡片列表（标题、摘要、时间、已读/未读标识、类型标签）
- 通知详情弹窗（点击展开）
- 分页

**组件拆分**:
- `NoticesView.vue` — 页面容器
- `components/NoticeItem.vue` — 通知卡片
- `components/NoticeDetailDialog.vue` — 通知详情弹窗

**验证**: 访问 `/user/notices` 可查看通知、标记已读

---

## 页面 5：个人中心 `/user/profile`

**关键文件**:
- 修改: `src/views/front/profile/ProfileView.vue`
- 新增: `src/views/front/profile/components/` 下组件
- 需新增 Store: `src/stores/modules/userFollow.ts`（封装 UserFollowApi）
- 使用: `useAuthStore`（currentUser）
- 使用: `UserFollowApi`（getMyFollows, getMyFans, getFollowCount, followUser, unfollowUser, updateSpecialFollow, updateFollowRemark）

**实现内容**:
- 个人信息卡片（头像、昵称、关注/粉丝数统计）
- Tab 切换：关注列表 / 粉丝列表
- 关注列表支持"只看特别关注"筛选
- 用户列表项：头像、昵称、互关标识、关注/取关按钮、特别关注星标、编辑备注
- 备注编辑弹窗

**组件拆分**:
- `ProfileView.vue` — 页面容器
- `components/ProfileCard.vue` — 个人信息 + 统计
- `components/FollowUserItem.vue` — 用户列表项
- `components/RemarkEditDialog.vue` — 备注编辑弹窗

**新增 Store** (`src/stores/modules/userFollow.ts`):
- state: follows, fans, followCount, fanCount, loading, 分页
- actions: fetchMyFollows, fetchMyFans, fetchFollowCount, followUser, unfollowUser, updateSpecial, updateRemark

**验证**: 访问 `/user/profile` 可查看关注/粉丝列表、关注/取关操作

---

## 页面 6：用户主页 `/users/:userId`

**关键文件**:
- 修改: `src/views/front/user/UserProfileView.vue`
- 使用: `FollowApi`（getUserFollows, getUserFans）— 公开 API，无需认证
- 使用: `UserFollowApi`（getMutualStatus）— 判断互关状态

**实现内容**:
- 用户信息卡片（头像、昵称）
- Tab 切换：关注列表 / 粉丝列表
- 分页用户列表

**组件拆分**: 单文件或 2 个组件，结构简单

**验证**: 访问 `/users/1` 可查看用户的关注/粉丝列表

---

## 页面 7：我的文件 `/user/files`

**关键文件**:
- 修改: `src/views/front/file/UserFilesView.vue`
- 新增: `src/views/front/file/components/` 下组件
- 需新增 Store: `src/stores/modules/userFile.ts`（封装 UserFileApi）
- 使用: `UserFileApi`（getMyFiles, deleteMyFile, initUploadTask, quickCheckUploadTask, uploadFile, uploadChunk, completeUploadTask, getMyUploadTasks）

**实现内容**:
- 筛选栏（文件名搜索、状态、分类筛选）
- 文件列表（表格或卡片视图）
- 上传按钮 + 上传弹窗（拖拽上传、进度条）
- 分片上传进度展示
- 上传任务抽屉
- 删除文件

**组件拆分**:
- `UserFilesView.vue` — 页面容器
- `components/FileUploadDialog.vue` — 上传弹窗
- `components/UploadTaskDrawer.vue` — 上传任务抽屉

**新增 Store** (`src/stores/modules/userFile.ts`):
- state: files, uploadTasks, loading, 分页
- actions: fetchFiles, deleteFile, initUpload, uploadFile/Chunk, completeUpload, fetchUploadTasks

**验证**: 访问 `/user/files` 可查看文件列表、上传文件

---

## 页面 8：聊天 `/chat`

**关键文件**:
- 修改: `src/views/front/chat/ChatView.vue`
- 新增: `src/views/front/chat/components/` 下组件
- 需新增 Store: `src/stores/modules/userChat.ts`（封装 UserChatApi + WebSocket）
- 使用: `UserChatApi`（22 个方法）
- 参考: `docs/前端/07-WebSocket聊天协议.md`

**实现内容**:
- 三栏布局：会话列表 | 聊天窗口 | 群信息面板
- 会话列表（搜索、未读数、最后消息预览）
- 聊天窗口（消息历史、发送文本/文件、回复引用、编辑/撤回/删除）
- 群信息面板（群公告、成员列表、管理操作）
- WebSocket 实时通信
- 创建群聊弹窗

**组件拆分**（大量组件）:
- `ChatView.vue` — 三栏布局容器
- `components/ConversationList.vue` — 会话列表
- `components/ConversationItem.vue` — 会话项
- `components/ChatWindow.vue` — 聊天窗口
- `components/MessageList.vue` — 消息列表
- `components/MessageItem.vue` — 消息项
- `components/MessageInput.vue` — 输入框
- `components/GroupInfoPanel.vue` — 群信息面板
- `components/CreateGroupDialog.vue` — 创建群聊弹窗

**新增 Store** (`src/stores/modules/userChat.ts`):
- WebSocket 连接管理
- 会话列表 + 消息历史 + 已读状态
- 发送/编辑/撤回/删除消息

**验证**: 访问 `/chat` 可查看会话、发送消息

---

## 执行规则

1. 每个页面实现后运行 `pnpm type-check && pnpm build` 验证
2. 新增 Store 注册到 `src/stores/index.ts` 导出
3. 组件放在对应页面目录的 `components/` 下
4. 复用已有的 `useAuthStore` 判断登录态
5. Mock 数据如需补充，同步更新 `mock/` 和 `test-data.json`
6. 遵循 CLAUDE.md 和 `docs/code-writing-convention.md` 代码规范
