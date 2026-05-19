# 聊天消息管理 API

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)
> 场景：聊天页，包含消息列表查询、消息发送、消息编辑、消息撤回、消息删除等。

---

## 1. 分页查询会话消息

**接口信息**
- 路径：`GET /api/user/chat/conversations/{conversationId}/messages`
- 鉴权：是
- 说明：分页获取指定会话的历史消息，默认按时间倒序

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 是 | 会话ID |

**请求参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `current` | Long | 否 | 1 | 页码 |
| `size` | Long | 否 | 20 | 每页条数 |
| `beforeMessageId` | Long | 否 | - | 查询该消息ID之前的消息，用于滚动加载更多 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
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
        "senderAvatar": "https://example.com/avatar/zhangsan.jpg",
        "messageType": "text",
        "content": "你好，明天有空吗？",
        "clientMessageId": "msg-uuid-123456",
        "self": true,
        "deliveryStatus": 2,
        "readByCurrentUser": true,
        "revoked": false,
        "edited": false,
        "createdAt": "2025-01-15T10:30:00"
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Long | 消息ID |
| `conversationId` | Long | 所属会话ID |
| `senderId` | Long | 发送人用户ID |
| `senderNickname` | String | 发送人昵称 |
| `messageType` | String | 消息类型：`text` 文本、`file` 文件等 |
| `content` | String | 文本消息内容 |
| `file` | Object | 文件消息载荷 |
| `self` | Boolean | 是否当前用户自己发送 |
| `deliveryStatus` | Integer | 投递状态：`0` 待投递、`1` 已送达、`2` 已读 |
| `readByCurrentUser` | Boolean | 当前用户是否已读 |
| `revoked` | Boolean | 是否已撤回 |
| `edited` | Boolean | 是否编辑过 |
| `createdAt` | DateTime | 消息发送时间 |

---

## 2. 发送文本消息

**接口信息**
- 路径：`POST /api/user/chat/messages/text`
- 鉴权：是
- 说明：发送文本消息，支持单聊和群聊

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 否 | 会话ID，已存在会话时优先传该字段 |
| `targetUserId` | Long | 否 | 单聊目标用户ID，未传会话ID时用于自动创建/获取单聊 |
| `content` | String | 是 | 文本消息内容，最大2000字符 |
| `clientMessageId` | String | 否 | 客户端幂等消息ID，建议使用UUID |
| `replyMessageId` | Long | 否 | 回复的消息ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 9021,
    "conversationId": 1001,
    "senderId": 101,
    "senderNickname": "张三",
    "messageType": "text",
    "content": "你好，明天有空吗？",
    "clientMessageId": "msg-uuid-123456",
    "self": true,
    "deliveryStatus": 0,
    "createdAt": "2025-01-15T12:00:00"
  }
}
```

---

## 3. 发送文件消息

**接口信息**
- 路径：`POST /api/user/chat/messages/file`
- 鉴权：是
- 说明：发送文件消息（图片、语音、视频、文档等），文件需先通过文件上传接口获取 businessId

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `conversationId` | Long | 否 | 会话ID，已存在会话时优先传该字段 |
| `targetUserId` | Long | 否 | 单聊目标用户ID，未传会话ID时用于自动创建/获取单聊 |
| `businessId` | Long | 是 | 上传完成后得到的文件业务引用ID |
| `clientMessageId` | String | 否 | 客户端幂等消息ID |
| `replyMessageId` | Long | 否 | 回复的消息ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 9022,
    "conversationId": 1001,
    "messageType": "file",
    "file": {
      "businessId": 5001,
      "fileId": 3001,
      "fileName": "photo.jpg",
      "fileUrl": "https://example.com/files/photo.jpg",
      "fileSize": 2048000,
      "fileType": "jpg",
      "mimeType": "image/jpeg",
      "previewUrl": "https://example.com/files/photo.jpg",
      "thumbnailUrl": "https://example.com/files/photo_thumb.jpg",
      "width": 1920,
      "height": 1080,
      "transcodeStatus": "ready"
    },
    "self": true,
    "deliveryStatus": 0,
    "createdAt": "2025-01-15T12:01:00"
  }
}
```

---

## 4. 编辑消息

**接口信息**
- 路径：`PUT /api/user/chat/messages/{messageId}`
- 鉴权：是
- 说明：编辑已发送的文本消息，仅本人发送的消息可编辑

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `messageId` | Long | 是 | 消息ID |

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `content` | String | 是 | 新的文本消息内容，最大2000字符 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 9021,
    "content": "你好，明天有空吗？想约你吃饭。",
    "edited": true,
    "updatedAt": "2025-01-15T12:05:00"
  }
}
```

---

## 5. 撤回消息

**接口信息**
- 路径：`POST /api/user/chat/messages/{messageId}/revoke`
- 鉴权：是
- 说明：撤回已发送的消息，仅本人发送的消息可撤回

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `messageId` | Long | 是 | 消息ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": null
}
```

---

## 6. 删除消息（当前用户视角）

**接口信息**
- 路径：`DELETE /api/user/chat/messages/{messageId}`
- 鉴权：是
- 说明：删除消息，仅从当前用户视角删除，不影响其他用户看到

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `messageId` | Long | 是 | 消息ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "data": null
}