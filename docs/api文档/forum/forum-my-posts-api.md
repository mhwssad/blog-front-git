# 我的帖子与频道挂接

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

包含我的帖子管理和帖子频道挂接相关接口。以下接口均要求登录。

---

## 我的帖子列表

**接口信息**

- 路径：`GET /api/user/forum/posts`
- 鉴权：是
- 说明：分页查询当前用户的帖子列表，包含草稿和已发布

**请求参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量 | 10 |
| `keyword` | String | 否 | 标题关键字搜索 | - |
| `sectionId` | Long | 否 | 版块ID | - |
| `status` | Integer | 否 | 帖子状态 `0`草稿`1`已发布 | - |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 15,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 20,
        "sectionId": 1,
        "sectionName": "技术交流",
        "authorId": 100,
        "authorName": "张三",
        "title": "我的新帖子",
        "status": 1,
        "visibilityScope": 0,
        "isTop": 0,
        "isEssence": 0,
        "viewCount": 100,
        "likeCount": 10,
        "replyCount": 5,
        "collectCount": 2,
        "shareCount": 1,
        "publishedAt": "2025-01-15T10:30:00",
        "createdAt": "2025-01-15T10:30:00",
        "updatedAt": "2025-01-15T10:30:00"
      },
      {
        "id": 19,
        "sectionId": 1,
        "sectionName": "技术交流",
        "authorId": 100,
        "authorName": "张三",
        "title": "草稿帖子",
        "status": 0,
        "visibilityScope": 0,
        "isTop": 0,
        "isEssence": 0,
        "viewCount": 0,
        "likeCount": 0,
        "replyCount": 0,
        "collectCount": 0,
        "shareCount": 0,
        "publishedAt": null,
        "createdAt": "2025-01-14T09:00:00",
        "updatedAt": "2025-01-14T09:00:00"
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
| `size` | Long | 每页数量 |
| `records` | Array | 帖子列表，字段同公开帖子列表 |

**错误码**

| code | 说明 |
|-----|------|
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

## 我的帖子详情

**接口信息**

- 路径：`GET /api/user/forum/posts/{id}`
- 鉴权：是
- 说明：获取当前用户帖子的完整详情，包含内容字段

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 20,
    "sectionId": 1,
    "sectionName": "技术交流",
    "authorId": 100,
    "authorName": "张三",
    "title": "我的新帖子",
    "content": "这是帖子内容...",
    "status": 1,
    "visibilityScope": 0,
    "isTop": 0,
    "isEssence": 0,
    "viewCount": 100,
    "likeCount": 10,
    "replyCount": 5,
    "collectCount": 2,
    "shareCount": 1,
    "publishedAt": "2025-01-15T10:30:00",
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00",
    "liked": false,
    "collected": false,
    "canReply": true,
    "linkedChannel": null
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 帖子不存在 |
| 40301 | 非本人帖子 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

## 帖子频道挂接

> 路由前缀 `/api/user/chat/forum-links`，由聊天模块下的 `UserForumPostChannelLinkController` 提供。

### 分享帖子到频道（频道侧入口）

**接口信息**

- 路径：`POST /api/user/chat/forum-links`
- 鉴权：是
- 说明：将帖子分享到指定频道，每个帖子同一时间只能挂接一个频道。论坛侧另有一个入口 `POST /api/user/forum/posts/{postId}/channel-share`，功能相同

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `forumPostId` | Long | 是 | 论坛帖子ID |
| `conversationId` | Long | 是 | 目标频道会话ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2026-01-15 15:30:00",
  "data": {
    "id": 5,
    "forumPostId": 10,
    "conversationId": 99,
    "channelName": "技术交流频道",
    "linkType": "forum_share",
    "linkedBy": 100,
    "linkedAt": "2026-01-15 15:30:00"
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `id` | Long | 关联记录ID |
| `forumPostId` | Long | 论坛帖子ID |
| `conversationId` | Long | 频道会话ID |
| `channelName` | String | 频道名称 |
| `linkType` | String | 关联方式，如 `forum_share` |
| `linkedBy` | Long | 关联人ID |
| `linkedAt` | DateTime | 关联时间 |

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40401 | 帖子或频道不存在 |
| 40011 | 帖子未发布或用户不是频道成员 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 查询帖子关联的频道

**接口信息**

- 路径：`GET /api/user/chat/forum-links/posts/{forumPostId}`
- 鉴权：是
- 说明：查询指定帖子当前挂接的频道信息，未挂接时返回 `data: null`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `forumPostId` | Long | 是 | 论坛帖子ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2026-01-15 15:30:00",
  "data": {
    "id": 5,
    "forumPostId": 10,
    "conversationId": 99,
    "channelName": "技术交流频道",
    "linkType": "forum_share",
    "linkedBy": 100,
    "linkedAt": "2026-01-15 15:30:00"
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 分页查询频道关联的帖子

**接口信息**

- 路径：`GET /api/user/chat/forum-links/channels/{conversationId}`
- 鉴权：是
- 说明：分页查询指定频道下挂接的所有帖子

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `conversationId` | Long | 是 | 频道会话ID |

**查询参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量 | 20 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2026-01-15 15:30:00",
  "data": {
    "total": 3,
    "current": 1,
    "size": 20,
    "records": [
      {
        "id": 5,
        "forumPostId": 10,
        "conversationId": 99,
        "channelName": "技术交流频道",
        "linkType": "forum_share",
        "linkedBy": 100,
        "linkedAt": "2026-01-15 15:30:00"
      }
    ]
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 取消帖子与频道的关联

**接口信息**

- 路径：`DELETE /api/user/chat/forum-links/posts/{forumPostId}`
- 鉴权：是
- 说明：取消指定帖子与频道的关联，仅关联人本人可操作

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `forumPostId` | Long | 是 | 论坛帖子ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2026-01-15 16:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 关联不存在 |
| 40300 | 非关联人本人 |
| 40101 | 未登录 |
| 50001 | 系统异常 |
