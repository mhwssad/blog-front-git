# 前端 API 联调导航

> 本文档是前端联调入口页，建议先看本页，再进入对应模块文档。
>
> 需确认项目阶段、开发规范或数据库修复口径，请回到 [`docs/README.md`](../README.md)。

---

## 目录结构

```
api文档/
├── README.md          # 本文件，总导航页
├── auth/               # 认证与用户
├── content/             # 内容与文章
├── chat/               # 聊天与消息
├── file/               # 文件与上传
├── follow/             # 关注与粉丝
├── forum/              # 论坛与社区
├── report/             # 举报管理
├── ai/                 # AI 对话
├── dashboard/          # 后台数据看板
└── migration/          # 外部博客迁移
```

---

## 快速索引

### 认证与用户

| 场景 | 文档 |
|---|---|
| 登录页 / 注册页 | [auth-login-api.md](auth/auth-login-api.md) |
| 后台框架初始化 | [auth-login-api.md](auth/auth-login-api.md) |
| 个人资料 / 修改密码 | [auth-profile-api.md](auth/auth-profile-api.md) |
| 通知中心 | [auth-notification-api.md](auth/auth-notification-api.md) |
| 用户经验等级 / 作者申请 | [auth-user-public-api.md](auth/auth-user-public-api.md) |
| 后台用户/角色/菜单管理 | [auth-admin-api.md](auth/auth-admin-api.md) |
| 后台用户管理 | [auth-user-admin-api.md](auth/auth-user-admin-api.md) |
| 后台菜单管理 | [auth-menu-admin-api.md](auth/auth-menu-admin-api.md) |
| 后台角色管理 | [auth-role-admin-api.md](auth/auth-role-admin-api.md) |
| 通知/作者申请后台 | [auth-notification-admin-api.md](auth/auth-notification-admin-api.md) |
| 超级管理员操作 | [auth-superadmin-api.md](auth/auth-superadmin-api.md) |
| 超管核心操作 | [auth-superadmin-ops-api.md](auth/auth-superadmin-ops-api.md) |
| 经验体系管理 | [auth-experience-admin-api.md](auth/auth-experience-admin-api.md) |
| 日志/审计管理 | [auth-audit-admin-api.md](auth/auth-audit-admin-api.md) |
| 系统配置管理 | [auth-config-admin-api.md](auth/auth-config-admin-api.md) |

### 内容与文章

| 场景 | 文档 |
|---|---|
| 博客首页 / 文章列表 / 详情 | [content-public-api.md](content/content-public-api.md) |
| 评论区 | [content-comment-api.md](content/content-comment-api.md) |
| 用户文章行为 | [content-article-user-api.md](content/content-article-user-api.md) |
| 用户收藏 | [content-collection-user-api.md](content/content-collection-user-api.md) |
| 用户足迹 | [content-footprint-user-api.md](content/content-footprint-user-api.md) |
| 后台内容管理 | [content-article-admin-api.md](content/content-article-admin-api.md) |
| 外部博客迁移 | [migration-api.md](migration/migration-api.md) |

### 社区与社交

| 场景 | 文档 |
|---|---|
| 论坛帖子/首页/详情 | [forum-post-api.md](forum/forum-post-api.md) |
| 论坛回复 | [forum-reply-api.md](forum/forum-reply-api.md) |
| 论坛互动/收藏/分享 | [forum-interaction-api.md](forum/forum-interaction-api.md) |
| 我的帖子/频道挂接 | [forum-my-posts-api.md](forum/forum-my-posts-api.md) |
| 后台版块管理 | [forum-board-admin-api.md](forum/forum-board-admin-api.md) |
| 后台帖子管理 | [forum-post-admin-api.md](forum/forum-post-admin-api.md) |
| 后台回复管理 | [forum-reply-admin-api.md](forum/forum-reply-admin-api.md) |
| 关注/粉丝列表 | [follow-relationship-api.md](follow/follow-relationship-api.md) |
| 互关/特别关注 | [follow-mutual-api.md](follow/follow-mutual-api.md) |
| 后台关注管理 | [follow-admin-api.md](follow/follow-admin-api.md) |
| 举报提交 / 记录 | [report-user-api.md](report/report-user-api.md) |
| 后台举报处理 | [report-admin-api.md](report/report-admin-api.md) |

### 文件与聊天

| 场景 | 文档 |
|---|---|
| 文件上传 / 我的文件 | [file-user-api.md](file/file-user-api.md) |
| 后台文件管理 | [file-admin-api.md](file/file-admin-api.md) |
| 会话列表 / 单聊 | [chat-conversation-api.md](chat/chat-conversation-api.md) |
| 消息发送 / 编辑 / 撤回 | [chat-message-api.md](chat/chat-message-api.md) |
| 群聊创建 / 成员管理 | [chat-group-api.md](chat/chat-group-api.md) |
| 频道挂接 / 申请 | [chat-channel-api.md](chat/chat-channel-api.md) |
| 后台聊天管理 | [chat-admin-api.md](chat/chat-admin-api.md) |
| 后台会话管理 | [chat-admin-conversation-api.md](chat/chat-admin-conversation-api.md) |
| 后台频道管理 | [chat-admin-topic-channel-api.md](chat/chat-admin-topic-channel-api.md) |
| 后台大厅管理 | [chat-admin-lobby-api.md](chat/chat-admin-lobby-api.md) |
| 后台频道申请 | [chat-admin-channel-application-api.md](chat/chat-admin-channel-application-api.md) |
| 后台群申请 | [chat-admin-group-application-api.md](chat/chat-admin-group-application-api.md) |
| 后台禁言管理 | [chat-admin-mute-api.md](chat/chat-admin-mute-api.md) |
| 大厅频道 | [chat-lobby-api.md](chat/chat-lobby-api.md) |
| WebSocket 客户端协议 | [websocket-client-api.md](chat/websocket-client-api.md) |
| WebSocket 服务端事件 | [websocket-server-events-api.md](chat/websocket-server-events-api.md) |
| WebSocket 前端集成 | [websocket-integration-api.md](chat/websocket-integration-api.md) |

### AI 与数据

| 场景 | 文档 |
|---|---|
| AI 对话 | [ai-user-api.md](ai/ai-user-api.md) |
| AI 渠道配置 | [ai-channel-admin-api.md](ai/ai-channel-admin-api.md) |
| AI 会话管理 | [ai-session-admin-api.md](ai/ai-session-admin-api.md) |
| AI 工具管理 | [ai-tool-admin-api.md](ai/ai-tool-admin-api.md) |
| AI MCP 服务管理 | [ai-mcp-admin-api.md](ai/ai-mcp-admin-api.md) |
| AI Agent 管理 | [ai-agent-admin-api.md](ai/ai-agent-admin-api.md) |
| AI 调用统计 | [ai-usage-admin-api.md](ai/ai-usage-admin-api.md) |
| AI 知识库管理 | [ai-knowledge-admin-api.md](ai/ai-knowledge-admin-api.md) |
| 后台数据看板 | [dashboard-api.md](dashboard/dashboard-api.md) |

---

## 文档速查

### auth - 认证与用户

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [auth-login-api.md](auth/auth-login-api.md) | 登录注册、Token刷新、退出登录 | `/api/auth/**` |
| [auth-profile-api.md](auth/auth-profile-api.md) | 个人资料、修改密码 | `/api/user/profile/**` |
| [auth-notification-api.md](auth/auth-notification-api.md) | 通知中心、用户通知设置 | `/api/user/notices/**`、`/api/user/notification-settings/**` |
| [auth-user-public-api.md](auth/auth-user-public-api.md) | 用户经验等级、作者申请、公开用户搜索 | `/api/user/experience/**`、`/api/user/author-applications/**`、`/api/users/**` |
| [auth-admin-api.md](auth/auth-admin-api.md) | 后台管理索引页 | `/api/sys/**` |
| [auth-user-admin-api.md](auth/auth-user-admin-api.md) | 后台用户管理 | `/api/sys/users/**` |
| [auth-menu-admin-api.md](auth/auth-menu-admin-api.md) | 后台菜单管理 | `/api/sys/menus/**` |
| [auth-role-admin-api.md](auth/auth-role-admin-api.md) | 后台角色管理 | `/api/sys/roles/**` |
| [auth-notification-admin-api.md](auth/auth-notification-admin-api.md) | 通知/作者申请后台 | `/api/sys/notices/**`、`/api/sys/author-applications/**` |
| [auth-superadmin-api.md](auth/auth-superadmin-api.md) | 超管索引页 | `/api/admin/**` |
| [auth-superadmin-ops-api.md](auth/auth-superadmin-ops-api.md) | 超管核心操作 | `/api/admin/**` |
| [auth-experience-admin-api.md](auth/auth-experience-admin-api.md) | 经验体系管理 | `/api/sys/experience/**` |
| [auth-audit-admin-api.md](auth/auth-audit-admin-api.md) | 日志/审计管理 | `/api/sys/logs/**`、`/api/sys/audit-logs/**` |
| [auth-config-admin-api.md](auth/auth-config-admin-api.md) | 系统配置管理 | `/api/sys/configs/**` |

### content - 内容与文章

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [content-public-api.md](content/content-public-api.md) | 前台内容页 | `/api/articles/**`、`/api/categories/**`、`/api/tags/**` |
| [content-comment-api.md](content/content-comment-api.md) | 文章评论 | `/api/comments/**`、`/api/user/comments/**` |
| [content-user-api.md](content/content-user-api.md) | 用户内容行为索引页 | `/api/user/articles/**`、`/api/user/collections/**` |
| [content-article-user-api.md](content/content-article-user-api.md) | 用户文章行为 | `/api/user/articles/**` |
| [content-collection-user-api.md](content/content-collection-user-api.md) | 用户收藏 | `/api/user/collections/**` |
| [content-footprint-user-api.md](content/content-footprint-user-api.md) | 用户足迹 | `/api/user/footprints/**` |
| [content-article-admin-api.md](content/content-article-admin-api.md) | 后台内容管理 | `/api/sys/articles/**`、`/api/sys/comments/**` |

### chat - 聊天与消息

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [chat-conversation-api.md](chat/chat-conversation-api.md) | 会话列表、创建单聊 | `/api/user/chat/conversations/**` |
| [chat-message-api.md](chat/chat-message-api.md) | 消息发送、编辑、撤回 | `/api/user/chat/messages/**` |
| [chat-group-api.md](chat/chat-group-api.md) | 群聊管理 | `/api/user/chat/groups/**` |
| [chat-channel-api.md](chat/chat-channel-api.md) | 频道挂接、申请 | `/api/user/chat/channels/**`、`/api/user/chat/invites/**` |
| [chat-admin-api.md](chat/chat-admin-api.md) | 后台聊天管理索引页 | `/api/sys/chats/**` |
| [chat-admin-conversation-api.md](chat/chat-admin-conversation-api.md) | 后台会话管理 | `/api/sys/chats/conversations/**` |
| [chat-admin-topic-channel-api.md](chat/chat-admin-topic-channel-api.md) | 后台频道管理 | `/api/sys/chats/channels/**` |
| [chat-admin-lobby-api.md](chat/chat-admin-lobby-api.md) | 后台大厅管理 | `/api/sys/chats/lobby/**` |
| [chat-admin-channel-application-api.md](chat/chat-admin-channel-application-api.md) | 后台频道申请 | `/api/sys/chats/applications/**` |
| [chat-admin-group-application-api.md](chat/chat-admin-group-application-api.md) | 后台群申请 | `/api/sys/chats/group-applications/**` |
| [chat-admin-mute-api.md](chat/chat-admin-mute-api.md) | 后台禁言管理 | `/api/sys/chats/mutes/**` |
| [chat-lobby-api.md](chat/chat-lobby-api.md) | 大厅频道 | `/api/public/chat/lobby/**`、`/api/sys/chats/lobby/**` |
| [websocket-protocol-api.md](chat/websocket-protocol-api.md) | WebSocket 协议索引页 | `/ws/chat` |
| [websocket-client-api.md](chat/websocket-client-api.md) | WebSocket 客户端协议 | `/ws/chat` |
| [websocket-server-events-api.md](chat/websocket-server-events-api.md) | WebSocket 服务端事件 | `/ws/chat` |
| [websocket-integration-api.md](chat/websocket-integration-api.md) | WebSocket 前端集成 | - |

### file - 文件与上传

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [file-user-api.md](file/file-user-api.md) | 用户上传、我的文件 | `/api/user/files/**`、`/api/public/files/**` |
| [file-admin-api.md](file/file-admin-api.md) | 后台文件管理 | `/api/sys/files/**` |

### follow - 关注与粉丝

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [follow-user-api.md](follow/follow-user-api.md) | 关注/粉丝索引页 | `/api/user/follows/**`、`/api/users/{userId}/**` |
| [follow-relationship-api.md](follow/follow-relationship-api.md) | 关注/粉丝列表 | `/api/user/follows/**`、`/api/users/{userId}/**` |
| [follow-mutual-api.md](follow/follow-mutual-api.md) | 互关/特别关注 | `/api/user/follows/mutual/**` |
| [follow-admin-api.md](follow/follow-admin-api.md) | 后台关注管理 | `/api/sys/follows/**` |

### forum - 论坛与社区

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [forum-user-api.md](forum/forum-user-api.md) | 论坛用户侧索引页 | `/api/forum/**`、`/api/user/forum/**` |
| [forum-post-api.md](forum/forum-post-api.md) | 帖子查询/发帖/编辑/删除 | `/api/forum/**`、`/api/user/forum/posts/**` |
| [forum-reply-api.md](forum/forum-reply-api.md) | 回复发表/编辑/删除 | `/api/user/forum/replies/**` |
| [forum-interaction-api.md](forum/forum-interaction-api.md) | 点赞/收藏/频道分享 | `/api/user/forum/posts/*/likes/**` |
| [forum-my-posts-api.md](forum/forum-my-posts-api.md) | 我的帖子/频道挂接 | `/api/user/forum/**`、`/api/user/chat/forum-links/**` |
| [forum-admin-api.md](forum/forum-admin-api.md) | 论坛后台管理索引页 | `/api/sys/forum/**` |
| [forum-board-admin-api.md](forum/forum-board-admin-api.md) | 后台版块管理 | `/api/sys/forum/boards/**` |
| [forum-post-admin-api.md](forum/forum-post-admin-api.md) | 后台帖子管理 | `/api/sys/forum/posts/**` |
| [forum-reply-admin-api.md](forum/forum-reply-admin-api.md) | 后台回复管理 | `/api/sys/forum/replies/**` |

### report - 举报管理

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [report-user-api.md](report/report-user-api.md) | 举报提交、记录查询 | `/api/user/reports/**` |
| [report-admin-api.md](report/report-admin-api.md) | 后台举报处理 | `/api/sys/reports/**` |

### ai - AI 对话

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [ai-user-api.md](ai/ai-user-api.md) | AI 对话 | `/api/user/ai/**` |
| [ai-channel-admin-api.md](ai/ai-channel-admin-api.md) | AI 渠道配置管理 | `/api/sys/ai/channels/**` |
| [ai-session-admin-api.md](ai/ai-session-admin-api.md) | AI 会话管理 | `/api/sys/ai/sessions/**` |
| [ai-tool-admin-api.md](ai/ai-tool-admin-api.md) | AI 工具管理 | `/api/sys/ai/tools/**` |
| [ai-mcp-admin-api.md](ai/ai-mcp-admin-api.md) | AI MCP 服务管理 | `/api/sys/ai/mcp-servers/**` |
| [ai-agent-admin-api.md](ai/ai-agent-admin-api.md) | AI Agent 管理 | `/api/sys/ai/agents/**` |
| [ai-usage-admin-api.md](ai/ai-usage-admin-api.md) | AI 调用统计 | `/api/sys/ai/usage-logs/**` |
| [ai-knowledge-admin-api.md](ai/ai-knowledge-admin-api.md) | AI 知识库管理 | `/api/sys/ai/knowledge/**` |

### dashboard - 后台数据看板

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [dashboard-api.md](dashboard/dashboard-api.md) | 数据看板 | `/api/sys/dashboard/**` |

### migration - 外部博客迁移

| 文档 | 面向页面 / 模块 | 主要路由范围 |
|---|---|---|
| [migration-api.md](migration/migration-api.md) | 博客迁移 | `/api/sys/migrations/blog/**` |

---

## 联调统一约定

### Base URL

```
/api
```

### 登录态

- 匿名接口可直接调用
- 需要登录的接口统一传：

```http
Authorization: Bearer <accessToken>
```

- `accessToken` 过期后，先调用刷新接口换新令牌，再决定是否跳转登录

### 统一响应结构

所有接口返回 `Result<T>`：

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {}
}
```

| 字段 | 说明 |
|---|---|
| `code` | 业务状态码，`200` 表示成功 |
| `message` | 业务提示文案 |
| `timestamp` | 服务端响应时间戳（毫秒） |
| `data` | 实际业务数据，可能是对象、数组、分页对象或 `null` |

**分页响应**（`data` 固定结构）：

```json
{
  "total": 1,
  "current": 1,
  "size": 10,
  "records": []
}
```

**统一响应头**：

| 响应头 | 说明 |
|---|---|
| `X-Trace-Id` | 服务端请求链路标识 |

### 错误处理

- HTTP `401` 尝试刷新令牌，失败则跳转登录；HTTP `403` 展示无权限页
- `code != 200` 统一展示 `message`

### 分页参数约定

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `current` | Long | `1` | 页码，从 1 开始 |
| `size` | Long | `10` | 每页条数 |

---

## 常见业务错误码

> `code != 200` 均为业务失败，前端应优先展示 `message`。

| code | 含义 |
|---|---|
| 40001 | 参数校验失败 |
| 40300 | 没有访问权限 |
| 40100 | 认证失败 |
| 70001 | AI 功能暂未开放 |
| 70007 | 今日 AI 额度已用尽 |
| 50000~50020 | 系统内部异常 |

---

## 维护规则

- 新增、删除、修改前端可见接口时，必须同步更新对应文档
- 改枚举或边界行为时，也不能只改代码不改文档