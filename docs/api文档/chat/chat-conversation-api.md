# 聊天会话管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：会话列表页，包含会话列表查询、单聊会话创建、会话详情查看等。

---

## 1. 获取我的会话列表

**接口信息**
- 路径：`GET /api/user/chat/conversations`
- 鉴权：是
- 说明：分页查询当前用户的会话列表，支持按关键字搜索会话名称或最后一条消息内容

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `current` | Long | 否 | 1 | 页码 |
| `size` | Long | 否 | 20 | 每页条数 |
| `keyword` | String | 否 | - | 关键字，模糊查询会话名或最后一条消息内容 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "total": 3,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 1001,
        "conversationType": "single",
        "sceneType": "single_chat",
        "name": "李四",
        "avatar": "https://example.com/avatar/lisi.jpg",
        "targetUserId": 102,
        "targetUsername": "lisi",
        "targetNickname": "李四",
        "unreadCount": 2,
        "lastMessage": {
          "id": 9010,
          "senderId": 102,
          "senderNickname": "李四",
          "messageType": "text",
          "content": "好的，明天见！",
          "createdAt": "2025-01-15T10:32:00"
        },
        "createdAt": "2025-01-10T08:00:00",
        "updatedAt": "2025-01-15T10:32:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 会话ID |
| `conversationType` | String | 会话类型：`single` 单聊、`group` 群聊 |
| `sceneType` | String | 业务场景：`single_chat`、`group_chat` 等 |
| `name` | String | 会话名称 |
| `avatar` | String | 会话头像URL |
| `targetUserId` | Long | 单聊目标用户ID |
| `targetNickname` | String | 单聊目标昵称 |
| `unreadCount` | Integer | 未读消息数 |
| `lastMessage` | Object | 最后一条消息摘要 |
| `lastMessage.id` | Long | 消息ID |
| `lastMessage.content` | String | 消息内容摘要 |
| `lastMessage.createdAt` | DateTime | 发送时间 |

---

## 2. 打开或创建单聊会话

**接口信息**
- 路径：`POST /api/user/chat/single-conversations`
- 鉴权：是
- 说明：根据目标用户ID打开或创建一个单聊会话

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `targetUserId` | Long | 是 | 目标用户ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 1001,
    "conversationType": "single",
    "sceneType": "single_chat",
    "name": "李四",
    "avatar": "https://example.com/avatar/lisi.jpg",
    "targetUserId": 102,
    "targetUsername": "lisi",
    "targetNickname": "李四",
    "unreadCount": 0,
    "status": 0,
    "createdAt": "2025-01-10T08:00:00",
    "updatedAt": "2025-01-15T12:00:00"
  }
}
```

---

## 3. 查询会话详情

**接口信息**
- 路径：`GET /api/user/chat/conversations/{conversationId}`
- 鉴权：是
- 说明：根据会话ID查询会话详细信息

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
    "id": 1001,
    "conversationType": "single",
    "sceneType": "single_chat",
    "name": "李四",
    "avatar": "https://example.com/avatar/lisi.jpg",
    "targetUserId": 102,
    "targetNickname": "李四",
    "unreadCount": 0,
    "status": 0
  }
}
```

---

## 4. 推进会话已读游标

**接口信息**
- 路径：`POST /api/user/chat/conversations/{conversationId}/read`
- 鉴权：是
- 说明：告诉服务器当前用户已阅读到某条消息，推进已读进度

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `readMessageId` | Long | 是 | 最后已读消息ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "conversationId": 1001,
    "userId": 101,
    "readMessageId": 9020,
    "readAt": "2025-01-15T12:10:00",
    "deliveredMessageId": 9022,
    "deliveredAt": "2025-01-15T12:05:00",
    "unreadCount": 0
  }
}