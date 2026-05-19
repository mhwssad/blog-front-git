# 后台大厅频道管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

以下接口路径前缀为 `/api/sys/chats/lobby`。

---

### 更新大厅频道设置

**接口信息**
- 路径: `PUT /api/sys/chats/lobby/settings`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 更新大厅频道的设置信息（公告、慢速模式、发言等级限制）

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

---

### 置顶大厅消息

**接口信息**
- 路径: `POST /api/sys/chats/lobby/messages/{messageId}/pin`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 将大厅中的消息置顶

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
- 说明: 取消大厅消息的置顶状态

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
- 说明: 分页查询大厅中的置顶消息列表

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

---
