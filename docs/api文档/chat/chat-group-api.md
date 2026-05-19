# 群聊管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：群聊页，包含创建群聊、查询群聊详情、查询群成员、邀请/移除成员、群聊设置等。

---

## 1. 创建群聊

**接口信息**
- 路径：`POST /api/user/chat/groups`
- 鉴权：是
- 说明：创建一个新的群聊

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | String | 是 | 群名称，最大128字符 |
| `avatar` | String | 否 | 群头像URL |
| `description` | String | 否 | 群简介，最大256字符 |
| `announcement` | String | 否 | 群公告，最大512字符 |
| `categoryCode` | String | 否 | 群分类编码 |
| `visibilityScope` | String | 否 | 可见范围：`public` 公开、`private` 私有，默认 `private` |
| `joinRule` | String | 否 | 加入规则：`free` 自由加入、`approval` 需要审批、`invite_only` 邀请制 |
| `speakLevelLimit` | Integer | 否 | 发言最低等级，默认1 |
| `memberLimit` | Integer | 否 | 成员上限，0表示不限制 |
| `memberUserIds` | List\<Long\> | 是 | 初始成员用户ID列表，不需要包含自己 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1003,
    "conversationType": "group",
    "sceneType": "group_chat",
    "name": "技术交流群",
    "avatar": "https://example.com/avatar/tech-group.jpg",
    "ownerId": 101,
    "notice": "本群禁止广告和无关内容",
    "selfRole": "owner",
    "memberCount": 4,
    "unreadCount": 0,
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

## 2. 查询群聊详情

**接口信息**
- 路径：`GET /api/user/chat/groups/{conversationId}`
- 鉴权：是
- 说明：获取群聊的详细信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1003,
    "conversationType": "group",
    "name": "技术交流群",
    "avatar": "https://example.com/avatar/tech-group.jpg",
    "ownerId": 101,
    "notice": "本群禁止广告",
    "visibilityScope": "private",
    "joinRule": "free",
    "speakLevelLimit": 1,
    "memberLimit": 200,
    "selfRole": "owner",
    "memberCount": 45,
    "createdAt": "2025-01-05T10:00:00"
  }
}
```

---

## 3. 查询群成员列表

**接口信息**
- 路径：`GET /api/user/chat/groups/{conversationId}/members`
- 鉴权：是
- 说明：获取群聊的所有成员列表

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "userId": 101,
      "username": "zhangsan",
      "nickname": "张三",
      "avatar": "https://example.com/avatar/zhangsan.jpg",
      "role": "owner",
      "status": 0,
      "joinedAt": "2025-01-15T12:00:00",
      "muteUntil": null
    },
    {
      "userId": 102,
      "username": "lisi",
      "nickname": "李四",
      "role": "admin",
      "status": 0,
      "muteUntil": "2025-01-16T12:00:00"
    }
  ]
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | Long | 用户ID |
| `username` | String | 用户名 |
| `nickname` | String | 昵称 |
| `avatar` | String | 头像URL |
| `role` | String | 成员角色：`owner` 群主、`admin` 管理员、`member` 成员 |
| `status` | Integer | 成员状态：`0` 正常 |
| `joinedAt` | DateTime | 加入时间 |
| `muteUntil` | DateTime | 禁言截止时间，为空表示未禁言 |

---

## 4. 邀请群成员

**接口信息**
- 路径：`POST /api/user/chat/groups/{conversationId}/members`
- 鉴权：是
- 说明：邀请用户加入群聊，需要群主或管理员权限

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `memberUserIds` | List\<Long\> | 是 | 要邀请的用户ID列表 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 5. 移除群成员

**接口信息**
- 路径：`DELETE /api/user/chat/groups/{conversationId}/members/{userId}`
- 鉴权：是
- 说明：移除群聊中的指定成员，需要群主或管理员权限

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |
| `userId` | Long | 是 | 被移除的用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 6. 加入频道/公开群

**接口信息**
- 路径：`POST /api/user/chat/conversations/{conversationId}/join`
- 鉴权：是
- 说明：加入公开频道或公开群，加入后自动成为成员

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1003,
    "conversationType": "group",
    "sceneType": "group_chat",
    "name": "技术交流群",
    "avatar": "https://example.com/avatar/tech-group.jpg",
    "ownerId": 101,
    "selfRole": "member",
    "memberCount": 46,
    "unreadCount": 0,
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 会话不存在 |
| 40011 | 会话不是公开类型 |
| 40011 | 已是成员 |

---

## 7. 离开频道或公开群

**接口信息**
- 路径：`POST /api/user/chat/conversations/{conversationId}/leave`
- 鉴权：是
- 说明：离开公开频道或公开群，离开后不再接收消息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 会话不存在 |
| 40011 | 非成员无法离开 |

---

## 8. 更新群公告

**接口信息**
- 路径：`PUT /api/user/chat/groups/{conversationId}/notice`
- 鉴权：是
- 说明：更新群聊公告内容，需要群主或管理员权限

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `notice` | String | 否 | 群公告内容，最大500字符，为空表示清空 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1003,
    "conversationType": "group",
    "sceneType": "group_chat",
    "name": "技术交流群",
    "notice": "每周五下午3点技术分享会",
    "selfRole": "owner",
    "memberCount": 45
  }
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 群聊不存在 |
| 40301 | 非群主或管理员 |

---

## 9. 设置群管理员

**接口信息**
- 路径：`PUT /api/user/chat/groups/{conversationId}/admins/{memberUserId}`
- 鉴权：是
- 说明：将指定群成员设为管理员，需要群主权限

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |
| `memberUserId` | Long | 是 | 目标成员用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "userId": 101,
      "nickname": "张三",
      "role": "owner",
      "joinedAt": "2025-01-15T12:00:00"
    },
    {
      "userId": 102,
      "nickname": "李四",
      "role": "admin",
      "joinedAt": "2025-01-16T09:00:00"
    }
  ]
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 群聊不存在 |
| 40301 | 非群主 |
| 40011 | 目标用户不是群成员 |
| 40011 | 目标用户已是管理员 |

---

## 10. 取消群管理员

**接口信息**
- 路径：`DELETE /api/user/chat/groups/{conversationId}/admins/{memberUserId}`
- 鉴权：是
- 说明：取消指定成员的管理员身份，需要群主权限

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |
| `memberUserId` | Long | 是 | 目标成员用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "userId": 101,
      "nickname": "张三",
      "role": "owner",
      "joinedAt": "2025-01-15T12:00:00"
    },
    {
      "userId": 102,
      "nickname": "李四",
      "role": "member",
      "joinedAt": "2025-01-16T09:00:00"
    }
  ]
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 群聊不存在 |
| 40301 | 非群主 |
| 40011 | 目标用户不是管理员 |

---

## 11. 转让群主

**接口信息**
- 路径：`PUT /api/user/chat/groups/{conversationId}/owner`
- 鉴权：是
- 说明：将群主身份转让给指定成员，转让后当前用户变为普通成员

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `targetUserId` | Long | 是 | 新群主用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1003,
    "conversationType": "group",
    "sceneType": "group_chat",
    "name": "技术交流群",
    "ownerId": 102,
    "selfRole": "member",
    "memberCount": 45
  }
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 群聊不存在 |
| 40301 | 非群主 |
| 40011 | 目标用户不是群成员 |

---

## 12. 群成员禁言

**接口信息**
- 路径：`PUT /api/user/chat/groups/{conversationId}/members/{memberUserId}/mute`
- 鉴权：是
- 说明：设置群成员禁言截止时间，需要群主或管理员权限

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |
| `memberUserId` | Long | 是 | 目标成员用户ID |

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `muteUntil` | DateTime | 否 | 禁言截止时间，为空表示取消禁言 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "userId": 103,
      "nickname": "王五",
      "role": "member",
      "muteUntil": "2025-01-20T12:00:00"
    }
  ]
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 群聊不存在 |
| 40301 | 非群主或管理员 |
| 40011 | 目标用户不是群成员 |

---

## 13. 解散群聊

**接口信息**
- 路径：`DELETE /api/user/chat/groups/{conversationId}`
- 鉴权：是
- 说明：解散群聊，仅群主可操作，解散后所有成员被移除

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

**错误码**

| code | 说明 |
|---|---|
| 40401 | 群聊不存在 |
| 40301 | 非群主 |