# 代码审查修复计划

> 基于 API 文档 (`docs/api文档/`) 与前端需求文档 (`docs/前端/`) 的全面审查结果
> 创建时间：2026-05-01

## 审查范围

- 5 个并行审查代理，按业务域分工
- 对比 API 文档定义 vs 前端实际实现
- 覆盖：认证、内容、聊天/关注/文件、AI/举报、页面设计

## 问题统计

| 级别 | 数量 | 说明 |
|------|------|------|
| HIGH | 6 | 功能缺失或数据冲突，影响核心业务 |
| MEDIUM | 11 | 功能不完整或架构不一致 |
| LOW | 7 | 代码风格或文档同步问题 |

---

## HIGH — 必须修复

### H1. 聊天 WebSocket 实时通信缺失

**现状**：前端需求文档明确要求 WebSocket 实时消息推送，代码中完全没有 WebSocket 相关实现，聊天页面无法实时收发消息。

**修复方案**：

1. 在 `src/api/` 下新建 `websocket.ts`，封装 WebSocket 连接管理
   - 自动重连机制（指数退避）
   - 心跳保活
   - Token 鉴权（连接时携带）
   - 消息分发（按会话 ID 路由到对应组件）
2. 在 `src/stores/modules/` 下新建 `userChat.ws.ts`（或扩展 `userChat.ts`）
   - 管理连接状态 (connecting / connected / disconnected)
   - 接收消息 → 更新本地会话列表和消息列表
   - 发送消息 → 先乐观更新 UI，再通过 WebSocket 发送
3. 改造 `src/views/front/chat/` 下所有聊天页面
   - 组件挂载时建立/复用 WebSocket 连接
   - 实时渲染新消息
   - 连接断开时显示状态提示
4. 在 `src/composables/` 下新建 `useChatSocket.ts`，封装连接生命周期

**涉及文件**：
- 新建：`src/api/websocket.ts`、`src/composables/useChatSocket.ts`
- 修改：`src/views/front/chat/*.vue`、`src/stores/modules/userChat.ts`

---

### H2. 聊天文件/图片消息发送 UI 缺失

**现状**：设计文档要求支持文本、图片、文件消息类型，当前只有纯文本发送。

**修复方案**：

1. 在聊天输入框组件旁增加附件按钮（上传图片/文件）
2. 复用项目已有的文件上传 API (`POST /api/user/files/upload`)
3. 上传成功后通过 WebSocket 发送对应类型的消息体
4. 消息气泡组件 `AiMessageBubble.vue` 已有不同消息类型的渲染逻辑，聊天消息气泡需对齐

**涉及文件**：
- 修改：`src/views/front/chat/` 输入区域组件
- 修改：消息气泡组件，支持 `image` / `file` 类型渲染

---

### H3. 会话状态值与文档冲突

**现状**：
- 代码：`0 = 冻结, 1 = 正常`
- 文档：`0 = 正常, 1 = 已解散`

**修复方案**：

1. 确认后端实际使用的枚举值（以后端为准）
2. 统一 `src/types/api-types.ts` 中状态枚举注释
3. 更新所有页面中 `formatXxxStatus()` 函数的映射表
4. 如以后端为准，需同步更新前端需求文档

**涉及文件**：
- 修改：`src/types/api-types.ts`
- 修改：`src/utils/` 中相关格式化函数
- 修改：所有使用会话状态的前台/后台页面

---

### H4. 缺少公开作者档案 API

**现状**：`GET /api/users/{userId}/author-profile` 在文档中有定义，`src/api/` 中未实现。

**修复方案**：

1. 在 `src/api/follow.ts` 或新建 `src/api/author.ts` 中添加 API 函数
2. 定义对应的 `AuthorProfileVO` 类型（如尚未定义）
3. 在作者主页 / 用户主页组件中调用并展示

**涉及文件**：
- 修改：`src/api/` 相关模块
- 修改：`src/views/front/user/UserProfileView.vue` 或 `src/views/front/author/`

---

### H5. 缺少公开文件代理 API

**现状**：`GET /api/public/files/{fileId}` 文档有定义，未实现。

**修复方案**：

1. 在 `src/api/content.ts` 中添加 `getPublicFile(fileId)` 函数
2. 在需要展示文件的场景中使用该函数获取文件 URL

**涉及文件**：
- 修改：`src/api/content.ts`

---

### H6. 文章置顶/推荐缺少必需参数

**现状**：`toggleArticleTop` 和 `toggleArticleRecommend` 调用时遗漏文档要求的 `enabled` 查询参数。

**修复方案**：

1. 检查 `src/api/sys/article.ts` 中对应函数签名
2. 补充 `enabled: boolean` 查询参数
3. 更新调用处的传参逻辑

**涉及文件**：
- 修改：`src/api/sys/article.ts`
- 修改：调用这些函数的页面组件

---

## MEDIUM — 建议修复

### M1. 聊天消息编辑 UI 缺失

**方案**：在消息气泡上增加"编辑"操作（仅限自己的消息），编辑后显示"已编辑"标记。

**涉及**：聊天消息气泡组件、输入框复用编辑模式。

---

### M2. 消息已读回执未展示

**方案**：
- `ChatConversationReadVO` 中 `deliveredMessageId` 类型从 `string` 改为 `number`
- 在消息气泡底部显示已送达/已读状态图标
- 实时更新回执状态（依赖 H1 WebSocket）

**涉及**：`src/types/api-types.ts`、聊天消息气泡组件。

---

### M3. 无单聊创建 UI

**方案**：在聊天列表页或用户主页增加"发起聊天"按钮，调用 `POST /api/user/chats/conversations/private`。

**涉及**：`src/views/front/chat/` 相关页面。

---

### M4. `ChatGroupCreateRequest` 缺少 `slowModeSeconds`

**方案**：在类型定义中补充字段，在创建群聊表单中增加慢速模式选项。

**涉及**：`src/types/api-types.ts`、群聊创建组件。

---

### M5. 接管登录流程不完整

**方案**：在 auth store 中编排完整接管登录流程 — 验证身份 → 执行接管 → 切换当前用户上下文。

**涉及**：`src/stores/auth.ts`、后台用户管理相关页面。

---

### M6. 无举报模块 Pinia Store

**方案**：新建 `src/stores/modules/report.ts`，统一管理举报列表和举报操作，与项目其他模块架构一致。

**涉及**：新建 store 文件，修改 `src/stores/index.ts` 导出。

---

### M7. AI 渠道 Store 参数静默丢弃

**方案**：对齐 `aiChannel` store 传递的参数与 `aiSysApi` 函数签名，确保查询参数不被静默忽略。

**涉及**：`src/stores/modules/aiChannel.ts`、`src/api/sys/ai.ts`。

---

### M8. 文章浏览足迹未记录

**方案**：在文章详情页 `onMounted` 时调用足迹记录 API（需确认 API 端点）。

**涉及**：`src/views/front/article/` 详情页组件。

---

### M9. 文章 `accessLevel=3`（指定用户可见）未处理

**方案**：在文章详情页增加 accessLevel=3 的判断逻辑，检查当前用户是否在允许列表中，不在则显示无权限提示。

**涉及**：文章详情页组件。

---

### M10. 枚举值多处冲突

**方案**：以后端实际实现为准，统一前端类型定义和格式化函数中的枚举映射。同步更新文档。

**涉及**：`src/types/api-types.ts`、`src/utils/` 下格式化函数。

---

### M11. 缺少集中式常量/枚举定义

**方案**：创建 `src/constants/enums.ts`，将分散在 `utils/aiAdmin.ts`、各页面组件中的枚举统一定义和导出。

**涉及**：新建 `src/constants/enums.ts`，逐步迁移各处枚举引用。

---

## LOW — 可优化

### L1. `LogoutRequest` 类型已定义但未使用
- 评估是否需要保留，如不需要则删除。

### L2. `authApi.register` 返回类型 `| null` 与文档矛盾
- 与后端确认注册接口是否可能返回 null，统一类型定义。

### L3. `CollectionVO.userId` 文档中未定义
- 与后端确认字段是否应存在，更新文档或移除字段。

### L4. `ArticleSaveRequest.authorId` 标为可选，文档要求必填
- 将类型改为 `required`，或在 API 层做兜底。

### L5. 通知 API 使用 class 语法，其他模块用对象字面量
- 统一为一种风格（建议跟随项目主流的对象字面量）。

### L6. 用户聊天 Store 缺少 11 个群治理方法
- 按需补充，或确认组件直接调用 API 的设计是否 intentional。

### L7. 多个已实现页面在文档中未记录
- 补充 AI 管理、大厅、频道、系列、搜索等页面的前端需求文档。

---

## 建议实施顺序

```
阶段一（核心功能补全）
  ├─ H1 WebSocket 实时通信
  ├─ H2 文件/图片消息发送
  └─ H3 会话状态值统一

阶段二（API 缺失修复）
  ├─ H4 公开作者档案 API
  ├─ H5 公开文件代理 API
  └─ H6 文章置顶/推荐参数

阶段三（功能完善）
  ├─ M1 消息编辑 UI
  ├─ M2 已读回执展示
  ├─ M3 单聊创建 UI
  └─ M8 浏览足迹记录

阶段四（架构治理）
  ├─ M6 举报模块 Store
  ├─ M7 AI Store 参数对齐
  ├─ M11 集中式枚举定义
  └─ L5 通知 API 风格统一

阶段五（文档与细节）
  ├─ M10 枚举冲突统一
  ├─ M9 accessLevel=3 处理
  ├─ L1-L4 类型定义修正
  └─ L7 补充缺失文档
```

## 备注

- 所有修改需通过 `pnpm type-check` 和 `pnpm build`
- 枚举值冲突（H3、M10）需与后端团队确认后再改
- WebSocket 实现（H1）是最大的单项工作，建议单独分支开发
