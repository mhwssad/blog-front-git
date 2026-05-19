# CONTENT HEADER

---


---

## 后台文章管理（需管理员权限）

### 7.1 分页查询文章

**接口信息**
- 路径: `GET /api/sys/articles`
- 鉴权: 必须登录且有 `content:article:query` 权限
- 说明: 后台分页查询文章列表，支持多条件筛选

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键字（匹配标题和摘要） | Spring |
| authorId | Long | 否 | 作者 ID | 8 |
| status | Integer | 否 | 文章状态 | 1 |
| reviewStatus | Integer | 否 | 审核状态 | 0 |
| accessLevel | Integer | 否 | 访问级别 | 0 |
| visibilityScope | Integer | 否 | 可见范围 | 0 |
| categoryId | Long | 否 | 分类 ID | 5 |
| tagId | Long | 否 | 标签 ID | 10 |
| isTop | Integer | 否 | 是否置顶 | 1 |
| isRecommend | Integer | 否 | 是否推荐 | 1 |
| publishTimeStart | String | 否 | 发布时间开始 | 2025-01-01 00:00:00 |
| publishTimeEnd | String | 否 | 发布时间结束 | 2025-01-31 23:59:59 |

**文章状态 status 取值：**
- `0` - 草稿
- `1` - 已发布
- `2` - 待发布
- `3` - 已下架

**审核状态 reviewStatus 取值：**
- `0` - 待审核
- `1` - 审核通过
- `2` - 审核拒绝

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "total": 120,
    "current": 1,
    "size": 10,
    "records": [
      {
        "id": 100,
        "title": "Spring Boot 权威指南",
        "summary": "本文详细介绍 Spring Boot 的核心特性...",
        "coverImage": "https://example.com/cover.jpg",
        "authorId": 8,
        "authorName": "张三",
        "isTop": 1,
        "isRecommend": 1,
        "isOriginal": 1,
        "status": 1,
        "reviewStatus": 1,
        "accessLevel": 0,
        "visibilityScope": 0,
        "viewCount": 1520,
        "likeCount": 128,
        "commentCount": 35,
        "collectCount": 67,
        "shareCount": 12,
        "publishTime": "2025-01-10T08:00:00",
        "scheduledPublishTime": null,
        "createdAt": "2024-12-20T10:00:00",
        "updatedAt": "2025-01-10T08:00:00",
        "remark": "优质文章，已推荐至首页"
      }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | Long | 文章 ID |
| title | String | 文章标题 |
| summary | String | 文章摘要 |
| coverImage | String | 封面图地址 |
| authorId| Long | 作者 ID |
| authorName | String | 作者昵称 |
| isTop | Integer | 是否置顶 |
| isRecommend | Integer | 是否推荐 |
| isOriginal | Integer | 是否原创 |
| status | Integer | 文章状态 |
| reviewStatus | Integer | 审核状态 |
| accessLevel | Integer | 访问级别 |
| visibilityScope | Integer | 可见范围 |
| viewCount | Integer | 浏览数 |
| likeCount | Integer | 点赞数 |
| commentCount | Integer | 评论数 |
| collectCount | Integer | 收藏数 |
| shareCount | Integer | 分享数 |
| publishTime | String | 发布时间 |
| scheduledPublishTime | String | 定时发布时间 |
| createdAt | String | 创建时间 |
| updatedAt | String | 更新时间 |
| remark | String | 备注 |

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40300 | 无权限 |

---

### 7.2 查询文章详情

**接口信息**
- 路径: `GET /api/sys/articles/{id}`
- 鉴权: 必须登录且有 `content:article:query` 权限
- 说明: 后台查询文章的完整详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 100,
    "title": "Spring Boot 权威指南",
    "summary": "本文详细介绍 Spring Boot 的核心特性...",
    "content": "<p>文章正文 HTML 内容...</p>",
    "coverImage": "https://example.com/cover.jpg",
    "authorId": 8,
    "authorName": "张三",
    "isTop": 1,
    "isRecommend": 1,
    "isOriginal": 1,
    "sourceUrl": null,
    "status": 1,
    "reviewStatus": 1,
    "publishTime": "2025-01-10T08:00:00",
    "scheduledPublishTime": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 1520,
    "likeCount": 128,
    "commentCount": 35,
    "collectCount": 67,
    "shareCount": 12,
    "createdAt": "2024-12-20T10:00:00",
    "updatedAt": "2025-01-10T08:00:00",
    "remark": "优质文章，已推荐至首页",
    "categoryIds": [1, 5],
    "tagIds": [10, 11],
    "accessList": [
      {
        "userId": 15,
        "accessType": 1,
        "expireTime": "2025-12-31T23:59:59",
        "grantReason": "VIP用户"
      }
    ],
    "seriesList": []
  }
}
```

**新增字段说明**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| categoryIds | Array | 分类 ID 列表 |
| tagIds | Array | 标签 ID 列表 |
| accessList | Array | 访问授权列表 |

**accessList 子字段**

| 字段 | 类型 | 说明 |
|-----|------|-----|
| userId | Long | 被授权用户 ID |
| accessType | Integer | 授权类型 |
| expireTime | String | 过期时间 |
| grantReason | String | 授权原因 |

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40300 | 无权限 |
| 40400 | 文章不存在 |

---

### 7.3 新增文章

**接口信息**
- 路径: `POST /api/sys/articles`
- 鉴权: 必须登录且有 `content:article:create` 权限
- 说明: 创建新文章

**请求体**

```json
{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "<p>文章正文内容</p>",
  "coverImage": "https://example.com/cover.jpg",
  "authorId": 8,
  "isTop": 0,
  "isRecommend": 0,
  "isOriginal": 1,
  "sourceUrl": null,
  "status": 1,
  "publishTime": "2025-01-10T08:00:00",
  "scheduledPublishTime": null,
  "accessLevel": 0,
  "visibilityScope": 0,
  "remark": "备注信息",
  "categoryIds": [1, 5],
  "tagIds": [10, 11],
  "accessList": []
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| title | String | 是 | 文章标题，最大 128 字符 |
| summary | String | 否 | 文章摘要，最大 2000 字符 |
| content | String | 否 | 文章正文（HTML） |
| coverImage | String | 否 | 封面图地址，最大 512 字符 |
| authorId | Long | 是 | 作者 ID |
| isTop | Integer | 否 | 是否置顶，0-否，1-是 |
| isRecommend | Integer | 否 | 是否推荐，0-否，1-是 |
| isOriginal | Integer | 否 | 是否原创，0-否，1-是 |
| sourceUrl | String | 否 | 来源地址（转载时填写） |
| status | Integer | 否 | 文章状态，0-草稿，1-已发布 |
| publishTime | String | 否 | 发布时间，格式 yyyy-MM-dd HH:mm:ss |
| scheduledPublishTime | String | 否 | 定时发布时间 |
| accessLevel | Integer | 否 | 访问级别，0-免费 |
| visibilityScope | Integer | 否 | 可见范围，0-公开 |
| remark | String | 否 | 备注，最大 256 字符 |
| categoryIds | Array | 否 | 分类 ID 列表 |
| tagIds | Array | 否 | 标签 ID 列表 |
| accessList | Array | 否 | 访问授权列表 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 105,
    "title": "新文章标题",
    "summary": null,
    "content": null,
    "coverImage": null,
    "authorId": 8,
    "authorName": "张三",
    "isTop": 0,
    "isRecommend": 0,
    "isOriginal": 1,
    "sourceUrl": null,
    "status": 1,
    "reviewStatus": 1,
    "publishTime": "2025-01-15T10:30:00",
    "scheduledPublishTime": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0,
    "collectCount": 0,
    "shareCount": 0,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00",
    "remark": null,
    "categoryIds": [1],
    "tagIds": [10],
    "accessList": [],
    "seriesList": []
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |
| 40300 | 无权限 |

---

### 7.4 修改文章

**接口信息**
- 路径: `PUT /api/sys/articles/{id}`
- 鉴权: 必须登录且有 `content:article:update` 权限
- 说明: 修改指定文章的信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

同 7.3 新增文章

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:35:00",
  "data": {
    "id": 105,
    "title": "修改后的标题",
    "summary": "修改后的摘要",
    "content": null,
    "coverImage": null,
    "authorId": 8,
    "authorName": "张三",
    "isTop": 0,
    "isRecommend": 0,
    "isOriginal": 1,
    "sourceUrl": null,
    "status": 1,
    "reviewStatus": 1,
    "publishTime": "2025-01-15T10:30:00",
    "scheduledPublishTime": null,
    "accessLevel": 0,
    "visibilityScope": 0,
    "viewCount": 0,
    "likeCount": 0,
    "commentCount": 0,
    "collectCount": 0,
    "shareCount": 0,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:35:00",
    "remark": null,
    "categoryIds": [1],
    "tagIds": [10],
    "accessList": [],
    "seriesList": []
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |
| 40300 | 无权限 |
| 40400 | 文章不存在 |

---

### 7.5 修改文章状态

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/status`
- 鉴权: 必须登录且有 `content:article:update-status` 权限
- 说明: 修改文章的发布状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "status": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| status | Integer | 是 | 文章状态，0-草稿，1-已发布，2-待发布，3-已下架 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |
| 40300 | 无权限 |
| 40400 | 文章不存在 |

---

### 7.6 切换文章置顶状态

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/top`
- 鉴权: 必须登录且有 `content:article:update` 权限
- 说明: 切换文章的置顶状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| enabled | Boolean | 是 | 是否置顶，true-置顶，false-取消置顶 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40300 | 无权限 |

---

### 7.7 切换文章推荐状态

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/recommend`
- 鉴权: 必须登录且有 `content:article:update` 权限
- 说明: 切换文章的推荐状态

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| enabled | Boolean | 是 | 是否推荐，true-推荐，false-取消推荐 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40300 | 无权限 |

---

### 7.8 配置文章访问名单

**接口信息**
- 路径: `PUT /api/sys/articles/{id}/access`
- 鉴权: 必须登录且有 `content:article:access` 权限
- 说明: 配置文章的访问白名单用户

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体**

```json
{
  "accessList": [
    {
      "userId": 15,
      "accessType": 1,
      "expireTime": "2025-12-31T23:59:59",
      "grantReason": "VIP用户"
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| accessList | Array | 是 | 访问授权列表 |
| accessList[].userId | Long | 是 | 被授权用户 ID |
| accessList[].accessType | Integer | 否 | 授权类型 |
| accessList[].expireTime | String | 否 | 过期时间，格式 yyyy-MM-dd HH:mm:ss |
| accessList[].grantReason | String | 否 | 授权原因 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40001 | 参数校验失败 |
| 40102 | 未登录 |
| 40300 | 无权限 |

---

### 7.9 删除文章

**接口信息**
- 路径: `DELETE /api/sys/articles/{id}`
- 鉴权: 必须登录且有 `content:article:delete` 权限
- 说明: 删除指定文章

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:40:00",
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40300 | 无权限 |
| 40400 | 文章不存在 |

---

