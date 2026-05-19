# 后台聊天管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

以下接口均需要管理员权限，路径前缀为 `/api/sys/chats`。

---

### 分页查询会话

**接口信息**
- 路径: `GET /api/sys/chats/conversations`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台分页查询所有会话

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
    "total": 50,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1001,
        "conversationType": "single",
        "sceneType": "single_chat",
        "name": "李四",
        "status": 0,
        "memberCount": 2,
        "createdAt": "2025-01-10T08:00:00",
        "updatedAt": "2025-01-15T10:32:00"
      }
    ]
  }
}
```

---

### 查询会话详情

**接口信息**
- 路径: `GET /api/sys/chats/conversations/{conversationId}`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台查询指定会话的详细信息

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1001,
    "conversationType": "single",
    "sceneType": "single_chat",
    "name": "李四",
    "status": 0,
    "memberCount": 2,
    "createdAt": "2025-01-10T08:00:00",
    "updatedAt": "2025-01-15T10:32:00"
  }
}
```

---

### 查询会话成员

**接口信息**
- 路径: `GET /api/sys/chats/conversations/{conversationId}/members`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台查询指定会话的所有成员

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
      "role": "owner",
      "status": 0,
      "joinedAt": "2025-01-10T08:00:00",
      "muteUntil": null
    }
  ]
}
```

---

### 分页查询会话消息

**接口信息**
- 路径: `GET /api/sys/chats/conversations/{conversationId}/messages`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台分页查询指定会话的消息记录

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
    "total": 100,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 9020,
        "conversationId": 1001,
        "senderId": 101,
        "senderNickname": "张三",
        "messageType": "text",
        "content": "你好",
        "createdAt": "2025-01-15T10:30:00"
      }
    ]
  }
}
```

---

### 查询消息详情

**接口信息**
- 路径: `GET /api/sys/chats/conversations/{conversationId}/messages/{messageId}`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台查询指定消息的详细信息

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 9020,
    "conversationId": 1001,
    "senderId": 101,
    "senderNickname": "张三",
    "messageType": "text",
    "content": "你好",
    "createdAt": "2025-01-15T10:30:00"
  }
}
```

---

### 分页查询消息回执

**接口信息**
- 路径: `GET /api/sys/chats/conversations/{conversationId}/messages/{messageId}/receipts`
- 鉴权: 是（需要 `content:chat:query` 权限）
- 说明: 后台分页查询指定消息的已读/已送达回执

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
    "total": 2,
    "current": 1,
    "size": 20,
    "records": [
      {
        "userId": 102,
        "nickname": "李四",
        "readAt": "2025-01-15T10:35:00",
        "deliveredAt": "2025-01-15T10:31:00"
      }
    ]
  }
}
```

---

### 更新成员角色

**接口信息**
- 路径: `PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/role`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台更新指定会话中成员的角色

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| role | String | 是 | 新角色：`owner`、`admin`、`member` |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "userId": 102,
      "username": "lisi",
      "nickname": "李四",
      "role": "admin",
      "status": 0,
      "joinedAt": "2025-01-15T12:01:00",
      "muteUntil": null
    }
  ]
}
```

---

### 更新成员状态

**接口信息**
- 路径: `PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/status`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台更新指定会话中成员的状态（如踢出）

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 成员状态 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": [
    {
      "userId": 103,
      "username": "wangwu",
      "nickname": "王五",
      "role": "member",
      "status": 1,
      "joinedAt": "2025-01-15T12:02:00",
      "muteUntil": null
    }
  ]
}
```

---

### 更新成员禁言

**接口信息**
- 路径: `PUT /api/sys/chats/conversations/{conversationId}/members/{memberUserId}/mute`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台更新指定会话中成员的禁言状态

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
      "userId": 103,
      "username": "wangwu",
      "nickname": "王五",
      "role": "member",
      "status": 0,
      "joinedAt": "2025-01-15T12:02:00",
      "muteUntil": "2025-01-16T12:00:00"
    }
  ]
}
```

---

### 后台撤回消息

**接口信息**
- 路径: `POST /api/sys/chats/conversations/{conversationId}/messages/{messageId}/revoke`
- 鉴权: 是（需要 `content:chat:update` 权限）
- 说明: 后台撤回指定会话中的消息

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

### 更新会话状态

**接口信息**
- 路径: `PUT /api/sys/chats/conversations/{conversationId}/status`
- 鉴权: 是（需要 `content:chat:update-status` 权限）
- 说明: 后台更新会话状态（如封禁/解封）

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 会话状态 |

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
