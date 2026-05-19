# 大厅频道 API 文档

本文档包含大厅频道相关的公开接口和后台管理接口。

---

## 访客大厅（公开接口）

### 访客查看大厅消息

**接口信息**
- 路径: `GET /api/public/chat/lobby/messages`
- 鉴权: 否（公开接口，访客可访问）
- 说明: 大厅是公开频道，无需登录即可查看消息

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|-----|
| current | Long | 否 | 1 | 页码 |
| size | Long | 否 | 20 | 每页条数 |
| beforeMessageId | Long | 否 | - | 查询该消息ID之前的消息，用于滚动加载 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 200,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 5020,
        "senderId": 1,
        "senderName": "系统管理员",
        "senderAvatar": "https://example.com/avatar/admin.jpg",
        "messageType": "text",
        "content": "欢迎来到大厅！",
        "createdAt": "2025-01-15T08:00:00"
      },
      {
        "id": 5019,
        "senderId": 10,
        "senderName": "游客张三",
        "senderAvatar": "https://example.com/avatar/guest.jpg",
        "messageType": "text",
        "content": "大家好",
        "createdAt": "2025-01-15T08:05:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 消息ID |
| senderId | Long | 发送者用户ID |
| senderName | String | 发送者名称 |
| senderAvatar | String | 发送者头像URL |
| messageType | String | 消息类型：`text` 文本、`file` 文件等 |
| content | String | 消息内容 |
| createdAt | LocalDateTime | 发送时间 |

---

## 后台大厅频道管理

以下接口路径前缀为 `/api/sys/chats/lobby`，需要管理员权限 `content:chat:update` 或 `content:chat:query`。

---

### 更新大厅频道设置

**接口信息**
- 路径: `PUT /api/sys/chats/lobby/settings`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 更新大厅频道的设置信息（公告、慢速模式、发言等级限制），变更后通过 WebSocket 推送通知所有在线成员

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| announcement | String | 否 | 大厅公告，最大512字符 |
| slowModeSeconds | Integer | 否 | 慢速模式秒数，0=关闭，范围0-3600 |
| speakLevelLimit | Integer | 否 | 发言最低等级限制，范围1-100 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "conversationType": "global",
    "sceneType": "hall_channel",
    "name": "全站大厅",
    "avatar": "https://example.com/avatar/lobby.jpg",
    "ownerId": 1,
    "notice": "请遵守社区规范，禁止发布违规内容",
    "allSite": true,
    "status": 0,
    "speakLevelLimit": 2,
    "slowModeSeconds": 30,
    "memberCount": 128,
    "updatedAt": "2025-01-15T12:00:00"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 会话ID |
| conversationType | String | 会话类型：`global` 全局频道 |
| sceneType | String | 业务场景：`hall_channel` 大厅频道 |
| name | String | 会话名称 |
| avatar | String | 会话头像URL |
| ownerId | Long | 群主用户ID |
| notice | String | 群公告/大厅公告 |
| allSite | Boolean | 是否全站群聊 |
| status | Integer | 会话状态：`0` 正常 |
| speakLevelLimit | Integer | 发言最低等级限制 |
| slowModeSeconds | Integer | 慢速模式秒数 |
| memberCount | Long | 活跃成员数量 |
| updatedAt | LocalDateTime | 更新时间 |

---

### 置顶大厅消息

**接口信息**
- 路径: `POST /api/sys/chats/lobby/messages/{messageId}/pin`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 将大厅中的消息置顶，幂等操作（已置顶则跳过）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

---

### 取消置顶大厅消息

**接口信息**
- 路径: `DELETE /api/sys/chats/lobby/messages/{messageId}/pin`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 取消大厅消息的置顶状态，幂等操作（未置顶则跳过）

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

---

### 分页查询大厅置顶消息

**接口信息**
- 路径: `GET /api/sys/chats/lobby/messages/pinned`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 分页查询大厅中的置顶消息列表，按消息ID倒序排列

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|-----|
| current | Long | 否 | 1 | 页码 |
| size | Long | 否 | 20 | 每页条数 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 3,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 5020,
        "senderId": 1,
        "senderName": "系统管理员",
        "senderAvatar": "https://example.com/avatar/admin.jpg",
        "messageType": "text",
        "content": "欢迎来到大厅！",
        "pinnedBy": 1,
        "createdAt": "2025-01-15T10:00:00"
      },
      {
        "id": 5015,
        "senderId": 10,
        "senderName": "用户张三",
        "senderAvatar": "https://example.com/avatar/user.jpg",
        "messageType": "text",
        "content": "公告消息内容",
        "pinnedBy": 1,
        "createdAt": "2025-01-14T08:00:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 消息ID |
| senderId | Long | 发送者用户ID |
| senderName | String | 发送者名称 |
| senderAvatar | String | 发送者头像URL |
| messageType | String | 消息类型：`text` 文本、`file` 文件等 |
| content | String | 消息内容 |
| pinnedBy | Long | 置顶操作人ID |
| createdAt | LocalDateTime | 消息发送时间 |

---

### 禁言大厅用户

**接口信息**
- 路径: `PUT /api/sys/chats/lobby/members/{memberUserId}/mute`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 对大厅中的用户进行禁言操作，设置禁言截止时间后推送成员变更通知

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| muteUntil | LocalDateTime | 否 | 禁言截止时间，为空表示取消禁言 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "userId": 101,
      "username": "zhangsan",
      "nickname": "张三",
      "avatar": "https://example.com/avatar/zhangsan.jpg",
      "role": "member",
      "status": 0,
      "joinedAt": "2025-01-01T10:00:00",
      "muteUntil": null
    },
    {
      "userId": 103,
      "username": "wangwu",
      "nickname": "王五",
      "avatar": "https://example.com/avatar/wangwu.jpg",
      "role": "member",
      "status": 0,
      "joinedAt": "2025-01-01T10:00:00",
      "muteUntil": "2025-01-16T12:00:00"
    }
  ]
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| userId | Long | 用户ID |
| username | String | 用户名 |
| nickname | String | 昵称 |
| avatar | String | 头像URL |
| role | String | 成员角色 |
| status | Integer | 成员状态 |
| joinedAt | LocalDateTime | 加入时间 |
| muteUntil | LocalDateTime | 禁言截止时间，为空表示未禁言 |

---

### 踢出大厅用户

**接口信息**
- 路径: `PUT /api/sys/chats/lobby/members/{memberUserId}/kick`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 将用户从大厅中踢出（将成员状态设为已移除并清除禁言时间），推送成员变更通知

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "userId": 101,
      "username": "zhangsan",
      "nickname": "张三",
      "avatar": "https://example.com/avatar/zhangsan.jpg",
      "role": "member",
      "status": 0,
      "joinedAt": "2025-01-01T10:00:00",
      "muteUntil": null
    },
    {
      "userId": 103,
      "username": "wangwu",
      "nickname": "王五",
      "avatar": "https://example.com/avatar/wangwu.jpg",
      "role": "member",
      "status": 1,
      "joinedAt": "2025-01-01T10:00:00",
      "muteUntil": null
    }
  ]
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| userId | Long | 用户ID |
| username | String | 用户名 |
| nickname | String | 昵称 |
| avatar | String | 头像URL |
| role | String | 成员角色 |
| status | Integer | 成员状态：`0` 正常，`1` 已移除 |
| joinedAt | LocalDateTime | 加入时间 |
| muteUntil | LocalDateTime | 禁言截止时间，被踢出后为 null |