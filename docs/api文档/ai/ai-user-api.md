# ai-user-api.md

> 统一响应格式、分页约定、错误码见 [README.md](./README.md#联调统一约定)

[AI 对话页]

---

## AI 对话页

### 创建 AI 会话

**接口信息**
- 路径: `POST /api/user/ai/sessions`
- 鉴权: 是
- 说明: 创建一个新的 AI 对话会话，不传 `channelConfigId` 则使用默认渠道

**请求字段说明**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `title` | String | 否 | 会话标题 |
| `channelConfigId` | Long | 否 | 渠道配置ID，不填则使用默认渠道 |
| `sceneType` | String | 否 | 会话场景，默认 `general` |

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "title": "Java 学习助手",
    "channelConfigId": 1,
    "sceneType": "general",
    "status": 1,
    "lastMessageAt": null,
    "createdAt": "2026-04-15T14:00:00",
    "updatedAt": "2026-04-15T14:00:00"
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `id` | Long | 会话ID |
| `title` | String | 会话标题 |
| `channelConfigId` | Long | 渠道配置ID |
| `sceneType` | String | 会话场景 |
| `status` | Integer | 状态：0-关闭，1-正常 |
| `lastMessageAt` | DateTime | 最后消息时间 |
| `createdAt` | DateTime | 创建时间 |
| `updatedAt` | DateTime | 更新时间 |

**错误码**
| code | 说明 |
|-----|------|
| 401 | 未登录 |
| 403 | 无权限 |
| 500 | 服务器错误 |

---

### 查询我的 AI 会话列表

**接口信息**
- 路径: `GET /api/user/ai/sessions`
- 鉴权: 是
- 说明: 分页查询当前用户的 AI 会话列表

**查询参数说明**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `10` |

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "total": 2,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "title": "Java 学习助手",
        "channelConfigId": 1,
        "sceneType": "general",
        "status": 1,
        "lastMessageAt": "2026-04-15T14:05:00",
        "createdAt": "2026-04-15T14:00:00",
        "updatedAt": "2026-04-15T14:05:00"
      },
      {
        "id": 2,
        "title": "文章写作辅助",
        "channelConfigId": 1,
        "sceneType": "general",
        "status": 1,
        "lastMessageAt": "2026-04-14T09:30:00",
        "createdAt": "2026-04-14T09:00:00",
        "updatedAt": "2026-04-14T09:30:00"
      }
    ]
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `total` | Long | 总记录数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页条数 |
| `records` | Array | 会话列表 |
| `records[].id` | Long | 会话ID |
| `records[].title` | String | 会话标题 |
| `records[].channelConfigId` | Long | 渠道配置ID |
| `records[].sceneType` | String | 会话场景 |
| `records[].status` | Integer | 状态：0-关闭，1-正常 |
| `records[].lastMessageAt` | DateTime | 最后消息时间 |
| `records[].createdAt` | DateTime | 创建时间 |
| `records[].updatedAt` | DateTime | 更新时间 |

---

### 查询 AI 会话详情

**接口信息**
- 路径: `GET /api/user/ai/sessions/{id}`
- 鉴权: 是
- 说明: 查询指定会话的详细信息，包含渠道名称和模型名称

**路径参数说明**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `id` | Long | 是 | 会话ID |

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 1,
    "title": "Java 学习助手",
    "channelConfigId": 1,
    "sceneType": "general",
    "status": 1,
    "lastMessageAt": "2026-04-15T14:05:00",
    "createdAt": "2026-04-15T14:00:00",
    "updatedAt": "2026-04-15T14:05:00",
    "channelName": "DeepSeek 对话渠道",
    "modelName": "deepseek-chat"
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `id` | Long | 会话ID |
| `title` | String | 会话标题 |
| `channelConfigId` | Long | 渠道配置ID |
| `sceneType` | String | 会话场景 |
| `status` | Integer | 状态：0-关闭，1-正常 |
| `lastMessageAt` | DateTime | 最后消息时间 |
| `createdAt` | DateTime | 创建时间 |
| `updatedAt` | DateTime | 更新时间 |
| `channelName` | String | 渠道名称 |
| `modelName` | String | 模型名称 |

**错误码**
| code | 说明 |
|-----|------|
| 403 | 无权访问该会话 |
| 404 | 会话不存在 |

---

### 分页查询会话消息

**接口信息**
- 路径: `GET /api/user/ai/sessions/{id}/messages`
- 鉴权: 是
- 说明: 分页查询指定会话的历史消息，按时间正序排列

**路径参数说明**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `id` | Long | 是 | 会话ID |

**查询参数说明**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `current` | Long | 否 | 页码，默认 `1` |
| `size` | Long | 否 | 每页条数，默认 `20` |

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
        "id": 9,
        "roleType": "user",
        "content": "帮我解释一下 Java 的 Stream API",
        "tokenCount": 12,
        "responseStatus": 1,
        "errorMessage": null,
        "ragReferences": null,
        "createdAt": "2026-04-15T14:04:00"
      },
      {
        "id": 10,
        "roleType": "assistant",
        "content": "Java 中 Stream API 是 Java 8 引入的功能，用于对集合进行函数式操作...",
        "tokenCount": 156,
        "responseStatus": 1,
        "errorMessage": null,
        "ragReferences": [
          {
            "sourceType": "public_article",
            "sourceId": 1001,
            "entryId": 501,
            "title": "Java Stream API 入门",
            "sourceUrl": "/articles/1001",
            "chunkIndex": 0,
            "score": 0.8123
          }
        ],
        "createdAt": "2026-04-15T14:05:00"
      }
    ]
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `total` | Long | 总记录数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页条数 |
| `records` | Array | 消息列表 |
| `records[].id` | Long | 消息ID |
| `records[].roleType` | String | 角色类型：`user`/`assistant`/`system` |
| `records[].content` | String | 消息内容 |
| `records[].tokenCount` | Integer | token 数量 |
| `records[].responseStatus` | Integer | 响应状态：0-失败，1-成功 |
| `records[].errorMessage` | String | 错误信息，失败时返回 |
| `records[].ragReferences` | Array | RAG 引用来源，仅助手消息可能包含 |
| `records[].createdAt` | DateTime | 创建时间 |

**ragReferences 字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `sourceType` | String | 来源类型：`public_article`/`forum_post`/`author_profile`/`admin_entry` |
| `sourceId` | Long | 来源对象ID |
| `entryId` | Long | 知识条目ID |
| `title` | String | 来源标题 |
| `sourceUrl` | String | 来源页面URL |
| `chunkIndex` | Integer | 命中分块序号 |
| `score` | Double | 相似度分数 |

---

### 发送消息

**接口信息**
- 路径: `POST /api/user/ai/sessions/{id}/messages`
- 鉴权: 是
- 说明: 向指定会话发送用户消息

**路径参数说明**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `id` | Long | 是 | 会话ID |

**请求体字段说明**
| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `content` | String | 是 | 消息内容，最大 2000 字符 |
| `requestSceneType` | String | 否 | 请求场景类型，默认 `general` |
| `requestTargetId` | Long | 否 | 关联目标ID |
| `attachmentFileIds` | Array\<Long\> | 否 | 附件文件ID列表（目前仅支持图片），最多5个 |

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "id": 9,
    "roleType": "user",
    "content": "帮我解释一下 Java 的 Stream API",
    "tokenCount": 12,
    "responseStatus": 1,
    "errorMessage": null,
    "ragReferences": null,
    "attachments": null,
    "createdAt": "2026-04-15T14:04:00"
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `id` | Long | 消息ID |
| `roleType` | String | 角色类型：`user`/`assistant`/`system` |
| `content` | String | 消息内容 |
| `tokenCount` | Integer | token 数量 |
| `responseStatus` | Integer | 响应状态：0-失败，1-成功 |
| `errorMessage` | String | 错误信息 |
| `ragReferences` | Array | RAG 引用来源 |
| `attachments` | Array | 附件列表 |
| `createdAt` | DateTime | 创建时间 |

#### attachments 字段说明

| 字段 | 类型 | 说明 |
| ---- | ------ | ---- |
| `fileId` | Long | 文件ID |
| `fileType` | String | 文件类型 |
| `mimeType` | String | MIME 类型 |
| `fileUrl` | String | 文件访问URL |

**错误码**

| code | 说明 |
| ---- | ------ |
| 400 | 消息内容为空或超过2000字符 |
| 403 | 无权访问该会话 |
| 404 | 会话不存在 |
| 429 | 配额不足 |

---

### 流式发送消息（SSE）

**接口信息**

- 路径: `POST /api/user/ai/sessions/{id}/messages/stream`
- 鉴权: 是
- Content-Type: `application/json`
- 响应类型: `text/event-stream`
- 说明: 以 SSE 流式方式发送消息，实时接收 AI 响应。请求体与普通发送消息一致。

#### SSE 事件类型

| 事件名 | 说明 | data 格式 |
| ------ | ------ | -------- |
| `delta` | 增量文本片段 | `{"type":"delta","content":"文本"}` |
| `usage` | token 用量统计 | `{"type":"usage","requestTokens":10,"responseTokens":20,"totalTokens":30}` |
| `done` | 流式结束 | `{"type":"done"}` |
| `error` | 错误信息 | `{"type":"error","content":"错误描述"}` |

---

### 关闭会话

**接口信息**
- 路径: `DELETE /api/user/ai/sessions/{id}`
- 鉴权: 是
- 说明: 关闭指定的 AI 对话会话

**路径参数说明**
| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| `id` | Long | 是 | 会话ID |

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": null
}
```

**错误码**
| code | 说明 |
|-----|------|
| 403 | 无权关闭该会话 |
| 404 | 会话不存在 |

---

### 查询我的 AI 配额

**接口信息**
- 路径: `GET /api/user/ai/sessions/quota`
- 鉴权: 是
- 说明: 查询当前用户在默认渠道的 AI 配额使用情况

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "timestamp": 1774310400000,
  "data": {
    "dailyLimit": 50,
    "usedToday": 12,
    "remainingToday": 38
  }
}
```

**响应字段说明**
| 字段 | 类型 | 说明 |
|-----|------|-----|
| `dailyLimit` | int | 每日限额 |
| `usedToday` | long | 今日已用 |
| `remainingToday` | long | 今日剩余 |

---
\n---\n\n