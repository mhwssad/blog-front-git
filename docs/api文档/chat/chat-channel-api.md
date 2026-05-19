# chat-channel-api.md

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

[帖子频道挂接+频道创建申请+群邀请链接+入群申请]

---

## 帖子频道挂接

### 分享帖子到频道

**接口信息**
- 路径: `POST /api/user/chat/forum-links`
- 鉴权: 是
- 说明: 将论坛帖子分享/挂接到聊天频道

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| forumPostId | Long | 是 | 论坛帖子ID |
| conversationId | Long | 是 | 目标频道会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "forumPostId": 301,
    "conversationId": 2001,
    "createdBy": 101,
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 查询帖子关联的频道

**接口信息**
- 路径: `GET /api/user/chat/forum-links/posts/{forumPostId}`
- 鉴权: 是
- 说明: 查询指定帖子所关联的频道信息

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "forumPostId": 301,
    "conversationId": 2001,
    "createdBy": 101,
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 分页查询频道关联的帖子

**接口信息**
- 路径: `GET /api/user/chat/forum-links/channels/{conversationId}`
- 鉴权: 是
- 说明: 分页查询指定频道下关联的所有帖子

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
    "total": 5,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1,
        "forumPostId": 301,
        "conversationId": 2001,
        "createdBy": 101,
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

### 取消帖子与频道的关联

**接口信息**
- 路径: `DELETE /api/user/chat/forum-links/posts/{forumPostId}`
- 鉴权: 是
- 说明: 取消帖子与频道的关联

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

## 频道创建申请

### 提交频道创建申请

**接口信息**
- 路径: `POST /api/user/chat/channel-applications`
- 鉴权: 是
- 说明: 用户提交创建频道的申请

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| name | String | 是 | 频道名称 |
| description | String | 否 | 频道描述 |
| categoryCode | String | 否 | 分类编码 |
| reason | String | 否 | 申请理由 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "name": "前端技术频道",
    "description": "前端开发者交流频道",
    "categoryCode": "tech",
    "reason": "需要一个专门的前端交流空间",
    "status": "pending",
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 查询最近一次频道创建申请

**接口信息**
- 路径: `GET /api/user/chat/channel-applications/latest`
- 鉴权: 是
- 说明: 查询当前用户最近一次频道创建申请

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "name": "前端技术频道",
    "description": "前端开发者交流频道",
    "categoryCode": "tech",
    "reason": "需要一个专门的前端交流空间",
    "status": "pending",
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 分页查询我的频道创建申请

**接口信息**
- 路径: `GET /api/user/chat/channel-applications`
- 鉴权: 是
- 说明: 分页查询当前用户提交的所有频道创建申请

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
        "id": 1,
        "name": "前端技术频道",
        "description": "前端开发者交流频道",
        "categoryCode": "tech",
        "reason": "需要一个专门的前端交流空间",
        "status": "pending",
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

## 群邀请链接

### 创建群邀请链接

**接口信息**
- 路径: `POST /api/user/chat/groups/{conversationId}/invite-links`
- 鉴权: 是
- 说明: 为指定群聊创建一个邀请链接

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| maxUses | Integer | 否 | 最大使用次数，为空表示不限 |
| expireHours | Integer | 否 | 过期小时数，为空表示永不过期 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "conversationId": 1003,
    "inviteToken": "abc123def456",
    "maxUses": 10,
    "usedCount": 0,
    "expireAt": "2025-01-16T12:00:00",
    "status": "active",
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 分页查询群邀请链接

**接口信息**
- 路径: `GET /api/user/chat/groups/{conversationId}/invite-links`
- 鉴权: 是
- 说明: 分页查询指定群聊的所有邀请链接

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
        "id": 1,
        "conversationId": 1003,
        "inviteToken": "abc123def456",
        "maxUses": 10,
        "usedCount": 3,
        "expireAt": "2025-01-16T12:00:00",
        "status": "active",
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

### 停用群邀请链接

**接口信息**
- 路径: `PUT /api/user/chat/groups/{conversationId}/invite-links/{inviteLinkId}/disable`
- 鉴权: 是
- 说明: 停用指定的群邀请链接

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

### 通过邀请链接加入群聊

**接口信息**
- 路径: `POST /api/user/chat/group-invite-links/{inviteToken}/join`
- 鉴权: 是
- 说明: 通过邀请链接 Token 加入群聊

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

## 入群申请

### 提交入群申请

**接口信息**
- 路径: `POST /api/user/chat/groups/{conversationId}/join-applications`
- 鉴权: 是
- 说明: 向指定群聊提交入群申请

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| reason | String | 否 | 申请理由 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "conversationId": 1003,
    "userId": 101,
    "reason": "希望加入群聊交流技术",
    "status": "pending",
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

### 分页查询我的入群申请

**接口信息**
- 路径: `GET /api/user/chat/group-join-applications`
- 鉴权: 是
- 说明: 分页查询当前用户提交的所有入群申请

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
    "total": 5,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1,
        "conversationId": 1003,
        "userId": 101,
        "reason": "希望加入群聊交流技术",
        "status": "pending",
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

### 分页查询群入群申请

**接口信息**
- 路径: `GET /api/user/chat/groups/{conversationId}/join-applications`
- 鉴权: 是
- 说明: 分页查询指定群的入群申请，需要管理员或群主权限

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
        "id": 1,
        "conversationId": 1003,
        "userId": 105,
        "reason": "希望加入群聊交流技术",
        "status": "pending",
        "createdAt": "2025-01-15T12:00:00"
      }
    ]
  }
}
```

---

### 审核入群申请

**接口信息**
- 路径: `PUT /api/user/chat/groups/{conversationId}/join-applications/{applicationId}/review`
- 鉴权: 是
- 说明: 审核入群申请（通过或拒绝），需要管理员或群主权限

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| approved | Boolean | 是 | 是否通过 |
| reason | String | 否 | 审核理由 |

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
