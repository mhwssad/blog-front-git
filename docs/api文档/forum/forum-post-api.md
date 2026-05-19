# 论坛帖子接口

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

包含论坛首页、帖子详情页、发帖与编辑相关接口。

---

## 论坛首页

### 获取版块列表

**接口信息**

- 路径：`GET /api/forum/sections`
- 鉴权：否
- 说明：获取所有论坛版块列表，未登录用户只看公开版块，登录用户额外看到登录可见版块

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 1,
      "name": "技术交流",
      "description": "技术问题与经验分享",
      "sortOrder": 10,
      "visibilityScope": 0,
      "postLevelLimit": 1,
      "status": 1,
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-10T12:00:00"
    },
    {
      "id": 2,
      "name": "内部交流",
      "description": "仅登录用户可见",
      "sortOrder": 20,
      "visibilityScope": 1,
      "postLevelLimit": 5,
      "status": 1,
      "createdAt": "2025-01-02T00:00:00",
      "updatedAt": "2025-01-11T12:00:00"
    }
  ]
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `id` | Long | 版块ID |
| `name` | String | 版块名称 |
| `description` | String | 版块简介 |
| `sortOrder` | Integer | 排序值，值越小越靠前 |
| `visibilityScope` | Integer | `0` 公开，`1` 登录可见 |
| `postLevelLimit` | Integer | 发帖最低等级要求 |
| `status` | Integer | `0` 禁用，`1` 启用 |
| `createdAt` | DateTime | 创建时间 |
| `updatedAt` | DateTime | 更新时间 |

**错误码**

| code | 说明 |
|-----|------|
| 50001 | 系统异常 |

---

### 分页查询帖子

**接口信息**

- 路径：`GET /api/forum/posts`
- 鉴权：否
- 说明：分页查询公开帖子列表，匿名用户只看公开版块和公开帖子，登录用户额外看到登录可见内容

**请求参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量 | 10 |
| `keyword` | String | 否 | 标题/内容关键字搜索 | - |
| `sectionId` | Long | 否 | 版块ID | - |
| `authorId` | Long | 否 | 作者ID | - |
| `createdAtStart` | DateTime | 否 | 创建时间开始，格式 `yyyy-MM-dd HH:mm:ss` | - |
| `createdAtEnd` | DateTime | 否 | 创建时间结束，格式 `yyyy-MM-dd HH:mm:ss` | - |
| `sort` | String | 否 | `latest`(最新) 或 `hot`(热门) | latest |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 100,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 10,
        "sectionId": 1,
        "sectionName": "技术交流",
        "authorId": 100,
        "authorName": "张三",
        "title": "Spring Boot 最佳实践",
        "status": 1,
        "visibilityScope": 0,
        "isTop": 1,
        "isEssence": 1,
        "viewCount": 1523,
        "likeCount": 88,
        "replyCount": 35,
        "collectCount": 12,
        "shareCount": 5,
        "publishedAt": "2025-01-14T15:30:00",
        "createdAt": "2025-01-14T15:30:00",
        "updatedAt": "2025-01-14T18:00:00"
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
| `records[].id` | Long | 帖子ID |
| `records[].sectionId` | Long | 版块ID |
| `records[].sectionName` | String | 版块名称 |
| `records[].authorId` | Long | 作者ID |
| `records[].authorName` | String | 作者昵称 |
| `records[].title` | String | 帖子标题 |
| `records[].status` | Integer | `0`草稿`1`已发布`5`隐藏 |
| `records[].visibilityScope` | Integer | `0`公开`1`登录可见 |
| `records[].isTop` | Integer | `0`否`1`是 |
| `records[].isEssence` | Integer | `0`否`1`是 |
| `records[].viewCount` | Integer | 浏览数 |
| `records[].likeCount` | Integer | 点赞数 |
| `records[].replyCount` | Integer | 回复数 |
| `records[].collectCount` | Integer | 收藏数 |
| `records[].shareCount` | Integer | 分享数 |
| `records[].publishedAt` | DateTime | 发布时间 |
| `records[].createdAt` | DateTime | 创建时间 |
| `records[].updatedAt` | DateTime | 更新时间 |

**错误码**

| code | 说明 |
|-----|------|
| 50001 | 系统异常 |

---

## 帖子详情页

### 查询帖子详情

**接口信息**

- 路径：`GET /api/forum/posts/{id}`
- 鉴权：否
- 说明：获取帖子详情，包含内容、互动状态和关联频道信息

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 10,
    "sectionId": 1,
    "sectionName": "技术交流",
    "authorId": 100,
    "authorName": "张三",
    "title": "Spring Boot 最佳实践",
    "content": "本文总结了 Spring Boot 开发的最佳实践，包括配置管理、性能优化等方面...",
    "status": 1,
    "visibilityScope": 0,
    "isTop": 1,
    "isEssence": 1,
    "viewCount": 1523,
    "likeCount": 88,
    "replyCount": 35,
    "collectCount": 12,
    "shareCount": 5,
    "publishedAt": "2025-01-14T15:30:00",
    "createdAt": "2025-01-14T15:30:00",
    "updatedAt": "2025-01-14T18:00:00",
    "liked": false,
    "collected": false,
    "canReply": true,
    "linkedChannel": {
      "id": 5,
      "forumPostId": 10,
      "conversationId": 99,
      "channelName": "技术交流频道",
      "linkType": "forum_share",
      "linkedBy": 100,
      "linkedAt": "2025-01-14T16:00:00"
    }
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| (基础字段同帖子列表) | - | - |
| `content` | String | 帖子正文内容 |
| `liked` | Boolean | 当前用户是否已点赞（需登录） |
| `collected` | Boolean | 当前用户是否已收藏（需登录） |
| `canReply` | Boolean | 当前用户是否可以回复（需登录+帖子已发布+用户未被禁言） |
| `linkedChannel` | Object | 关联的频道信息，无关联时为 `null` |

**linkedChannel 字段说明**

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
| 40401 | 帖子不存在 |
| 40011 | 帖子不可见 |
| 50001 | 系统异常 |

---

### 分页查询回复

**接口信息**

- 路径：`GET /api/forum/posts/{postId}/replies`
- 鉴权：否
- 说明：分页查询帖子回复，根回复分页展示，子回复以树形结构嵌套在根回复下

**请求参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量 | 10 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 35,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 1001,
        "postId": 10,
        "parentId": null,
        "rootId": null,
        "userId": 101,
        "userName": "李四",
        "content": "写得很好，收藏了！",
        "status": 1,
        "floorNo": 1,
        "likeCount": 5,
        "replyCount": 2,
        "createdAt": "2025-01-14T16:00:00",
        "updatedAt": "2025-01-14T16:00:00",
        "children": [
          {
            "id": 1002,
            "postId": 10,
            "parentId": 1001,
            "rootId": 1001,
            "userId": 100,
            "userName": "张三",
            "content": "感谢支持！",
            "status": 1,
            "floorNo": 2,
            "likeCount": 1,
            "replyCount": 0,
            "createdAt": "2025-01-14T16:30:00",
            "updatedAt": "2025-01-14T16:30:00",
            "children": []
          }
        ]
      },
      {
        "id": 1003,
        "postId": 10,
        "parentId": null,
        "rootId": null,
        "userId": 102,
        "userName": "王五",
        "content": "请问有源码吗？",
        "status": 1,
        "floorNo": 3,
        "likeCount": 2,
        "replyCount": 1,
        "createdAt": "2025-01-14T17:00:00",
        "updatedAt": "2025-01-14T17:00:00",
        "children": []
      }
    ]
  }
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| `total` | Long | 根回复总数 |
| `current` | Long | 当前页码 |
| `size` | Long | 每页数量 |
| `records[].id` | Long | 回复ID |
| `records[].postId` | Long | 所属帖子ID |
| `records[].parentId` | Long | 父回复ID，顶级回复为 `null` |
| `records[].rootId` | Long | 根回复ID，顶级回复为 `null` |
| `records[].userId` | Long | 回复用户ID |
| `records[].userName` | String | 回复用户昵称 |
| `records[].content` | String | 回复内容 |
| `records[].status` | Integer | `1`正常`2`隐藏`3`删除 |
| `records[].floorNo` | Integer | 楼层号 |
| `records[].likeCount` | Integer | 点赞数 |
| `records[].replyCount` | Integer | 该回复下的子回复数 |
| `records[].createdAt` | DateTime | 创建时间 |
| `records[].updatedAt` | DateTime | 更新时间 |
| `records[].children` | Array | 子回复列表（树形结构） |

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 帖子不存在 |
| 50001 | 系统异常 |

---

## 发帖与编辑

> 以下接口均要求登录

### 创建帖子

**接口信息**

- 路径：`POST /api/user/forum/posts`
- 鉴权：是
- 说明：创建新的论坛帖子，支持发布或存草稿

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `sectionId` | Long | 是 | 目标版块ID |
| `title` | String | 是 | 帖子标题，最大128字符 |
| `content` | String | 否 | 帖子正文内容 |
| `status` | Integer | 否 | `0`草稿`1`已发布，默认`1` |
| `visibilityScope` | Integer | 否 | `0`公开`1`登录可见，默认`0` |

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
    "viewCount": 0,
    "likeCount": 0,
    "replyCount": 0,
    "collectCount": 0,
    "shareCount": 0,
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
| 40011 | 参数校验失败 |
| 40011 | 版块不存在或已禁用 |
| 40011 | 用户等级不足 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 编辑帖子

**接口信息**

- 路径：`PUT /api/user/forum/posts/{id}`
- 鉴权：是
- 说明：编辑自己的帖子，仅作者可操作

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `sectionId` | Long | 是 | 目标版块ID |
| `title` | String | 是 | 帖子标题，最大128字符 |
| `content` | String | 否 | 帖子正文内容 |
| `status` | Integer | 否 | `0`草稿`1`已发布 |
| `visibilityScope` | Integer | 否 | `0`公开`1`登录可见 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:00:00",
  "data": {
    "id": 20,
    "sectionId": 1,
    "sectionName": "技术交流",
    "authorId": 100,
    "authorName": "张三",
    "title": "修改后的标题",
    "content": "修改后的内容...",
    "status": 1,
    "visibilityScope": 0,
    "isTop": 0,
    "isEssence": 0,
    "viewCount": 0,
    "likeCount": 0,
    "replyCount": 0,
    "collectCount": 0,
    "shareCount": 0,
    "publishedAt": "2025-01-15T10:30:00",
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T11:00:00",
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
| 40011 | 参数校验失败 |
| 40011 | 版块不存在或已禁用 |
| 40401 | 帖子不存在 |
| 40301 | 非作者无权编辑 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 删除帖子

**接口信息**

- 路径：`DELETE /api/user/forum/posts/{id}`
- 鉴权：是
- 说明：删除自己的帖子，仅作者可操作

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 帖子不存在 |
| 40301 | 非作者无权删除 |
| 40011 | 帖子已删除 |
| 40101 | 未登录 |
| 50001 | 系统异常 |
