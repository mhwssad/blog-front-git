# WebSocket 通信协议 - 服务端推送事件

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

---

## 7. 服务端推送事件详解

### 7.1 新消息 (`message_created`)

当群组或单聊中有新消息时，推送给会话所有成员。
```json
{
  "type": "message_created",
  "requestId": null,
  "timestamp": "2024-03-09T12:00:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "id": 5002,
    "conversationId": 1001,
    "senderId": 5,
    "senderUsername": "alice",
    "senderNickname": "Alice",
    "senderAvatar": "https://example.com/avatar/5.png",
    "messageType": "text",
    "content": "大家好",
    "file": null,
    "replyMessageId": null,
    "reply": null,
    "clientMessageId": null,
    "self": false,
    "deliveryStatus": 1,
    "readByCurrentUser": false,
    "readAt": null,
    "revoked": false,
    "edited": false,
    "updatedAt": null,
    "createdAt": "2024-03-09T12:00:00"
  }
}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| id | long | 消息 ID |
| conversationId | long | 会话 ID |
| senderId | long | 发送者用户 ID |
| senderUsername | string | 发送者用户名 |
| senderNickname | string | 发送者昵称 |
| senderAvatar | string | 发送者头像 URL |
| messageType | string | 消息类型：text, image, video, audio, file |
| content | string | 文本内容（文本消息时） |
| file | object | 文件信息（文件消息时），见文件消息格式 |
| replyMessageId | long | 回复的消息 ID |
| reply | object | 被回复的消息快照，见回复消息快照格式 |
| clientMessageId | string | 客户端消息 ID |
| self | boolean | 是否为当前用户发送的消息 |
| deliveryStatus | integer | 投递状态：0 待投递，1 已送达，2 已读 |
| readByCurrentUser | boolean | 当前用户是否已读 |
| readAt | string | 当前用户已读时间 |
| revoked | boolean | 是否已撤回 |
| edited | boolean | 是否已编辑 |
| updatedAt | string | 更新时间 |
| createdAt | string | 创建时间 |

#### 文件消息格式

当 `messageType` 为 `image`、`video`、`audio` 或 `file` 时，`file` 字段包含文件信息。

```json
"file": {
  "businessId": 100,
  "fileId": 12345,
  "fileName": "document.pdf",
  "originalName": "原始文件名.pdf",
  "fileUrl": "https://example.com/files/document.pdf",
  "fileSize": 1024000,
  "fileType": "pdf",
  "mimeType": "application/pdf",
  "previewUrl": "https://example.com/files/preview/document.pdf",
  "thumbnailUrl": null,
  "width": null,
  "height": null,
  "durationSeconds": null,
  "waveform": null,
  "transcodeStatus": "completed"
}
```

| file 字段 | 类型 | 说明 |
|-----------|------|------|
| businessId | long | 聊天文件业务引用 ID |
| fileId | long | 文件 ID |
| fileName | string | 文件名称 |
| originalName | string | 原始文件名 |
| fileUrl | string | 文件地址 |
| fileSize | long | 文件大小（字节） |
| fileType | string | 文件类型 |
| mimeType | string | MIME 类型 |
| previewUrl | string | 预览地址（图片视频可直接预览用） |
| thumbnailUrl | string | 缩略图地址（图片默认回调原图地址） |
| width | integer | 图片宽度 |
| height | integer | 图片高度 |
| durationSeconds | integer | 音视频时长（秒） |
| waveform | array[integer] | 音频波形采样点 |
| transcodeStatus | string | 转码状态：source / pending / ready / failed |

#### 回复消息快照格式

当消息包含回复时，`reply` 字段包含被回复消息的快照。

```json
"reply": {
  "id": 5000,
  "senderId": 3,
  "senderUsername": "bob",
  "senderNickname": "Bob",
  "senderAvatar": "https://example.com/avatar/3.png",
  "messageType": "text",
  "replyToMessageId": null,
  "content": "原始消息内容",
  "file": null,
  "revoked": false,
  "deleted": false,
  "state": "normal",
  "createdAt": "2024-03-09T11:50:00"
}
```

| reply 字段 | 类型 | 说明 |
|------------|------|------|
| id | long | 被回复消息 ID |
| senderId | long | 被回复消息发送人 ID |
| senderUsername | string | 被回复消息发送人用户名 |
| senderNickname | string | 被回复消息发送人昵称 |
| senderAvatar | string | 被回复消息发送人头像 |
| messageType | string | 被回复消息类型 |
| replyToMessageId | long | 被回复消息自己所引用的上一条消息 ID（仅用于前端状态链接，不继续内嵌多级快照） |
| content | string | 被回复消息主要内筒 |
| file | object | 被回复消息附件快照（结构同文件消息格式） |
| revoked | boolean | 被回复消息是否已撤回 |
| deleted | boolean | 被回复消息是否已不可用（仅用于强提醒撤回提示） |
| state | string | 被回复消息当前状态：normal / revoked / unavailable |
| createdAt | string | 被回复消息发送时间 |

### 7.2 消息已编辑 (`message_updated`)

消息内容被编辑后推送，更新消息显示。

```json
{
  "type": "message_updated",
  "requestId": null,
  "timestamp": "2024-03-09T12:05:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "id": 5002,
    "conversationId": 1001,
    "senderId": 5,
    "senderUsername": "alice",
    "senderNickname": "Alice",
    "senderAvatar": "https://example.com/avatar/5.png",
    "messageType": "text",
    "content": "编辑后的消息内容",
    "file": null,
    "replyMessageId": null,
    "reply": null,
    "clientMessageId": null,
    "self": true,
    "deliveryStatus": 1,
    "readByCurrentUser": true,
    "readAt": "2024-03-09T12:00:00",
    "revoked": false,
    "edited": true,
    "updatedAt": "2024-03-09T12:05:00",
    "createdAt": "2024-03-09T12:00:00"
  }
}
```

> **说明**：`message_updated` 事件推送完整的消息对象（与 `message_created` 结构一致），而非仅变更字段。客户端应整体替换本地消息对象。

### 7.3 消息已撤回 (`message_revoked`)

消息被撤回后推送，客户端应将消息标记为已撤回状态。

```json
{
  "type": "message_revoked",
  "requestId": null,
  "timestamp": "2024-03-09T12:10:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "id": 5002,
    "conversationId": 1001,
    "senderId": 5,
    "senderUsername": "alice",
    "senderNickname": "Alice",
    "senderAvatar": "https://example.com/avatar/5.png",
    "messageType": "text",
    "content": "大家好",
    "file": null,
    "replyMessageId": null,
    "reply": null,
    "clientMessageId": null,
    "self": false,
    "deliveryStatus": 1,
    "readByCurrentUser": false,
    "readAt": null,
    "revoked": true,
    "edited": false,
    "updatedAt": null,
    "createdAt": "2024-03-09T12:00:00"
  }
}
```

> **说明**：`message_revoked` 事件推送完整的消息对象（与 `message_created` 结构一致），`revoked` 字段为 `true`。客户端应整体替换本地消息对象。

### 7.4 消息已删除 (`message_deleted`)

消息被删除后推送（仅推送给操作者本人）。

```json
{
  "type": "message_deleted",
  "requestId": null,
  "timestamp": "2024-03-09T12:15:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "conversationId": 1001,
    "messageId": 5002,
    "userId": 5,
    "unreadCount": 3
  }
}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| conversationId | long | 会话 ID |
| messageId | long | 被删除的消息 ID |
| userId | long | 执行删除的用户 ID |
| unreadCount | integer | 删除后的当前会话未读数 |

### 7.5 已读状态推送 (`read_updated`)

当会话中其他成员的已读状态发生变更时推送。

```json
{
  "type": "read_updated",
  "requestId": null,
  "timestamp": "2024-03-09T12:20:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "conversationId": 1001,
    "userId": 5,
    "readMessageId": 5000,
    "readAt": "2024-03-09T12:20:00",
    "deliveredMessageId": 5001,
    "deliveredAt": "2024-03-09T12:19:30",
    "unreadCount": 2
  }
}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| conversationId | long | 会话 ID |
| userId | long | 用户 ID |
| readMessageId | long | 最新已读消息 ID |
| readAt | string | 最新已读时间 |
| deliveredMessageId | long | 最新已送达消息 ID |
| deliveredAt | string | 最新已送达时间 |
| unreadCount | integer | 未读数 |

### 7.6 会话信息变更 (`conversation_updated`)

群聊信息（群名、公告、群头像等）变更时推送。

```json
{
  "type": "conversation_updated",
  "requestId": null,
  "timestamp": "2024-03-09T12:25:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "action": "updated",
    "conversationId": 1001,
    "conversationType": "group",
    "name": "项目交流群",
    "avatar": "https://example.com/avatar/group-1001.png",
    "ownerId": 5,
    "notice": "请大家注意文明发言",
    "status": 1,
    "memberCount": 42
  }
}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| action | string | 变更动作：created, updated |
| conversationId | long | 会话 ID |
| conversationType | string | 会话类型：single, group, channel |
| name | string | 会话名称 |
| avatar | string | 会话头像 |
| ownerId | long | 群主 ID |
| notice | string | 群公告 |
| status | integer | 会话状态 |
| memberCount | long | 当前活跃成员数 |

### 7.7 群成员变更 (`members_updated`)

群成员加入、退出或角色变更时推送。

```json
{
  "type": "members_updated",
  "requestId": null,
  "timestamp": "2024-03-09T12:30:00",
  "code": 200,
  "message": "成功",
  "payload": {
    "action": "joined",
    "conversationId": 1001,
    "affectedUserId": 42,
    "members": [
      {
        "userId": 42,
        "username": "bob",
        "nickname": "Bob",
        "avatar": "https://example.com/avatar/42.png",
        "role": "member",
        "status": 1,
        "joinedAt": "2024-03-09T12:30:00",
        "muteUntil": null
      }
    ]
  }
}
```

| payload 字段 | 类型 | 说明 |
|-------------|------|------|
| action | string | 变更动作：joined, left, role_changed, mute_changed |
| conversationId | long | 会话 ID |
| affectedUserId | long | 受影响用户 ID |
| members | array | 当前活跃成员列表 |

#### members 元素字段

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | long | 用户 ID |
| username | string | 用户名 |
| nickname | string | 昵称 |
| avatar | string | 头像 |
| role | string | 成员角色：owner, admin, member |
| status | integer | 成员状态 |
| joinedAt | string | 加入时间 |
| muteUntil | string | 禁言截止时间 |

---

## 8. 错误处理

### 8.1 错误响应格式

```json
{
  "type": "error",
  "requestId": "msg-001",
  "timestamp": "2024-03-09T12:00:00",
  "code": 40011,
  "message": "非法参数",
  "payload": null
}
```

### 8.2 业务错误码

| code | 说明 | 触发场景 |
|------|------|---------|
| 40011 | 非法参数 | payload 缺少必填字段或 type 错误 |
| 40008 | 缺少请求参数 | 缺少必填的请求参数 |
| 40102 | 未登录或登录已过期 | Token 无效或过期 |
| 40300 | 没有访问权限 | 无权限操作 |
| 40401 | 用户不存在 | 用户不存在 |
| 50000 | 系统异常，请联系管理员 | 服务端内部错误 |
| 50008 | JSON处理异常 | WebSocket 消息不是合法 JSON |
| 50011 | 不支持的操作 | 发送未支持的 type、客户端发送服务端专用类型 |
| 50001 | 并发修改异常 | 并发操作冲突 |
| 74005 | 当前用户已被禁言，暂不能发送消息 | 被禁言用户尝试发消息 |

> **说明**：以上列出 WebSocket 通信中常见的错误码。服务端可能返回其他业务错误码，前端可根据 `code` 值做通用处理：非 200 即为失败。

### 8.3 连接常见错误

| 场景 | 表现 | 处理建议 |
|------|------|---------|
| 凭证无效或过期 | 握手阶段 HTTP `401` | 刷新凭证后重连 |
| JSON 格式错误 | 收到 `error`，`code=50008` | 检查发送内容格式 |
| 发送不支持的 type | 收到 `error`，`code=50011` | 检查 `type` 编写 |
| 缺少 type 字段 | 收到 `error`，`code=40011` | 确保 JSON 包含 `type` 字段 |
| 客户端发送服务端专用类型 | 收到 `error`，`code=40011`，`message` 提示 "当前消息类型不允许由客户端直接发送" | 只发送 ping / send_message / mark_read |
| 连接意外断开 | `onclose` 触发 | 按第 9 节策略重连 |
| 服务端内部错误 | `onerror` 触发，收到 `error`，`code=50000` | 记录日志，稍后重试 |
