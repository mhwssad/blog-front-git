# 内容域 - 用户文章行为

> 统一响应格式、分页约定、错误码见 [README.md](../README.md#联调统一约定)

---

## 用户文章行为

### 5.1 点赞文章

**接口信息**
- 路径: `POST /api/user/articles/{id}/likes`
- 鉴权: 必须登录
- 说明: 为指定文章点赞

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
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40011 | 非法参数 |

---

### 5.2 取消点赞文章

**接口信息**
- 路径: `DELETE /api/user/articles/{id}/likes`
- 鉴权: 必须登录
- 说明: 取消对指定文章的点赞

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
  "data": null
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |

---

### 5.3 分页查询我的文章

**接口信息**
- 路径: `GET /api/user/articles`
- 鉴权: 必须登录
- 说明: 返回当前用户自己文章的分页列表

**请求参数（Query）**

| 参数 | 类型 | 必填 | 说明 | 示例 |
|-----|------|------|-----|------|
| current | Long | 否 | 页码，默认 1 | 1 |
| size | Long | 否 | 每页条数，默认 10 | 10 |
| keyword | String | 否 | 搜索关键字 | Spring |
| status | Integer | 否 | 文章状态 | 1 |
| reviewStatus | Integer | 否 | 审核状态 | 0 |

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
        "id": 100,
        "title": "Spring Boot 权威指南",
        "summary": "本文详细介绍 Spring Boot 的核心特性...",
        "coverImage": "https://example.com/cover.jpg",
        "status": 1,
        "reviewStatus": 1,
        "viewCount": 1520,
        "likeCount": 128,
        "commentCount": 35,
        "publishTime": "2025-01-10T08:00:00"
      }
    ]
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |

---

### 5.4 查询我的文章详情

**接口信息**
- 路径: `GET /api/user/articles/{id}`
- 鉴权: 必须登录
- 说明: 返回当前用户自己文章的完整详情（含编辑所需信息）

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
    "summary": "本文详细介绍...",
    "content": "<p>正文...</p>",
    "status": 1,
    "reviewStatus": 1,
    "categoryIds": [1, 5],
    "tagIds": [10, 11]
  }
}
```

**错误码**

| code | 说明 |
|-----|------|
| 40102 | 未登录 |
| 40400 | 文章不存在 |

---

### 5.5 配置我的文章访问名单

**接口信息**
- 路径: `PUT /api/user/articles/{id}/access`
- 鉴权: 必须登录
- 说明: 配置当前用户自己文章的访问白名单

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
| accessList[].expireTime | String | 否 | 过期时间 |
| accessList[].grantReason | String | 否 | 授权原因 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

---

### 5.6 提交文章审核

**接口信息**
- 路径: `POST /api/user/articles/{id}/submit-review`
- 鉴权: 必须登录
- 说明: 将文章提交审核

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 文章 ID |

**请求体（可选）**

```json
{
  "remark": "请审核"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| remark | String | 否 | 提交备注 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": null
}
```

---

### 5.7 查询文章审核日志

**接口信息**
- 路径: `GET /api/user/articles/{id}/review-log`
- 鉴权: 必须登录
- 说明: 返回指定文章的审核日志列表

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
  "data": [
    {
      "id": 1,
      "articleId": 100,
      "reviewerId": 1,
      "reviewerName": "管理员",
      "action": "approve",
      "reason": "内容合规",
      "createdAt": "2025-01-12T10:00:00"
    }
  ]
}
```

---

### 5.8 用户文章系列管理

#### 查询我的系列列表

**接口信息**
- 路径: `GET /api/user/article-series`
- 鉴权: 必须登录
- 说明: 返回当前用户的文章系列列表

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": [
    {
      "id": 3,
      "title": "Spring 系列教程",
      "coverImage": "https://example.com/series.jpg",
      "articleCount": 12,
      "sortOrder": 1,
      "visibilityScope": 0
    }
  ]
}
```

#### 查询我的系列详情

**接口信息**
- 路径: `GET /api/user/article-series/{id}`
- 鉴权: 必须登录
- 说明: 返回当前用户指定系列的详情

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

#### 创建系列

**接口信息**
- 路径: `POST /api/user/article-series`
- 鉴权: 必须登录
- 说明: 创建新的文章系列

**请求体**

```json
{
  "title": "新系列",
  "description": "系列描述",
  "coverImage": "https://example.com/cover.jpg",
  "visibilityScope": 0,
  "sortOrder": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| title | String | 是 | 系列标题 |
| description | String | 否 | 系列描述 |
| coverImage | String | 否 | 封面图地址 |
| visibilityScope | Integer | 否 | 可见范围，0-公开 |
| sortOrder | Integer | 否 | 排序序号 |

**响应示例**

```json
{
  "code": 200,
  "message": "成功",
  "timestamp": "2025-01-15T10:30:00",
  "data": {
    "id": 5,
    "title": "新系列",
    "description": "系列描述",
    "coverImage": null,
    "articleCount": 0,
    "sortOrder": 0,
    "visibilityScope": 0
  }
}
```

#### 修改系列

**接口信息**
- 路径: `PUT /api/user/article-series/{id}`
- 鉴权: 必须登录
- 说明: 修改指定系列信息

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求体**

同创建系列。

#### 删除系列

**接口信息**
- 路径: `DELETE /api/user/article-series/{id}`
- 鉴权: 必须登录
- 说明: 删除指定系列

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

#### 向系列加入文章

**接口信息**
- 路径: `POST /api/user/article-series/{id}/articles`
- 鉴权: 必须登录
- 说明: 将文章加入指定系列

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求体**

```json
{
  "articleId": 100,
  "sortOrder": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| articleId | Long | 是 | 文章 ID |
| sortOrder | Integer | 否 | 排序序号 |

#### 从系列移出文章

**接口信息**
- 路径: `DELETE /api/user/article-series/{id}/articles/{articleId}`
- 鉴权: 必须登录
- 说明: 将文章从指定系列中移除

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |
| articleId | Long | 是 | 文章 ID |

#### 调整系列文章顺序

**接口信息**
- 路径: `PUT /api/user/article-series/{id}/articles/sort`
- 鉴权: 必须登录
- 说明: 调整系列内文章的排序

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| id | Long | 是 | 系列 ID |

**请求体**

```json
{
  "articleOrders": [
    { "articleId": 100, "sortOrder": 1 },
    { "articleId": 101, "sortOrder": 2 }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|-----|
| articleOrders | Array | 是 | 文章排序列表 |
| articleOrders[].articleId | Long | 是 | 文章 ID |
| articleOrders[].sortOrder | Integer | 是 | 排序序号 |

---
