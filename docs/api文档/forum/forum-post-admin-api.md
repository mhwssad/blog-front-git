# 后台管理 - 帖子管理

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

> 以下接口均要求后台登录账号，并校验 `content:forum:*` 权限

---

### 分页查询帖子

**接口信息**

- 路径：`GET /api/sys/forum/posts`
- 鉴权：`content:forum:query`
- 说明：分页查询所有帖子，支持多条件筛选

**请求参数**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|-----|------|-----|------|-------|
| `current` | Long | 否 | 页码 | 1 |
| `size` | Long | 否 | 每页数量 | 10 |
| `keyword` | String | 否 | 标题/内容关键字 | - |
| `sectionId` | Long | 否 | 版块ID | - |
| `authorId` | Long | 否 | 作者ID | - |
| `status` | Integer | 否 | 帖子状态 | - |
| `isTop` | Integer | 否 | `0`否`1`是 | - |
| `isEssence` | Integer | 否 | `0`否`1`是 | - |
| `createdAtStart` | DateTime | 否 | 创建时间开始 | - |
| `createdAtEnd` | DateTime | 否 | 创建时间结束 | - |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 50,
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
        "statusName": "已发布",
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
| `records[].status` | Integer | 状态值 |
| `records[].statusName` | String | 状态描述 |
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
| 40301 | 无查询权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 查询帖子详情

**接口信息**

- 路径：`GET /api/sys/forum/posts/{id}`
- 鉴权：`content:forum:query`
- 说明：获取帖子完整信息，包含正文内容

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
    "content": "本文总结了 Spring Boot 开发的最佳实践...",
    "status": 1,
    "statusName": "已发布",
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
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 帖子不存在 |
| 40301 | 无查询权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 隐藏帖子

**接口信息**

- 路径：`PUT /api/sys/forum/posts/{id}/hide`
- 鉴权：`content:forum:update`
- 说明：将帖子设为隐藏状态，仅已发布帖子可隐藏

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T11:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 帖子已删除无法隐藏 |
| 40401 | 帖子不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 恢复帖子

**接口信息**

- 路径：`PUT /api/sys/forum/posts/{id}/restore`
- 鉴权：`content:forum:update`
- 说明：恢复已隐藏的帖子，恢复后状态为已发布

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
| 40011 | 帖子状态不支持恢复 |
| 40401 | 帖子不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 删除帖子

**接口信息**

- 路径：`DELETE /api/sys/forum/posts/{id}`
- 鉴权：`content:forum:delete`
- 说明：软删除帖子，已删除帖子不能重复删除

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T12:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40011 | 帖子已删除 |
| 40401 | 帖子不存在 |
| 40301 | 无删除权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 切换置顶

**接口信息**

- 路径：`PUT /api/sys/forum/posts/{id}/top?enabled=true|false`
- 鉴权：`content:forum:update`
- 说明：设置或取消帖子置顶状态

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `enabled` | Boolean | 是 | `true` 置顶，`false` 取消置顶 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T12:30:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 帖子不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---

### 切换精华

**接口信息**

- 路径：`PUT /api/sys/forum/posts/{id}/essence?enabled=true|false`
- 鉴权：`content:forum:update`
- 说明：设置或取消帖子精华状态，设为精华时会通知帖子作者

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| `enabled` | Boolean | 是 | `true` 精华，`false` 取消精华 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T13:00:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40401 | 帖子不存在 |
| 40301 | 无修改权限 |
| 40101 | 未登录 |
| 50001 | 系统异常 |

---
